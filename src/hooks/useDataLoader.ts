import { useState, useEffect, useCallback, useRef } from "react";
import type { CostEntry, Category, RevenueEntry } from "../types";

interface UseDataLoaderResult {
  entries: CostEntry[];
  revenueEntries: RevenueEntry[];
  months: string[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const GOOGLE_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1SZKACj7cLnIF6wBjHqk9V8N-xEIwfGjezmqUQOgYzHc/gviz/tq?tqx=out:csv&sheet=Custos";

const GOOGLE_SHEETS_REVENUE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1SZKACj7cLnIF6wBjHqk9V8N-xEIwfGjezmqUQOgYzHc/gviz/tq?tqx=out:csv&sheet=Receita";

/**
 * Parse an RFC-compliant CSV string into a 2D array of strings.
 * Handles quoted fields, escaped quotes (""), and newlines within quotes.
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ("")
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        field += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (char === "\r") {
        // Handle \r\n or standalone \r
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
        if (i < text.length && text[i] === "\n") {
          i++;
        }
      } else if (char === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
      } else {
        field += char;
        i++;
      }
    }
  }

  // Push last field/row if there's remaining content
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Normalize category strings from the spreadsheet to match the Category type.
 * Maps "Ferramentas / SaaS" → "Ferramentas/SaaS", etc.
 */
function normalizeCategory(raw: string): Category {
  const categoryMap: Record<string, Category> = {
    "Ferramentas / SaaS": "Ferramentas/SaaS",
    "Ferramentas/SaaS": "Ferramentas/SaaS",
    "Equipe / Prestadores": "Equipe/Prestadores",
    "Equipe/Prestadores": "Equipe/Prestadores",
    "Contabilidade / Jurídico": "Contabilidade/Jurídico",
    "Contabilidade/Jurídico": "Contabilidade/Jurídico",
    "Taxas e Impostos": "Taxas e Impostos",
    "Hospedagem/Cloud": "Hospedagem/Cloud",
    "Hospedagem / Cloud": "Hospedagem/Cloud",
    Marketing: "Marketing",
  };
  return categoryMap[raw.trim()] || (raw.trim() as Category);
}

/**
 * Parse Brazilian currency format "R$ 1.109,18" → 1109.18
 * Handles variations: extra spaces, non-breaking spaces, quoted values, etc.
 */
function parseValor(raw: string): number {
  // Remove "R$ " prefix (including non-breaking spaces), trim whitespace
  let cleaned = raw.trim().replace(/^R\$[\s\u00A0]*/, "");
  // Remove any remaining non-breaking spaces or extra whitespace
  cleaned = cleaned.replace(/[\s\u00A0]+/g, "");
  // Remove dot thousand separators
  cleaned = cleaned.replace(/\./g, "");
  // Replace comma decimal separator with dot
  cleaned = cleaned.replace(",", ".");
  // Remove any trailing/leading non-numeric characters (except minus and dot)
  cleaned = cleaned.replace(/[^\d.\-]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

/**
 * Normalize product strings from the spreadsheet.
 * Strips invisible unicode characters (zero-width spaces, BOM, non-breaking
 * spaces) that Google Sheets can embed in exported CSV cells (often from
 * data-validation/dropdown cells), then matches case-insensitively against
 * the known canonical product names. Falls back to the cleaned/trimmed
 * value if no known match is found.
 */
function normalizeProduto(raw: string): string {
  const cleaned = raw
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "") // strip invisible chars
    .trim();
  const lower = cleaned.toLowerCase();
  if (lower === "coffstack") return "Coffstack";
  if (lower === "bitword") return "BitWord";
  return cleaned;
}

/**
 * Convert "DD/MM/YYYY" to "YYYY-MM" format.
 */
function parseData(raw: string): string {
  const trimmed = raw.trim();
  // Expected format: DD/MM/YYYY
  const parts = trimmed.split("/");
  if (parts.length === 3) {
    const [, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}`;
  }
  // If already in YYYY-MM format or other, return as-is
  return trimmed;
}

/**
 * Find the actual header row index by searching for a row containing a keyword.
 * Google Sheets exports may include title/instruction rows before the actual headers.
 * Prefers exact cell matches over partial matches to avoid matching instruction text.
 */
function findHeaderRowIndex(rows: string[][], keyword: string): number {
  const maxSearch = Math.min(rows.length, 10);
  // First pass: look for a row where a cell exactly equals the keyword
  for (let i = 0; i < maxSearch; i++) {
    const rowCells = rows[i].map((c) => c.toLowerCase().trim());
    if (rowCells.some((cell) => cell === keyword)) {
      return i;
    }
  }
  // Second pass: fallback to partial match
  for (let i = 0; i < maxSearch; i++) {
    const rowCells = rows[i].map((c) => c.toLowerCase().trim());
    if (rowCells.some((cell) => cell.includes(keyword))) {
      return i;
    }
  }
  // Fallback: assume first row is header
  return 0;
}

/**
 * Convert CSV rows (excluding header) into CostEntry[] objects.
 * Dynamically detects the header row to handle title/instruction rows
 * that Google Sheets may include before the actual headers.
 */
function csvRowsToCostEntries(rows: string[][]): CostEntry[] {
  if (rows.length < 2) return [];

  // Find the actual header row (contains "produto")
  const headerRowIndex = findHeaderRowIndex(rows, "produto");

  const dataRows = rows.slice(headerRowIndex + 1);
  const entries: CostEntry[] = [];

  for (const row of dataRows) {
    // Skip rows where Produto (col B, index 1) or Data (col A, index 0) is empty
    const rawData = row[0]?.trim() || "";
    const rawProduto = row[1]?.trim() || "";

    if (!rawData || !rawProduto) {
      continue;
    }

    const entry: CostEntry = {
      data: parseData(rawData),
      produto: normalizeProduto(rawProduto) as CostEntry["produto"],
      categoria: normalizeCategory(row[2] || ""),
      descricao: (row[3] || "").trim(),
      fornecedor: (row[4] || "").trim(),
      valor: parseValor(row[5] || ""),
      tipo: (row[6] || "").trim() as CostEntry["tipo"],
      essencial: (row[7] || "").trim() === "Sim",
      observacoes: (row[8] || "").trim(),
    };

    entries.push(entry);
  }

  return entries;
}

/**
 * Find a column index by matching header text (case-insensitive).
 * Returns the index of the SHORTEST header cell that contains all keywords.
 * This avoids matching long merged title/instruction cells that Google Sheets
 * exports can produce (which may contain keywords as incidental substrings).
 * Returns -1 if no cell matches.
 */
function findColumnIndex(headers: string[], ...keywords: string[]): number {
  let bestIndex = -1;
  let bestLen = Infinity;
  headers.forEach((header, idx) => {
    const lower = header.toLowerCase().trim();
    if (lower && keywords.every((kw) => lower.includes(kw.toLowerCase()))) {
      if (lower.length < bestLen) {
        bestIndex = idx;
        bestLen = lower.length;
      }
    }
  });
  return bestIndex;
}

/**
 * Convert CSV rows into RevenueEntry[] objects.
 * Uses header row to dynamically detect column positions, making it resilient
 * to column reordering in the spreadsheet.
 * Dynamically finds the header row to handle title/instruction rows
 * that Google Sheets may include before the actual headers.
 */
function csvRowsToRevenueEntries(rows: string[][]): RevenueEntry[] {
  if (rows.length < 2) return [];

  // Find the actual header row (contains "produto")
  const headerRowIndex = findHeaderRowIndex(rows, "produto");

  const headers = rows[headerRowIndex].map((h) => h.trim());

  // Dynamically find column indices based on header names
  const dateCol = findColumnIndex(headers, "mês");
  const dateColAlt = dateCol === -1 ? findColumnIndex(headers, "data") : dateCol;
  const actualDateCol = dateCol !== -1 ? dateCol : dateColAlt;

  const produtoCol = findColumnIndex(headers, "produto");
  // Try specific match first, then broader match with just "receita"
  let receitaCol = findColumnIndex(headers, "receita", "quida");
  if (receitaCol === -1) {
    receitaCol = findColumnIndex(headers, "receita");
  }

  // Fallback to hardcoded indices if headers aren't found
  const finalDateCol = actualDateCol !== -1 ? actualDateCol : 0;
  const finalProdutoCol = produtoCol !== -1 ? produtoCol : 1;
  const finalReceitaCol = receitaCol !== -1 ? receitaCol : 3;

  const dataRows = rows.slice(headerRowIndex + 1);

  const entries: RevenueEntry[] = [];

  for (const row of dataRows) {
    const rawData = row[finalDateCol]?.trim() || "";
    const rawProduto = row[finalProdutoCol]?.trim() || "";
    const rawReceitaLiquida = row[finalReceitaCol]?.trim() || "";

    // Skip rows with no date, no product, or no/invalid revenue value
    if (!rawData || !rawProduto) {
      continue;
    }

    // Skip rows where revenue is empty, a dash, or zero-like
    if (!rawReceitaLiquida || rawReceitaLiquida === "-" || rawReceitaLiquida === "0") {
      continue;
    }

    // Validate date looks like DD/MM/YYYY or similar date format
    if (!/\d/.test(rawData)) {
      continue;
    }

    const receitaLiquida = parseValor(rawReceitaLiquida);
    if (receitaLiquida === 0) {
      continue;
    }

    entries.push({
      data: parseData(rawData),
      produto: normalizeProduto(rawProduto) as RevenueEntry["produto"],
      receitaLiquida,
    });
  }

  return entries;
}

function extractMonths(entries: CostEntry[]): string[] {
  const monthSet = new Set<string>();
  for (const entry of entries) {
    if (entry.data) {
      const month = entry.data.slice(0, 7); // "YYYY-MM"
      monthSet.add(month);
    }
  }
  return Array.from(monthSet).sort();
}

export function useDataLoader(): UseDataLoaderResult {
  const [entries, setEntries] = useState<CostEntry[]>([]);
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    setLoading(true);
    setError(null);

    try {
      let costData: CostEntry[];
      let revenueData: RevenueEntry[] = [];

      try {
        // Fetch both sheets in parallel
        const [costsResponse, revenueResponse] = await Promise.all([
          fetch(GOOGLE_SHEETS_CSV_URL, { signal: controller.signal }),
          fetch(GOOGLE_SHEETS_REVENUE_CSV_URL, { signal: controller.signal }),
        ]);

        if (!costsResponse.ok) {
          throw new Error(
            `Falha ao carregar dados do Google Sheets: ${costsResponse.status} ${costsResponse.statusText}`
          );
        }

        const costsCsvText = await costsResponse.text();
        const costsRows = parseCSV(costsCsvText);
        costData = csvRowsToCostEntries(costsRows);

        if (revenueResponse.ok) {
          const revenueCsvText = await revenueResponse.text();
          const revenueRows = parseCSV(revenueCsvText);
          revenueData = csvRowsToRevenueEntries(revenueRows);
        }
      } catch (sheetError: unknown) {
        // If Google Sheets fails, fall back to local JSON
        if (
          sheetError instanceof Error &&
          sheetError.name === "AbortError"
        ) {
          // Don't fallback on abort — propagate the timeout
          throw sheetError;
        }

        const fallbackResponse = await fetch("data/costs.json", {
          signal: controller.signal,
        });

        if (!fallbackResponse.ok) {
          throw new Error(
            `Falha ao carregar dados: ${fallbackResponse.status} ${fallbackResponse.statusText}`
          );
        }

        costData = await fallbackResponse.json();
        revenueData = [];
      }

      const sortedMonths = extractMonths(costData);

      setEntries(costData);
      setRevenueEntries(revenueData);
      setMonths(sortedMonths);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError(
            "Tempo limite excedido. Não foi possível carregar os dados em 10 segundos."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Erro desconhecido ao carregar dados.");
      }
      setEntries([]);
      setRevenueEntries([]);
      setMonths([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { entries, revenueEntries, months, loading, error, retry };
}

// Export helpers for testing
export {
  parseCSV,
  parseValor,
  parseData,
  normalizeCategory,
  normalizeProduto,
  csvRowsToCostEntries,
  csvRowsToRevenueEntries,
  findColumnIndex,
  findHeaderRowIndex,
};
