import { useState } from "react";
import type { MonthlyFinancialSummary } from "../types";
import { formatBRL } from "../utils/formatters";

interface RevenueChartProps {
  data: MonthlyFinancialSummary[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (data.length === 0) {
    return null;
  }

  // Find the max value for scaling bars
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.totalCosts, d.totalRevenue)),
    1
  );

  const totalRevenue = data.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalCosts = data.reduce((sum, d) => sum + d.totalCosts, 0);
  const netProfit = totalRevenue - totalCosts;

  return (
    <section aria-label="Custos x Receita" className="glass-card glow-purple rounded-xl overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={isOpen}
      >
        <h2 className="text-lg font-semibold text-text-primary">Custos x Receita</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#f43f5e" }} />
              Custos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#4ade80" }} />
              Receita
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
      >
        <div className="px-5 pb-5">
          {/* Chart */}
          <div className="overflow-x-auto">
            <div className="flex items-end gap-2 min-w-max pb-2" style={{ height: "220px" }}>
              {data.map((item) => {
                const costHeight = maxValue > 0 ? (item.totalCosts / maxValue) * 100 : 0;
                const revenueHeight = maxValue > 0 ? (item.totalRevenue / maxValue) * 100 : 0;

                return (
                  <div key={item.month} className="flex flex-col items-center gap-1 min-w-[60px]">
                    {/* Bars container */}
                    <div className="flex items-end gap-1 h-[180px]">
                      {/* Cost bar */}
                      <div className="relative group flex flex-col items-center">
                        <div
                          className="w-5 rounded-t-md transition-all duration-500 ease-out"
                          style={{
                            height: `${Math.max(costHeight * 1.8, costHeight > 0 ? 4 : 0)}px`,
                            maxHeight: "180px",
                            backgroundColor: "#f43f5e",
                            opacity: 0.85,
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-dark-surface border border-dark-border rounded px-2 py-1 text-xs text-text-primary whitespace-nowrap z-10">
                          {formatBRL(item.totalCosts)}
                        </div>
                      </div>
                      {/* Revenue bar */}
                      <div className="relative group flex flex-col items-center">
                        <div
                          className="w-5 rounded-t-md transition-all duration-500 ease-out"
                          style={{
                            height: `${Math.max(revenueHeight * 1.8, revenueHeight > 0 ? 4 : 0)}px`,
                            maxHeight: "180px",
                            backgroundColor: "#4ade80",
                            opacity: 0.85,
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-dark-surface border border-dark-border rounded px-2 py-1 text-xs text-text-primary whitespace-nowrap z-10">
                          {formatBRL(item.totalRevenue)}
                        </div>
                      </div>
                    </div>
                    {/* Month label */}
                    <span className="text-xs text-text-secondary mt-1">{item.monthLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary row */}
          <div className="mt-4 pt-4 border-t border-dark-border grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-text-secondary">Receita Total</p>
              <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                {formatBRL(totalRevenue)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-secondary">Custos Total</p>
              <p className="text-sm font-semibold" style={{ color: "#f43f5e" }}>
                {formatBRL(totalCosts)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-secondary">Lucro / Prejuízo</p>
              <p
                className="text-sm font-semibold"
                style={{ color: netProfit >= 0 ? "#4ade80" : "#f43f5e" }}
              >
                {formatBRL(netProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
