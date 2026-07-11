export type Category =
  | "Ferramentas/SaaS"
  | "Taxas e Impostos"
  | "Equipe/Prestadores"
  | "Contabilidade/Jurídico"
  | "Hospedagem/Cloud"
  | "Marketing";

export interface CostEntry {
  data: string;
  produto: "Coffstack" | "BitWord";
  categoria: Category;
  descricao: string;
  fornecedor: string;
  valor: number;
  tipo: "Fixo" | "Variável";
  essencial: boolean;
  observacoes: string;
}

export interface RevenueEntry {
  data: string;           // "YYYY-MM" format
  produto: "Coffstack" | "BitWord";
  receitaLiquida: number; // Net revenue value
}

export interface MonthlyFinancialSummary {
  month: string;          // "YYYY-MM"
  monthLabel: string;     // "Jan/26", "Fev/26", etc.
  totalCosts: number;
  totalRevenue: number;
  profit: number;         // revenue - costs
  profitMargin: number;   // (profit / revenue) * 100
}

export type ProductFilter = "Coffstack" | "BitWord" | "Todos";

export type SortColumn = "descricao" | "fornecedor" | "categoria" | "valor" | "tipo" | "essencial";

export interface AppState {
  entries: CostEntry[];
  selectedMonth: string;
  selectedProduct: ProductFilter;
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  loading: boolean;
  error: string | null;
}

export interface CategorySummary {
  name: string;
  total: number;
  percentage: number;
  formattedTotal: string;
}

export interface TypeSummary {
  type: "Fixo" | "Variável";
  total: number;
  count: number;
  percentage: number;
  formattedTotal: string;
}

export interface ProductSummary {
  name: "Coffstack" | "BitWord";
  total: number;
  percentage: number;
  formattedTotal: string;
}
