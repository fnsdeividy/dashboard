import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DataProvider } from "./DataProvider";
import { Dashboard } from "./Dashboard";
import type { CostEntry } from "../types";

// Mock the useDataLoader hook so we can control data/loading/error states
vi.mock("../hooks/useDataLoader", () => ({
  useDataLoader: vi.fn(),
}));

import { useDataLoader } from "../hooks/useDataLoader";

const mockUseDataLoader = vi.mocked(useDataLoader);

// Test data spanning two months and both products
const MOCK_ENTRIES: CostEntry[] = [
  {
    data: "2026-01",
    produto: "Coffstack",
    categoria: "Ferramentas/SaaS",
    descricao: "GitHub Pro",
    fornecedor: "GitHub",
    valor: 50,
    tipo: "Fixo",
    essencial: true,
    observacoes: "",
  },
  {
    data: "2026-01",
    produto: "Coffstack",
    categoria: "Hospedagem/Cloud",
    descricao: "AWS EC2",
    fornecedor: "Amazon",
    valor: 200,
    tipo: "Variável",
    essencial: true,
    observacoes: "",
  },
  {
    data: "2026-01",
    produto: "BitWord",
    categoria: "Marketing",
    descricao: "Google Ads",
    fornecedor: "Google",
    valor: 300,
    tipo: "Variável",
    essencial: false,
    observacoes: "",
  },
  {
    data: "2025-12",
    produto: "Coffstack",
    categoria: "Equipe/Prestadores",
    descricao: "Freelancer Dev",
    fornecedor: "Upwork",
    valor: 1000,
    tipo: "Fixo",
    essencial: true,
    observacoes: "",
  },
  {
    data: "2025-12",
    produto: "BitWord",
    categoria: "Taxas e Impostos",
    descricao: "ISS",
    fornecedor: "Prefeitura",
    valor: 150,
    tipo: "Fixo",
    essencial: true,
    observacoes: "",
  },
];

const MOCK_MONTHS = ["2025-12", "2026-01"];

function renderDashboard() {
  return render(
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}

/**
 * Helper to get the VendorTable section by its heading
 */
function getVendorTableSection() {
  return screen.getByText("Detalhamento por Fornecedor").closest("div")!;
}

describe("Dashboard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Month filter interaction", () => {
    it("changing month updates KPI total, category breakdown, and vendor table", () => {
      mockUseDataLoader.mockReturnValue({
        entries: MOCK_ENTRIES,
        revenueEntries: [],
        months: MOCK_MONTHS,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      renderDashboard();

      // Default month is 2026-01 (latest with data)
      // Total for 2026-01 with "Todos": 50 + 200 + 300 = 550
      // KPI card shows the total in the "Custos do mês" section
      const kpiSection = screen.getByLabelText("Indicadores");
      expect(within(kpiSection).getByText("R$ 550,00")).toBeInTheDocument();

      // Vendor table should show entries from 2026-01
      expect(screen.getByText("GitHub Pro")).toBeInTheDocument();
      expect(screen.getByText("AWS EC2")).toBeInTheDocument();
      expect(screen.getByText("Google Ads")).toBeInTheDocument();

      // Entries from 2025-12 should NOT appear
      expect(screen.queryByText("Freelancer Dev")).not.toBeInTheDocument();
      expect(screen.queryByText("ISS")).not.toBeInTheDocument();

      // Now change month to 2025-12
      const monthSelect = screen.getByLabelText("Mês");
      fireEvent.change(monthSelect, { target: { value: "2025-12" } });

      // Total for 2025-12 with "Todos": 1000 + 150 = 1150
      // Use the KPI section to avoid matching TypeBreakdown values
      const kpiAfter = screen.getByLabelText("Indicadores");
      expect(within(kpiAfter).getByText("R$ 1.150,00")).toBeInTheDocument();

      // Vendor table should now show 2025-12 entries
      expect(screen.getByText("Freelancer Dev")).toBeInTheDocument();
      expect(screen.getByText("ISS")).toBeInTheDocument();

      // 2026-01 entries should be gone
      expect(screen.queryByText("GitHub Pro")).not.toBeInTheDocument();
      expect(screen.queryByText("AWS EC2")).not.toBeInTheDocument();
    });
  });

  describe("Product filter interaction", () => {
    it("selecting 'Coffstack' hides ProductComparison section", () => {
      mockUseDataLoader.mockReturnValue({
        entries: MOCK_ENTRIES,
        revenueEntries: [],
        months: MOCK_MONTHS,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      renderDashboard();

      // With "Todos" (default), ProductComparison should be visible
      expect(screen.getByText("Comparação por Produto")).toBeInTheDocument();

      // Select "Coffstack"
      const productSelect = screen.getByLabelText("Produto");
      fireEvent.change(productSelect, { target: { value: "Coffstack" } });

      // ProductComparison section should be hidden
      expect(screen.queryByText("Comparação por Produto")).not.toBeInTheDocument();
    });

    it("selecting 'Todos' shows ProductComparison section", () => {
      mockUseDataLoader.mockReturnValue({
        entries: MOCK_ENTRIES,
        revenueEntries: [],
        months: MOCK_MONTHS,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      renderDashboard();

      // First select a single product to hide comparison
      const productSelect = screen.getByLabelText("Produto");
      fireEvent.change(productSelect, { target: { value: "BitWord" } });
      expect(screen.queryByText("Comparação por Produto")).not.toBeInTheDocument();

      // Switch back to "Todos"
      fireEvent.change(productSelect, { target: { value: "Todos" } });
      expect(screen.getByText("Comparação por Produto")).toBeInTheDocument();
    });

    it("product filter updates vendor table entries", () => {
      mockUseDataLoader.mockReturnValue({
        entries: MOCK_ENTRIES,
        revenueEntries: [],
        months: MOCK_MONTHS,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      renderDashboard();

      // Default month 2026-01, product "Todos" — shows all 3 entries
      expect(screen.getByText("GitHub Pro")).toBeInTheDocument();
      expect(screen.getByText("Google Ads")).toBeInTheDocument();

      // Select "Coffstack" — only Coffstack entries in Jan
      const productSelect = screen.getByLabelText("Produto");
      fireEvent.change(productSelect, { target: { value: "Coffstack" } });

      expect(screen.getByText("GitHub Pro")).toBeInTheDocument();
      expect(screen.getByText("AWS EC2")).toBeInTheDocument();
      expect(screen.queryByText("Google Ads")).not.toBeInTheDocument();
    });
  });

  describe("Sort toggle behavior", () => {
    it("clicking a column header sorts by that column, clicking again reverses", () => {
      mockUseDataLoader.mockReturnValue({
        entries: MOCK_ENTRIES,
        revenueEntries: [],
        months: MOCK_MONTHS,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      renderDashboard();

      // Default sort: ascending by Descrição
      // Entries in 2026-01: "AWS EC2", "GitHub Pro", "Google Ads" (asc by descricao)
      const vendorSection = getVendorTableSection();
      const table = vendorSection.querySelector("table")!;
      const rows = table.querySelectorAll("tbody tr");
      expect(rows[0].querySelectorAll("td")[0].textContent).toBe("AWS EC2");
      expect(rows[2].querySelectorAll("td")[0].textContent).toBe("Google Ads");

      // Click "Descrição" header again to reverse sort (it's already the active column)
      const descricaoHeader = within(vendorSection).getByText("Descrição");
      fireEvent.click(descricaoHeader);

      // Now descending: "Google Ads", "GitHub Pro", "AWS EC2"
      const rowsAfterReverse = table.querySelectorAll("tbody tr");
      expect(rowsAfterReverse[0].querySelectorAll("td")[0].textContent).toBe("Google Ads");
      expect(rowsAfterReverse[2].querySelectorAll("td")[0].textContent).toBe("AWS EC2");

      // Click "Valor (BRL)" to sort by valor ascending
      const valorHeader = within(vendorSection).getByText("Valor (BRL)");
      fireEvent.click(valorHeader);

      // Ascending by valor: 50 (GitHub Pro), 200 (AWS EC2), 300 (Google Ads)
      const rowsAfterValor = table.querySelectorAll("tbody tr");
      expect(rowsAfterValor[0].querySelectorAll("td")[0].textContent).toBe("GitHub Pro");
      expect(rowsAfterValor[2].querySelectorAll("td")[0].textContent).toBe("Google Ads");
    });
  });

  describe("Loading state", () => {
    it("shows loading indicator and hides dashboard when loading", () => {
      mockUseDataLoader.mockReturnValue({
        entries: [],
        revenueEntries: [],
        months: [],
        loading: true,
        error: null,
        retry: vi.fn(),
      });

      renderDashboard();

      // Loading indicator should be visible
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Carregando dados...")).toBeInTheDocument();

      // Dashboard content should NOT be rendered
      expect(screen.queryByLabelText("Mês")).not.toBeInTheDocument();
      expect(screen.queryByText("Custos do mês")).not.toBeInTheDocument();
    });
  });

  describe("Error state", () => {
    it("shows error message and retry button on failure", () => {
      const retryFn = vi.fn();
      mockUseDataLoader.mockReturnValue({
        entries: [],
        revenueEntries: [],
        months: [],
        loading: false,
        error: "Falha ao carregar dados: 404 Not Found",
        retry: retryFn,
      });

      renderDashboard();

      // Error message should be shown
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Falha ao carregar dados: 404 Not Found")
      ).toBeInTheDocument();

      // Retry button should be present
      const retryButton = screen.getByText("Tentar novamente");
      expect(retryButton).toBeInTheDocument();

      // Click retry
      fireEvent.click(retryButton);
      expect(retryFn).toHaveBeenCalledTimes(1);

      // Dashboard content should NOT be rendered
      expect(screen.queryByLabelText("Mês")).not.toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("shows empty state messages when month has no data", () => {
      // Provide data only for 2026-01, but include 2025-12 in months
      mockUseDataLoader.mockReturnValue({
        entries: [MOCK_ENTRIES[0]], // Only one entry in 2026-01
        revenueEntries: [],
        months: ["2025-12", "2026-01"],
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      renderDashboard();

      // Switch to month with no entries
      const monthSelect = screen.getByLabelText("Mês");
      fireEvent.change(monthSelect, { target: { value: "2025-12" } });

      // KPI should show R$ 0,00 in the Indicadores section
      const kpiSection = screen.getByLabelText("Indicadores");
      expect(within(kpiSection).getByText("R$ 0,00")).toBeInTheDocument();

      // Empty state messages in components (CategoryBreakdown and VendorTable)
      const emptyMessages = screen.getAllByText(
        "Nenhum dado disponível para os filtros selecionados"
      );
      expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
    });
  });
});
