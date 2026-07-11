import type { ProductSummary } from "../types";
import { formatPercentage } from "../utils/formatters";

interface ProductComparisonProps {
  products: ProductSummary[];
  visible: boolean;
}

export function ProductComparison({ products, visible }: ProductComparisonProps) {
  if (!visible) {
    return null;
  }

  return (
    <section aria-labelledby="product-comparison-title">
      <h2 id="product-comparison-title" className="text-lg font-semibold text-text-primary mb-4">
        Comparação por Produto
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product, index) => (
          <div
            key={product.name}
            className="rounded-xl glass-card p-5 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
          >
            {/* Gradient accent on top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: index === 0
                  ? "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)"
                  : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
              }}
              aria-hidden="true"
            />
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />
            <h3 className="text-sm font-medium text-purple-muted mb-1 relative">
              {product.name}
            </h3>
            <p className="text-2xl font-bold text-text-primary relative">
              {product.formattedTotal}
            </p>
            <div className="mt-2 text-sm relative">
              <span className="text-purple-accent font-medium">
                {formatPercentage(product.percentage, 1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
