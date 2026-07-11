import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { filterByMonth, filterByProduct, getLatestMonthWithData } from "./filters";
import type { CostEntry, Category } from "../types";

// --- Arbitraries ---

const categories: Category[] = [
  "Ferramentas/SaaS",
  "Taxas e Impostos",
  "Equipe/Prestadores",
  "Contabilidade/Jurídico",
  "Hospedagem/Cloud",
  "Marketing",
];

const products: ("Coffstack" | "BitWord")[] = ["Coffstack", "BitWord"];

const months = [
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
];

const arbMonth = fc.constantFrom(...months);

const arbProduct = fc.constantFrom<"Coffstack" | "BitWord">(...products);


const arbCostEntry: fc.Arbitrary<CostEntry> = fc.record({
  data: arbMonth,
  produto: arbProduct,
  categoria: fc.constantFrom<Category>(...categories),
  descricao: fc.string({ minLength: 1, maxLength: 20 }),
  fornecedor: fc.string({ minLength: 1, maxLength: 20 }),
  valor: fc.float({ min: 0, max: 100000, noNaN: true }),
  tipo: fc.constantFrom<"Fixo" | "Variável">("Fixo", "Variável"),
  essencial: fc.boolean(),
  observacoes: fc.string({ maxLength: 50 }),
});

const arbCostEntries = fc.array(arbCostEntry, { minLength: 0, maxLength: 30 });

// --- Property Tests ---

// Feature: financial-dashboard, Property 1: Month filtering returns only matching entries
describe("Property 1: Month filtering returns only matching entries", () => {
  /**
   * Validates: Requirements 1.2
   *
   * For any set of cost entries and any selected month, filtering by that month
   * SHALL return only entries whose `data` field matches the selected month,
   * and SHALL not omit any entries that do match.
   */
  it("all returned entries have data matching the selected month", () => {
    fc.assert(
      fc.property(arbCostEntries, arbMonth, (entries, month) => {
        const result = filterByMonth(entries, month);

        // All returned entries must match the selected month
        for (const entry of result) {
          expect(entry.data.startsWith(month)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("no matching entries are omitted", () => {
    fc.assert(
      fc.property(arbCostEntries, arbMonth, (entries, month) => {
        const result = filterByMonth(entries, month);

        // Count entries that match the month in the original array
        const expectedCount = entries.filter((e) => e.data.startsWith(month)).length;

        expect(result.length).toBe(expectedCount);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: financial-dashboard, Property 2: Default month is the latest month with data
describe("Property 2: Default month is the latest month with data", () => {
  /**
   * Validates: Requirements 1.3
   *
   * For any non-empty set of cost entries spanning multiple months,
   * the computed default month SHALL be the chronologically latest month
   * that contains at least one entry.
   */
  it("result is the chronologically latest month with data", () => {
    // Generate entries that span at least one month
    const arbNonEmptyEntries = fc.array(arbCostEntry, { minLength: 1, maxLength: 30 });

    fc.assert(
      fc.property(arbNonEmptyEntries, (entries) => {
        // Use the sorted months list as available months
        const availableMonths = [...months];
        const result = getLatestMonthWithData(entries, availableMonths);

        // Find months that actually have data
        const monthsWithData = availableMonths.filter((m) =>
          entries.some((e) => e.data.startsWith(m))
        );

        if (monthsWithData.length > 0) {
          // The result should be the latest month that has data
          const latestMonthWithData = monthsWithData[monthsWithData.length - 1];
          expect(result).toBe(latestMonthWithData);
        } else {
          // Fallback: last available month
          expect(result).toBe(availableMonths[availableMonths.length - 1]);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("returns empty string when no months are available", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = getLatestMonthWithData(entries, []);
        expect(result).toBe("");
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: financial-dashboard, Property 3: Product filtering returns only matching entries
describe("Property 3: Product filtering returns only matching entries", () => {
  /**
   * Validates: Requirements 2.2, 2.3
   *
   * For any set of cost entries and any product filter value, filtering SHALL return
   * only entries whose `produto` field matches the filter when a single product is selected,
   * or SHALL return all entries when "Todos" is selected.
   */
  it("'Todos' returns all entries unchanged", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = filterByProduct(entries, "Todos");
        expect(result).toEqual(entries);
      }),
      { numRuns: 100 }
    );
  });

  it("single product filter returns only entries matching that product", () => {
    fc.assert(
      fc.property(arbCostEntries, arbProduct, (entries, product) => {
        const result = filterByProduct(entries, product);

        // All returned entries must match the product
        for (const entry of result) {
          expect(entry.produto).toBe(product);
        }

        // No matching entries are omitted
        const expectedCount = entries.filter((e) => e.produto === product).length;
        expect(result.length).toBe(expectedCount);
      }),
      { numRuns: 100 }
    );
  });
});
