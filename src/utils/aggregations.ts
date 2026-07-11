import type { CostEntry, CategorySummary, TypeSummary, ProductSummary } from "../types";
import { formatBRL } from "./formatters";

/**
 * Computes the sum of all `valor` values from the given entries.
 * Returns 0 for an empty array.
 */
export function computeTotal(entries: CostEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.valor, 0);
}

/**
 * Groups entries by category, sums valor for each group, computes percentage
 * of grand total, and sorts by total descending.
 * Only includes categories that have entries.
 */
export function groupByCategory(entries: CostEntry[]): CategorySummary[] {
  const grandTotal = computeTotal(entries);

  const categoryMap = new Map<string, number>();

  for (const entry of entries) {
    const current = categoryMap.get(entry.categoria) ?? 0;
    categoryMap.set(entry.categoria, current + entry.valor);
  }

  const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(
    ([name, total]) => ({
      name,
      total,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      formattedTotal: formatBRL(total),
    })
  );

  categories.sort((a, b) => b.total - a.total);

  return categories;
}

/**
 * Groups entries by type ("Fixo" and "Variável").
 * ALWAYS returns both groups even if one has no entries.
 * Includes count of entries and percentage.
 */
export function groupByType(entries: CostEntry[]): TypeSummary[] {
  const grandTotal = computeTotal(entries);

  const fixoEntries = entries.filter((e) => e.tipo === "Fixo");
  const variavelEntries = entries.filter((e) => e.tipo === "Variável");

  const fixoTotal = fixoEntries.reduce((sum, e) => sum + e.valor, 0);
  const variavelTotal = variavelEntries.reduce((sum, e) => sum + e.valor, 0);

  return [
    {
      type: "Fixo",
      total: fixoTotal,
      count: fixoEntries.length,
      percentage: grandTotal > 0 ? (fixoTotal / grandTotal) * 100 : 0,
      formattedTotal: formatBRL(fixoTotal),
    },
    {
      type: "Variável",
      total: variavelTotal,
      count: variavelEntries.length,
      percentage: grandTotal > 0 ? (variavelTotal / grandTotal) * 100 : 0,
      formattedTotal: formatBRL(variavelTotal),
    },
  ];
}

/**
 * Groups entries by product ("Coffstack" and "BitWord").
 * ALWAYS returns both groups even if one has no entries.
 * Zero values for empty product.
 */
export function groupByProduct(entries: CostEntry[]): ProductSummary[] {
  const grandTotal = computeTotal(entries);

  const coffstackEntries = entries.filter((e) => e.produto === "Coffstack");
  const bitwordEntries = entries.filter((e) => e.produto === "BitWord");

  const coffstackTotal = coffstackEntries.reduce((sum, e) => sum + e.valor, 0);
  const bitwordTotal = bitwordEntries.reduce((sum, e) => sum + e.valor, 0);

  return [
    {
      name: "Coffstack",
      total: coffstackTotal,
      percentage: grandTotal > 0 ? (coffstackTotal / grandTotal) * 100 : 0,
      formattedTotal: formatBRL(coffstackTotal),
    },
    {
      name: "BitWord",
      total: bitwordTotal,
      percentage: grandTotal > 0 ? (bitwordTotal / grandTotal) * 100 : 0,
      formattedTotal: formatBRL(bitwordTotal),
    },
  ];
}

/**
 * Generic utility to add a percentage field to groups.
 * If grandTotal is 0, all percentages are set to 0.
 */
export function computePercentages<T extends { total: number }>(
  groups: T[],
  grandTotal: number
): (T & { percentage: number })[] {
  return groups.map((group) => ({
    ...group,
    percentage: grandTotal > 0 ? (group.total / grandTotal) * 100 : 0,
  }));
}
