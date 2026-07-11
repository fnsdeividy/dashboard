import type { CostEntry, ProductFilter } from "../types";

/**
 * Filters entries whose `data` field starts with the given month string (format: "YYYY-MM").
 */
export function filterByMonth(entries: CostEntry[], month: string): CostEntry[] {
  return entries.filter((entry) => entry.data.startsWith(month));
}

/**
 * Filters entries by product. When product is "Todos", returns all entries.
 * Otherwise, returns only entries whose `produto` field matches the given product.
 */
export function filterByProduct(entries: CostEntry[], product: ProductFilter): CostEntry[] {
  if (product === "Todos") {
    return entries;
  }
  return entries.filter((entry) => entry.produto === product);
}

/**
 * Applies both month and product filters in sequence.
 */
export function applyFilters(entries: CostEntry[], month: string, product: ProductFilter): CostEntry[] {
  return filterByProduct(filterByMonth(entries, month), product);
}

/**
 * Returns the latest month (from availableMonths) that has at least one matching entry.
 * If no months have data, returns the last available month.
 * Assumes availableMonths is sorted chronologically.
 */
export function getLatestMonthWithData(entries: CostEntry[], availableMonths: string[]): string {
  if (availableMonths.length === 0) {
    return "";
  }

  for (let i = availableMonths.length - 1; i >= 0; i--) {
    const month = availableMonths[i];
    if (entries.some((entry) => entry.data.startsWith(month))) {
      return month;
    }
  }

  return availableMonths[availableMonths.length - 1];
}
