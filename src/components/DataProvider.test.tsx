import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataProvider, useData } from "./DataProvider";

// Mock the useDataLoader hook
vi.mock("../hooks/useDataLoader", () => ({
  useDataLoader: vi.fn(),
}));

import { useDataLoader } from "../hooks/useDataLoader";

const mockUseDataLoader = vi.mocked(useDataLoader);

function TestConsumer() {
  const { entries, revenueEntries, months, loading, error, retry } = useData();
  return (
    <div>
      <span data-testid="entries-count">{entries.length}</span>
      <span data-testid="revenue-count">{revenueEntries.length}</span>
      <span data-testid="months-count">{months.length}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? "none"}</span>
      <button data-testid="retry-btn" onClick={retry}>
        Retry
      </button>
    </div>
  );
}

describe("DataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading indicator while data is loading", () => {
    mockUseDataLoader.mockReturnValue({
      entries: [],
      revenueEntries: [],
      months: [],
      loading: true,
      error: null,
      retry: vi.fn(),
    });

    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
    // Children should not be rendered during loading
    expect(screen.queryByTestId("entries-count")).not.toBeInTheDocument();
  });

  it("renders error state with retry button on failure", () => {
    const retryFn = vi.fn();
    mockUseDataLoader.mockReturnValue({
      entries: [],
      revenueEntries: [],
      months: [],
      loading: false,
      error: "Falha ao carregar dados: 404 Not Found",
      retry: retryFn,
    });

    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Falha ao carregar dados: 404 Not Found")
    ).toBeInTheDocument();
    expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    // Children should not be rendered during error
    expect(screen.queryByTestId("entries-count")).not.toBeInTheDocument();
  });

  it("calls retry when retry button is clicked", () => {
    const retryFn = vi.fn();
    mockUseDataLoader.mockReturnValue({
      entries: [],
      revenueEntries: [],
      months: [],
      loading: false,
      error: "Network error",
      retry: retryFn,
    });

    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );

    fireEvent.click(screen.getByText("Tentar novamente"));
    expect(retryFn).toHaveBeenCalledTimes(1);
  });

  it("renders children with data context on success", () => {
    const mockEntries = [
      {
        data: "2025-12",
        produto: "Coffstack" as const,
        categoria: "Ferramentas/SaaS" as const,
        descricao: "GitHub Pro",
        fornecedor: "GitHub",
        valor: 50,
        tipo: "Fixo" as const,
        essencial: true,
        observacoes: "",
      },
    ];

    mockUseDataLoader.mockReturnValue({
      entries: mockEntries,
      revenueEntries: [],
      months: ["2025-12"],
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );

    expect(screen.getByTestId("entries-count")).toHaveTextContent("1");
    expect(screen.getByTestId("months-count")).toHaveTextContent("1");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });

  it("does not render loading indicator or error when data is ready", () => {
    mockUseDataLoader.mockReturnValue({
      entries: [],
      revenueEntries: [],
      months: [],
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByTestId("entries-count")).toBeInTheDocument();
  });

  it("disables interactive controls during loading by providing loading=true in context", () => {
    // When loading=true, the DataProvider does not render children at all,
    // which effectively disables all controls. This is by design.
    mockUseDataLoader.mockReturnValue({
      entries: [],
      revenueEntries: [],
      months: [],
      loading: true,
      error: null,
      retry: vi.fn(),
    });

    render(
      <DataProvider>
        <TestConsumer />
      </DataProvider>
    );

    // Children are not rendered, so controls are not accessible
    expect(screen.queryByTestId("entries-count")).not.toBeInTheDocument();
  });
});

describe("useData", () => {
  it("throws error when used outside of DataProvider", () => {
    // Suppress console.error for this test since React will log the error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useData must be used within a DataProvider");

    consoleSpy.mockRestore();
  });
});
