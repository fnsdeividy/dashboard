import type { TypeSummary } from "../types";
import { formatPercentage } from "../utils/formatters";

interface TypeBreakdownProps {
  types: TypeSummary[];
}

export function TypeBreakdown({ types }: TypeBreakdownProps) {
  return (
    <section aria-labelledby="type-breakdown-title">
      <h2 id="type-breakdown-title" className="text-lg font-semibold text-text-primary mb-4">
        Custos por Tipo
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((typeSummary, index) => (
          <div
            key={typeSummary.type}
            className="rounded-xl glass-card p-4 transition-all duration-300 hover:scale-[1.02] hover:glow-purple-strong"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-accent glow-purple" />
              <h3 className="text-sm font-medium text-text-secondary">
                {typeSummary.type}
              </h3>
            </div>
            <p className="text-xl font-bold text-text-primary">
              {typeSummary.formattedTotal}
            </p>
            <div className="mt-2 flex items-center justify-between text-sm text-text-muted">
              <span>{typeSummary.count} {typeSummary.count === 1 ? "item" : "itens"}</span>
              <span className="text-purple-accent font-medium">{formatPercentage(typeSummary.percentage, 1)}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-dark-border/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${typeSummary.percentage}%`,
                  background: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)",
                  boxShadow: "0 0 8px rgba(139, 92, 246, 0.4)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
