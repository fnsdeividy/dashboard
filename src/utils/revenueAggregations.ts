import type { CostEntry, RevenueEntry, MonthlyFinancialSummary, ProductFilter } from "../types";

/**
 * Portuguese month abbreviations for labels.
 */
const MONTH_LABELS: Record<string, string> = {
  "01": "Jan",
  "02": "Fev",
  "03": "Mar",
  "04": "Abr",
  "05": "Mai",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Set",
  "10": "Out",
  "11": "Nov",
  "12": "Dez",
};

/**
 * Converts "YYYY-MM" to a short label like "Jan/26"
 */
function toMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-");
  const abbrev = MONTH_LABELS[monthNum] || monthNum;
  const shortYear = year.slice(2);
  return `${abbrev}/${shortYear}`;
}

/**
 * Computes monthly financial summaries combining cost and revenue data.
 * For each month, calculates total costs, total revenue, profit, and margin.
 * Applies product filter to both costs and revenue.
 */
export function computeMonthlyFinancials(
  costEntries: CostEntry[],
  revenueEntries: RevenueEntry[],
  months: string[],
  selectedProduct: ProductFilter
): MonthlyFinancialSummary[] {
  // Get all unique months from both sources
  const allMonths = new Set<string>(months);
  for (const entry of revenueEntries) {
    allMonths.add(entry.data);
  }

  const sortedMonths = Array.from(allMonths).sort();

  return sortedMonths.map((month) => {
    // Filter costs by month and product
    const monthCosts = costEntries.filter((e) => {
      const matchMonth = e.data === month;
      const matchProduct = selectedProduct === "Todos" || e.produto === selectedProduct;
      return matchMonth && matchProduct;
    });

    // Filter revenue by month and product
    const monthRevenue = revenueEntries.filter((e) => {
      const matchMonth = e.data === month;
      const matchProduct = selectedProduct === "Todos" || e.produto === selectedProduct;
      return matchMonth && matchProduct;
    });

    const totalCosts = monthCosts.reduce((sum, e) => sum + e.valor, 0);
    const totalRevenue = monthRevenue.reduce((sum, e) => sum + e.receitaLiquida, 0);
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      month,
      monthLabel: toMonthLabel(month),
      totalCosts,
      totalRevenue,
      profit,
      profitMargin,
    };
  });
}

/**
 * Computes monthly financial summaries for a specific product.
 * Filters both costs and revenue entries to the given product,
 * then calculates monthly totals, profit, and margin.
 */
export function computeProductBreakEven(
  costEntries: CostEntry[],
  revenueEntries: RevenueEntry[],
  months: string[],
  product: "Coffstack" | "BitWord"
): MonthlyFinancialSummary[] {
  return computeMonthlyFinancials(costEntries, revenueEntries, months, product);
}
