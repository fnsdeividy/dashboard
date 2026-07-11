import type { CostEntry, SortColumn } from "../types";

const STRING_COLUMNS: SortColumn[] = ["descricao", "fornecedor", "categoria", "tipo"];

export function sortEntries(
  entries: CostEntry[],
  column: SortColumn,
  direction: "asc" | "desc"
): CostEntry[] {
  const sorted = [...entries];
  const modifier = direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    if (STRING_COLUMNS.includes(column)) {
      const aVal = a[column] as string;
      const bVal = b[column] as string;
      return modifier * aVal.localeCompare(bVal, "pt-BR");
    }

    if (column === "valor") {
      return modifier * (a.valor - b.valor);
    }

    // essencial (boolean)
    const aVal = a.essencial ? 1 : 0;
    const bVal = b.essencial ? 1 : 0;
    return modifier * (aVal - bVal);
  });

  return sorted;
}
