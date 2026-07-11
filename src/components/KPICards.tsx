interface KPICardProps {
  title: string;
  value: string;
  error?: boolean;
  color?: string;
}

function KPICard({ title, value, error, color }: KPICardProps) {
  return (
    <div
      className={`rounded-xl p-4 kpi-shimmer transition-all duration-300 ${error
        ? "border border-red-500/30 bg-red-950/20"
        : "glass-card glow-purple"
        }`}
    >
      <p className="text-sm text-text-secondary">{title}</p>
      {error ? (
        <p className="mt-1 text-sm text-red-400">Erro ao carregar dados</p>
      ) : (
        <p className="mt-1 text-2xl font-bold" style={color ? { color } : undefined}>
          {value}
        </p>
      )}
    </div>
  );
}

interface KPICardsProps {
  total: string;
  revenue?: string;
  profit?: string;
  profitPositive?: boolean;
  error?: boolean;
}

export function KPICards({ total, revenue, profit, profitPositive, error }: KPICardsProps) {
  return (
    <section aria-label="Indicadores" className="flex flex-col gap-4 md:flex-row">
      <KPICard title="Custos do mês" value={total} error={error} />
      {revenue && (
        <KPICard title="Receita do mês" value={revenue} error={error} color="#4ade80" />
      )}
      {profit && (
        <KPICard
          title="Lucro / Prejuízo"
          value={profit}
          error={error}
          color={profitPositive ? "#4ade80" : "#f43f5e"}
        />
      )}
      <div className="flex items-center rounded-xl glass-card glow-purple px-4 py-3 kpi-shimmer transition-all duration-300">
        <span className="text-sm text-text-secondary">Moeda</span>
        <span className="ml-2 font-semibold text-purple-muted">BRL</span>
      </div>
    </section>
  );
}
