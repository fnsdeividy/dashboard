import type { CategorySummary } from "../types";
import { formatPercentage } from "../utils/formatters";

interface CategoryBreakdownProps {
  categories: CategorySummary[];
  emptyMessage?: string;
}

export function CategoryBreakdown({
  categories,
  emptyMessage = "Nenhum dado disponível para os filtros selecionados",
}: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl glass-card glow-purple p-6 gradient-border">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Custos por Categoria
        </h2>
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass-card glow-purple p-6 gradient-border">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Custos por Categoria
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-purple-accent/20 text-text-secondary">
              <th className="pb-2 font-medium">Categoria</th>
              <th className="pb-2 text-right font-medium">Valor (BRL)</th>
              <th className="pb-2 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.name}
                className="border-b border-dark-border/30 last:border-0 table-row-hover transition-colors duration-200"
              >
                <td className="py-2.5 text-text-primary">{category.name}</td>
                <td className="py-2.5 text-right text-text-primary">
                  {category.formattedTotal}
                </td>
                <td className="py-2.5 text-right text-purple-accent font-medium">
                  {formatPercentage(category.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
