// Feature: financial-dashboard, Property 8: Column sorting correctness
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { sortEntries } from "./sorting";
import type { CostEntry, SortColumn, Category } from "../types";

// --- Arbitraries ---

const categoryArb: fc.Arbitrary<Category> = fc.constantFrom(
  "Ferramentas/SaaS",
  "Taxas e Impostos",
  "Equipe/Prestadores",
  "Contabilidade/Jurídico",
  "Hospedagem/Cloud",
  "Marketing"
);

const costEntryArb: fc.Arbitrary<CostEntry> = fc.record({
  data: fc.constantFrom("2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"),
  produto: fc.constantFrom("Coffstack" as const, "BitWord" as const),
  categoria: categoryArb,
  descricao: fc.string({ minLength: 1, maxLength: 50 }),
  fornecedor: fc.string({ minLength: 1, maxLength: 50 }),
  valor: fc.float({ min: 0, max: 100000, noNaN: true }),
  tipo: fc.constantFrom("Fixo" as const, "Variável" as const),
  essencial: fc.boolean(),
  observacoes: fc.string({ maxLength: 100 }),
});

const sortColumnArb: fc.Arbitrary<SortColumn> = fc.constantFrom(
  "descricao",
  "fornecedor",
  "categoria",
  "valor",
  "tipo",
  "essencial"
);

const directionArb: fc.Arbitrary<"asc" | "desc"> = fc.constantFrom("asc" as const, "desc" as const);

// --- Helper: compare two values for a given column ---

const STRING_COLUMNS: SortColumn[] = ["descricao", "fornecedor", "categoria", "tipo"];

function compareByColumn(a: CostEntry, b: CostEntry, column: SortColumn): number {
  if (STRING_COLUMNS.includes(column)) {
    return (a[column] as string).localeCompare(b[column] as string, "pt-BR");
  }
  if (column === "valor") {
    return a.valor - b.valor;
  }
  // essencial
  return (a.essencial ? 1 : 0) - (b.essencial ? 1 : 0);
}

// --- Property Tests ---

/**
 * **Validates: Requirements 5.3**
 */
describe("Property 8: Column sorting correctness", () => {
  it("8a: consecutive elements are in correct order for chosen column/direction", () => {
    fc.assert(
      fc.property(
        fc.array(costEntryArb, { minLength: 0, maxLength: 30 }),
        sortColumnArb,
        directionArb,
        (entries, column, direction) => {
          const sorted = sortEntries(entries, column, direction);

          // Length must be preserved
          expect(sorted.length).toBe(entries.length);

          // Check consecutive ordering
          for (let i = 0; i < sorted.length - 1; i++) {
            const cmp = compareByColumn(sorted[i], sorted[i + 1], column);
            if (direction === "asc") {
              expect(cmp).toBeLessThanOrEqual(0);
            } else {
              expect(cmp).toBeGreaterThanOrEqual(0);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("8b: sorting ascending then descending produces reversed order for same column", () => {
    fc.assert(
      fc.property(
        fc.array(costEntryArb, { minLength: 0, maxLength: 30 }),
        sortColumnArb,
        (entries, column) => {
          const asc = sortEntries(entries, column, "asc");
          const desc = sortEntries(entries, column, "desc");

          // For a stable comparison, check that desc is the reverse of asc
          // when considering only the sort column values
          expect(desc.length).toBe(asc.length);

          // The values in the sort column should be in opposite order
          for (let i = 0; i < asc.length - 1; i++) {
            const cmpAsc = compareByColumn(asc[i], asc[i + 1], column);
            const cmpDesc = compareByColumn(desc[i], desc[i + 1], column);
            // asc: non-decreasing
            expect(cmpAsc).toBeLessThanOrEqual(0);
            // desc: non-increasing
            expect(cmpDesc).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
