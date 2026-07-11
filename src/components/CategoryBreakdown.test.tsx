import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CategoryBreakdown } from "./CategoryBreakdown";
import type { CategorySummary } from "../types";

describe("CategoryBreakdown", () => {
  const sampleCategories: CategorySummary[] = [
    {
      name: "Ferramentas/SaaS",
      total: 1500.0,
      percentage: 60.0,
      formattedTotal: "R$ 1.500,00",
    },
    {
      name: "Hospedagem/Cloud",
      total: 750.0,
      percentage: 30.0,
      formattedTotal: "R$ 750,00",
    },
    {
      name: "Marketing",
      total: 250.0,
      percentage: 10.0,
      formattedTotal: "R$ 250,00",
    },
  ];

  it("renders the section heading", () => {
    render(<CategoryBreakdown categories={sampleCategories} />);
    expect(screen.getByText("Custos por Categoria")).toBeInTheDocument();
  });

  it("renders table headers Categoria, Valor (BRL), and %", () => {
    render(<CategoryBreakdown categories={sampleCategories} />);
    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(screen.getByText("Valor (BRL)")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("renders all category rows with name, total, and percentage", () => {
    render(<CategoryBreakdown categories={sampleCategories} />);

    expect(screen.getByText("Ferramentas/SaaS")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.500,00")).toBeInTheDocument();
    expect(screen.getByText("60,0%")).toBeInTheDocument();

    expect(screen.getByText("Hospedagem/Cloud")).toBeInTheDocument();
    expect(screen.getByText("R$ 750,00")).toBeInTheDocument();
    expect(screen.getByText("30,0%")).toBeInTheDocument();

    expect(screen.getByText("Marketing")).toBeInTheDocument();
    expect(screen.getByText("R$ 250,00")).toBeInTheDocument();
    expect(screen.getByText("10,0%")).toBeInTheDocument();
  });

  it("preserves the order of categories as received (sorted descending by total)", () => {
    render(<CategoryBreakdown categories={sampleCategories} />);
    const rows = screen.getAllByRole("row");
    // First row is the header
    expect(rows[1]).toHaveTextContent("Ferramentas/SaaS");
    expect(rows[2]).toHaveTextContent("Hospedagem/Cloud");
    expect(rows[3]).toHaveTextContent("Marketing");
  });

  it("shows empty state message when categories array is empty", () => {
    render(<CategoryBreakdown categories={[]} />);
    expect(
      screen.getByText(
        "Nenhum dado disponível para os filtros selecionados"
      )
    ).toBeInTheDocument();
  });

  it("shows custom empty state message when provided", () => {
    render(
      <CategoryBreakdown categories={[]} emptyMessage="Sem dados encontrados" />
    );
    expect(screen.getByText("Sem dados encontrados")).toBeInTheDocument();
  });

  it("does not render a table when categories is empty", () => {
    render(<CategoryBreakdown categories={[]} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a table when there are categories", () => {
    render(<CategoryBreakdown categories={sampleCategories} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
