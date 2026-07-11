import { useState } from "react";
import type { MonthlyFinancialSummary } from "../types";
import { formatBRL } from "../utils/formatters";

interface BreakEvenChartProps {
  productName: "Coffstack" | "BitWord";
  data: MonthlyFinancialSummary[];
}

export function BreakEvenChart({ productName, data }: BreakEvenChartProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (data.length === 0) {
    return null;
  }

  // Compute cumulative values
  const cumulativeData = data.reduce<
    { month: string; monthLabel: string; cumulativeCosts: number; cumulativeRevenue: number }[]
  >((acc, item) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : { cumulativeCosts: 0, cumulativeRevenue: 0 };
    acc.push({
      month: item.month,
      monthLabel: item.monthLabel,
      cumulativeCosts: prev.cumulativeCosts + item.totalCosts,
      cumulativeRevenue: prev.cumulativeRevenue + item.totalRevenue,
    });
    return acc;
  }, []);

  const totalCumulativeCosts = cumulativeData[cumulativeData.length - 1]?.cumulativeCosts ?? 0;
  const totalCumulativeRevenue = cumulativeData[cumulativeData.length - 1]?.cumulativeRevenue ?? 0;

  // Find break-even point (month where cumulative revenue >= cumulative costs)
  const breakEvenIndex = cumulativeData.findIndex((d) => d.cumulativeRevenue >= d.cumulativeCosts);
  const breakEvenMonth = breakEvenIndex >= 0 ? cumulativeData[breakEvenIndex].monthLabel : null;
  const remaining = totalCumulativeCosts - totalCumulativeRevenue;

  // SVG chart dimensions
  const width = 600;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 30, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale calculations
  const maxValue = Math.max(
    ...cumulativeData.map((d) => Math.max(d.cumulativeCosts, d.cumulativeRevenue)),
    1
  );

  const xScale = (index: number) =>
    padding.left + (index / Math.max(cumulativeData.length - 1, 1)) * chartWidth;
  const yScale = (value: number) =>
    padding.top + chartHeight - (value / maxValue) * chartHeight;

  // Generate polyline points
  const costPoints = cumulativeData
    .map((d, i) => `${xScale(i)},${yScale(d.cumulativeCosts)}`)
    .join(" ");
  const revenuePoints = cumulativeData
    .map((d, i) => `${xScale(i)},${yScale(d.cumulativeRevenue)}`)
    .join(" ");

  // Area fill points (close path at bottom)
  const costAreaPoints = `${padding.left},${padding.top + chartHeight} ${costPoints} ${xScale(cumulativeData.length - 1)},${padding.top + chartHeight}`;
  const revenueAreaPoints = `${padding.left},${padding.top + chartHeight} ${revenuePoints} ${xScale(cumulativeData.length - 1)},${padding.top + chartHeight}`;

  // Grid lines (4 horizontal lines)
  const gridLines = [0.25, 0.5, 0.75, 1].map((fraction) => ({
    y: yScale(maxValue * fraction),
    label: formatBRL(maxValue * fraction),
  }));

  // Format Y-axis labels to be shorter
  const formatYLabel = (value: number): string => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
    }
    return formatBRL(value);
  };

  return (
    <section className="glass-card glow-purple rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={isOpen}
      >
        <h2 className="text-lg font-semibold text-text-primary">
          Break-even — {productName}
        </h2>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
      >
        <div className="px-5 pb-5">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#f43f5e" }} />
              Custos acumulados
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#4ade80" }} />
              Receita acumulada
            </span>
          </div>

          {/* SVG Chart */}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Grid lines */}
            {gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={line.y}
                  x2={width - padding.right}
                  y2={line.y}
                  stroke="rgba(139, 92, 246, 0.1)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={line.y + 4}
                  textAnchor="end"
                  className="text-[9px]"
                  fill="#94a3b8"
                >
                  {formatYLabel(maxValue * [0.25, 0.5, 0.75, 1][i])}
                </text>
              </g>
            ))}

            {/* Base line */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={width - padding.right}
              y2={padding.top + chartHeight}
              stroke="rgba(139, 92, 246, 0.15)"
              strokeWidth="1"
            />

            {/* Area fills */}
            <polygon points={costAreaPoints} fill="#f43f5e" opacity="0.1" />
            <polygon points={revenueAreaPoints} fill="#4ade80" opacity="0.1" />

            {/* Cost line */}
            <polyline
              points={costPoints}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Revenue line */}
            <polyline
              points={revenuePoints}
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Break-even dashed line */}
            {breakEvenIndex >= 0 && (
              <line
                x1={xScale(breakEvenIndex)}
                y1={padding.top}
                x2={xScale(breakEvenIndex)}
                y2={padding.top + chartHeight}
                stroke="#a78bfa"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
            )}

            {/* Data points */}
            {cumulativeData.map((d, i) => (
              <g key={d.month}>
                <circle cx={xScale(i)} cy={yScale(d.cumulativeCosts)} r="3" fill="#f43f5e" />
                <circle cx={xScale(i)} cy={yScale(d.cumulativeRevenue)} r="3" fill="#4ade80" />
              </g>
            ))}

            {/* X-axis labels */}
            {cumulativeData.map((d, i) => (
              <text
                key={d.month}
                x={xScale(i)}
                y={height - 5}
                textAnchor="middle"
                className="text-[9px]"
                fill="#94a3b8"
              >
                {d.monthLabel}
              </text>
            ))}
          </svg>

          {/* Summary stats */}
          <div className="mt-4 pt-4 border-t border-dark-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xs text-text-secondary">Custos acumulados</p>
              <p className="text-sm font-semibold" style={{ color: "#f43f5e" }}>
                {formatBRL(totalCumulativeCosts)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-secondary">Receita acumulada</p>
              <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                {formatBRL(totalCumulativeRevenue)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-secondary">Break-even</p>
              <p className="text-sm font-semibold text-purple-muted">
                {breakEvenMonth ?? "Não atingido"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-secondary">Falta para break-even</p>
              <p className="text-sm font-semibold" style={{ color: remaining > 0 ? "#f43f5e" : "#4ade80" }}>
                {remaining > 0 ? formatBRL(remaining) : "Atingido"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
