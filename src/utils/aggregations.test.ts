import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { CostEntry, Category } from "../types";
import { computeTotal, groupByCategory, groupByType, groupByProduct } from "./aggregations";

// --- Arbitraries ---

const categories: Category[] = [
  "Ferramentas/SaaS",
  "Taxas e Impostos",
  "Equipe/Prestadores",
  "Contabilidade/Jurídico",
  "Hospedagem/Cloud",
  "Marketing",
];

const arbCategory = fc.constantFrom(...categories);
const arbProduct = fc.constantFrom("Coffstack" as const, "BitWord" as const);
const arbType = fc.constantFrom("Fixo" as const, "Variável" as const);

const arbCostEntry: fc.Arbitrary<CostEntry> = fc.record({
  data: fc.constantFrom("2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"),
  produto: arbProduct,
  categoria: arbCategory,
  descricao: fc.string({ minLength: 1, maxLength: 20 }),
  fornecedor: fc.string({ minLength: 1, maxLength: 20 }),
  valor: fc.double({ min: 0.01, max: 100000, noNaN: true, noDefaultInfinity: true }),
  tipo: arbType,
  essencial: fc.boolean(),
  observacoes: fc.string({ maxLength: 50 }),
});

const arbNonEmptyCostEntries = fc.array(arbCostEntry, { minLength: 1, maxLength: 50 });
const arbCostEntries = fc.array(arbCostEntry, { minLength: 0, maxLength: 50 });

// --- Property 5: Category breakdown correctness ---
// Feature: financial-dashboard, Property 5: Category breakdown correctness
// **Validates: Requirements 4.1, 4.3**
describe("Property 5: Category breakdown correctness", () => {
  it("(a) every entry is accounted for in exactly one group", () => {
    fc.assert(
      fc.property(arbNonEmptyCostEntries, (entries) => {
        const result = groupByCategory(entries);

        // Total count of entries across all groups should equal input count
        // We verify by checking each group's total matches entries for that category
        const totalEntriesInGroups = result.reduce((sum, group) => {
          const entriesInCategory = entries.filter((e) => e.categoria === group.name);
          return sum + entriesInCategory.length;
        }, 0);

        expect(totalEntriesInGroups).toBe(entries.length);
      }),
      { numRuns: 100 }
    );
  });

  it("(b) each group's total equals the sum of its entries' valor values", () => {
    fc.assert(
      fc.property(arbNonEmptyCostEntries, (entries) => {
        const result = groupByCategory(entries);

        for (const group of result) {
          const expectedTotal = entries
            .filter((e) => e.categoria === group.name)
            .reduce((sum, e) => sum + e.valor, 0);
          expect(group.total).toBeCloseTo(expectedTotal, 5);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("(c) all group percentages sum to 100% within rounding tolerance", () => {
    fc.assert(
      fc.property(arbNonEmptyCostEntries, (entries) => {
        const result = groupByCategory(entries);
        const percentageSum = result.reduce((sum, group) => sum + group.percentage, 0);
        expect(Math.abs(percentageSum - 100)).toBeLessThan(0.1);
      }),
      { numRuns: 100 }
    );
  });

  it("(d) groups are sorted in descending order by total", () => {
    fc.assert(
      fc.property(arbNonEmptyCostEntries, (entries) => {
        const result = groupByCategory(entries);

        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].total).toBeGreaterThanOrEqual(result[i + 1].total);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 6: Type breakdown correctness ---
// Feature: financial-dashboard, Property 6: Type breakdown correctness
// **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
describe("Property 6: Type breakdown correctness", () => {
  it("always produces exactly two groups (Fixo and Variável)", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = groupByType(entries);
        expect(result).toHaveLength(2);
        expect(result.map((r) => r.type).sort()).toEqual(["Fixo", "Variável"]);
      }),
      { numRuns: 100 }
    );
  });

  it("(a) each group's total equals the sum of matching entries' valor", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = groupByType(entries);

        for (const group of result) {
          const expectedTotal = entries
            .filter((e) => e.tipo === group.type)
            .reduce((sum, e) => sum + e.valor, 0);
          expect(group.total).toBeCloseTo(expectedTotal, 5);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("(b) each group's count equals the number of matching entries", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = groupByType(entries);

        for (const group of result) {
          const expectedCount = entries.filter((e) => e.tipo === group.type).length;
          expect(group.count).toBe(expectedCount);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("(c) percentages sum to 100% for non-empty sets or are both 0% for empty sets", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = groupByType(entries);
        const percentageSum = result.reduce((sum, group) => sum + group.percentage, 0);

        if (entries.length === 0) {
          expect(result[0].percentage).toBe(0);
          expect(result[1].percentage).toBe(0);
        } else {
          expect(Math.abs(percentageSum - 100)).toBeLessThan(0.1);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 7: Product comparison correctness ---
// Feature: financial-dashboard, Property 7: Product comparison correctness
// **Validates: Requirements 7.1, 7.2, 7.4**
describe("Property 7: Product comparison correctness", () => {
  it("always produces exactly two groups (Coffstack and BitWord)", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = groupByProduct(entries);
        expect(result).toHaveLength(2);
        expect(result.map((r) => r.name).sort()).toEqual(["BitWord", "Coffstack"]);
      }),
      { numRuns: 100 }
    );
  });

  it("(a) each group's total equals the sum of that product's entries", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = groupByProduct(entries);

        for (const group of result) {
          const expectedTotal = entries
            .filter((e) => e.produto === group.name)
            .reduce((sum, e) => sum + e.valor, 0);
          expect(group.total).toBeCloseTo(expectedTotal, 5);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("(b) percentages sum to 100% for non-empty sets or are both 0% for empty sets", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = groupByProduct(entries);
        const percentageSum = result.reduce((sum, group) => sum + group.percentage, 0);

        if (entries.length === 0) {
          expect(result[0].percentage).toBe(0);
          expect(result[1].percentage).toBe(0);
        } else {
          expect(Math.abs(percentageSum - 100)).toBeLessThan(0.1);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 9: Total computation is sum of filtered entries ---
// Feature: financial-dashboard, Property 9: Total computation is sum of filtered entries
// **Validates: Requirements 3.1, 3.2**
describe("Property 9: Total computation is sum of filtered entries", () => {
  it("computeTotal equals the arithmetic sum of all valor values", () => {
    fc.assert(
      fc.property(arbCostEntries, (entries) => {
        const result = computeTotal(entries);
        const expectedSum = entries.reduce((sum, e) => sum + e.valor, 0);
        expect(result).toBeCloseTo(expectedSum, 5);
      }),
      { numRuns: 100 }
    );
  });

  it("computeTotal returns 0 for an empty set", () => {
    expect(computeTotal([])).toBe(0);
  });
});
