import { useState, useMemo, useCallback } from "react";
import type { ProductFilter, SortColumn } from "../types";
import { useData } from "./DataProvider";
import { FilterBar } from "./FilterBar";
import { KPICards } from "./KPICards";
import { RevenueChart } from "./RevenueChart";
import { BreakEvenChart } from "./BreakEvenChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { TypeBreakdown } from "./TypeBreakdown";
import { ProductComparison } from "./ProductComparison";
import { VendorTable } from "./VendorTable";
import { applyFilters, filterByMonth, getLatestMonthWithData } from "../utils/filters";
import { computeTotal, groupByCategory, groupByType, groupByProduct } from "../utils/aggregations";
import { sortEntries } from "../utils/sorting";
import { formatBRL } from "../utils/formatters";
import { computeMonthlyFinancials, computeProductBreakEven } from "../utils/revenueAggregations";

export function Dashboard() {
  const { entries, revenueEntries, months } = useData();

  const defaultMonth = useMemo(
    () => getLatestMonthWithData(entries, months),
    [entries, months]
  );

  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<ProductFilter>("Todos");
  const [sortColumn, setSortColumn] = useState<SortColumn>("descricao");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const activeMonth = selectedMonth || defaultMonth;

  const filteredEntries = useMemo(
    () => applyFilters(entries, activeMonth, selectedProduct),
    [entries, activeMonth, selectedProduct]
  );

  const monthTotal = useMemo(
    () => computeTotal(filteredEntries),
    [filteredEntries]
  );

  // Revenue for the active month
  const monthRevenue = useMemo(() => {
    const filtered = revenueEntries.filter((e) => {
      const matchMonth = e.data === activeMonth;
      const matchProduct = selectedProduct === "Todos" || e.produto === selectedProduct;
      return matchMonth && matchProduct;
    });
    return filtered.reduce((sum, e) => sum + e.receitaLiquida, 0);
  }, [revenueEntries, activeMonth, selectedProduct]);

  const monthProfit = monthRevenue - monthTotal;

  // Monthly financials for the chart
  const monthlyFinancials = useMemo(
    () => computeMonthlyFinancials(entries, revenueEntries, months, selectedProduct),
    [entries, revenueEntries, months, selectedProduct]
  );

  // Per-product break-even data
  const coffstackBreakEven = useMemo(
    () => computeProductBreakEven(entries, revenueEntries, months, "Coffstack"),
    [entries, revenueEntries, months]
  );

  const bitwordBreakEven = useMemo(
    () => computeProductBreakEven(entries, revenueEntries, months, "BitWord"),
    [entries, revenueEntries, months]
  );

  const categoryBreakdown = useMemo(
    () => groupByCategory(filteredEntries),
    [filteredEntries]
  );

  const typeBreakdown = useMemo(
    () => groupByType(filteredEntries),
    [filteredEntries]
  );

  const productComparison = useMemo(
    () => groupByProduct(filterByMonth(entries, activeMonth)),
    [entries, activeMonth]
  );

  const sortedEntries = useMemo(
    () => sortEntries(filteredEntries, sortColumn, sortDirection),
    [filteredEntries, sortColumn, sortDirection]
  );

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (column === sortColumn) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn]
  );

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
  }, []);

  const handleProductChange = useCallback((product: ProductFilter) => {
    setSelectedProduct(product);
  }, []);

  // Only show revenue KPIs if there's any revenue data
  const hasRevenueData = revenueEntries.length > 0;

  return (
    <div className="space-y-6">
      <FilterBar
        months={months}
        selectedMonth={activeMonth}
        onMonthChange={handleMonthChange}
        selectedProduct={selectedProduct}
        onProductChange={handleProductChange}
        disabled={false}
      />

      <KPICards
        total={formatBRL(monthTotal)}
        revenue={hasRevenueData ? formatBRL(monthRevenue) : undefined}
        profit={hasRevenueData ? formatBRL(monthProfit) : undefined}
        profitPositive={monthProfit >= 0}
      />

      {hasRevenueData && <RevenueChart data={monthlyFinancials} />}

      {hasRevenueData && <BreakEvenChart productName="Coffstack" data={coffstackBreakEven} />}
      {hasRevenueData && <BreakEvenChart productName="BitWord" data={bitwordBreakEven} />}

      <CategoryBreakdown categories={categoryBreakdown} />

      <TypeBreakdown types={typeBreakdown} />

      <ProductComparison
        products={productComparison}
        visible={selectedProduct === "Todos"}
      />

      <VendorTable
        entries={sortedEntries}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
}
