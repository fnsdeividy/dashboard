import type { ProductFilter } from "../types";

interface FilterBarProps {
  months: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedProduct: ProductFilter;
  onProductChange: (product: ProductFilter) => void;
  disabled: boolean;
}

const MONTH_LABELS: Record<string, string> = {
  "2025-12": "Dezembro 2025",
  "2026-01": "Janeiro 2026",
  "2026-02": "Fevereiro 2026",
  "2026-03": "Março 2026",
  "2026-04": "Abril 2026",
  "2026-05": "Maio 2026",
  "2026-06": "Junho 2026",
  "2026-07": "Julho 2026",
};

function formatMonthLabel(month: string): string {
  return MONTH_LABELS[month] ?? month;
}

const PRODUCT_OPTIONS: ProductFilter[] = ["Todos", "Coffstack", "BitWord"];

export function FilterBar({
  months,
  selectedMonth,
  onMonthChange,
  selectedProduct,
  onProductChange,
  disabled,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 glass-card rounded-xl p-4 glow-purple">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="month-selector"
          className="text-xs font-medium text-text-muted uppercase tracking-wider"
        >
          Mês
        </label>
        <select
          id="month-selector"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          disabled={disabled}
          className="min-h-[44px] min-w-[44px] rounded-lg border border-purple-accent/20 bg-dark-surface/80 px-3 py-2 text-sm text-text-primary shadow-sm focus:border-purple-accent focus:ring-1 focus:ring-purple-accent/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-0 transition-all duration-200 hover:border-purple-accent/40"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="product-filter"
          className="text-xs font-medium text-text-muted uppercase tracking-wider"
        >
          Produto
        </label>
        <select
          id="product-filter"
          value={selectedProduct}
          onChange={(e) => onProductChange(e.target.value as ProductFilter)}
          disabled={disabled}
          className="min-h-[44px] min-w-[44px] rounded-lg border border-purple-accent/20 bg-dark-surface/80 px-3 py-2 text-sm text-text-primary shadow-sm focus:border-purple-accent focus:ring-1 focus:ring-purple-accent/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:min-h-0 transition-all duration-200 hover:border-purple-accent/40"
        >
          {PRODUCT_OPTIONS.map((product) => (
            <option key={product} value={product}>
              {product}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
