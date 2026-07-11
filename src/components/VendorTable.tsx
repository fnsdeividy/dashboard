import type { CostEntry, SortColumn } from "../types";
import { formatBRL } from "../utils/formatters";

interface VendorTableProps {
  entries: CostEntry[];
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  onSort: (column: SortColumn) => void;
  emptyMessage?: string;
}

interface ColumnDef {
  key: SortColumn;
  label: string;
  align?: "left" | "right";
}

const COLUMNS: ColumnDef[] = [
  { key: "descricao", label: "Descrição" },
  { key: "fornecedor", label: "Fornecedor" },
  { key: "categoria", label: "Categoria" },
  { key: "valor", label: "Valor (BRL)", align: "right" },
  { key: "tipo", label: "Tipo" },
  { key: "essencial", label: "Essencial" },
];

function SortIndicator({
  column,
  activeColumn,
  direction,
}: {
  column: SortColumn;
  activeColumn: SortColumn;
  direction: "asc" | "desc";
}) {
  if (column !== activeColumn) return null;

  return (
    <span aria-label={direction === "asc" ? "sorted ascending" : "sorted descending"}>
      {direction === "asc" ? " ↑" : " ↓"}
    </span>
  );
}

export function VendorTable({
  entries,
  sortColumn,
  sortDirection,
  onSort,
  emptyMessage = "Nenhum dado disponível para os filtros selecionados",
}: VendorTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl glass-card glow-purple p-6 gradient-border">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Detalhamento por Fornecedor
        </h2>
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass-card glow-purple p-6 gradient-border">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Detalhamento por Fornecedor
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-purple-accent/30 text-text-secondary">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`cursor-pointer select-none pb-3 pr-6 font-medium hover:text-purple-muted transition-colors duration-200 ${col.align === "right" ? "text-right pr-8" : ""
                    }`}
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  <SortIndicator
                    column={col.key}
                    activeColumn={sortColumn}
                    direction={sortDirection}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={`${entry.descricao}-${entry.fornecedor}-${index}`}
                className="border-b border-dark-border/30 last:border-0 table-row-hover transition-colors duration-200"
              >
                <td className="py-2.5 pr-6 text-text-primary">{entry.descricao}</td>
                <td className="py-2.5 pr-6 text-text-primary">{entry.fornecedor}</td>
                <td className="py-2.5 pr-6 text-text-primary">{entry.categoria}</td>
                <td className="py-2.5 pr-8 text-right text-text-primary font-medium">
                  {formatBRL(entry.valor)}
                </td>
                <td className="py-2.5 pr-6 text-text-primary">{entry.tipo}</td>
                <td className="py-2.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${entry.essencial
                      ? "bg-purple-accent/10 text-purple-muted"
                      : "bg-dark-border/30 text-text-muted"
                      }`}
                  >
                    {entry.essencial ? "Sim" : "Não"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
