import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TypeBreakdown } from "./TypeBreakdown";
import type { TypeSummary } from "../types";

describe("TypeBreakdown", () => {
  const mockTypes: TypeSummary[] = [
    {
      type: "Fixo",
      total: 1500.5,
      count: 5,
      percentage: 65.3,
      formattedTotal: "R$ 1.500,50",
    },
    {
      type: "Variável",
      total: 800.0,
      count: 3,
      percentage: 34.7,
      formattedTotal: "R$ 800,00",
    },
  ];

  it("renders both Fixo and Variável groups", () => {
    render(<TypeBreakdown types={mockTypes} />);

    expect(screen.getByText("Fixo")).toBeInTheDocument();
    expect(screen.getByText("Variável")).toBeInTheDocument();
  });

  it("displays formatted total for each type", () => {
    render(<TypeBreakdown types={mockTypes} />);

    expect(screen.getByText("R$ 1.500,50")).toBeInTheDocument();
    expect(screen.getByText("R$ 800,00")).toBeInTheDocument();
  });

  it("displays entry count for each type", () => {
    render(<TypeBreakdown types={mockTypes} />);

    expect(screen.getByText("5 itens")).toBeInTheDocument();
    expect(screen.getByText("3 itens")).toBeInTheDocument();
  });

  it("displays percentage formatted to 1 decimal place", () => {
    render(<TypeBreakdown types={mockTypes} />);

    expect(screen.getByText("65,3%")).toBeInTheDocument();
    expect(screen.getByText("34,7%")).toBeInTheDocument();
  });

  it("shows singular 'item' when count is 1", () => {
    const typesWithSingleItem: TypeSummary[] = [
      {
        type: "Fixo",
        total: 100,
        count: 1,
        percentage: 100,
        formattedTotal: "R$ 100,00",
      },
      {
        type: "Variável",
        total: 0,
        count: 0,
        percentage: 0,
        formattedTotal: "R$ 0,00",
      },
    ];

    render(<TypeBreakdown types={typesWithSingleItem} />);

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });

  it("displays zero values when both types have no entries", () => {
    const emptyTypes: TypeSummary[] = [
      {
        type: "Fixo",
        total: 0,
        count: 0,
        percentage: 0,
        formattedTotal: "R$ 0,00",
      },
      {
        type: "Variável",
        total: 0,
        count: 0,
        percentage: 0,
        formattedTotal: "R$ 0,00",
      },
    ];

    render(<TypeBreakdown types={emptyTypes} />);

    expect(screen.getByText("Fixo")).toBeInTheDocument();
    expect(screen.getByText("Variável")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 0,00")).toHaveLength(2);
    expect(screen.getAllByText("0 itens")).toHaveLength(2);
    expect(screen.getAllByText("0,0%")).toHaveLength(2);
  });

  it("always shows both types even when one has no entries", () => {
    const oneEmptyType: TypeSummary[] = [
      {
        type: "Fixo",
        total: 500,
        count: 2,
        percentage: 100,
        formattedTotal: "R$ 500,00",
      },
      {
        type: "Variável",
        total: 0,
        count: 0,
        percentage: 0,
        formattedTotal: "R$ 0,00",
      },
    ];

    render(<TypeBreakdown types={oneEmptyType} />);

    expect(screen.getByText("Fixo")).toBeInTheDocument();
    expect(screen.getByText("Variável")).toBeInTheDocument();
    expect(screen.getByText("R$ 500,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
  });

  it("renders section heading", () => {
    render(<TypeBreakdown types={mockTypes} />);

    expect(screen.getByText("Custos por Tipo")).toBeInTheDocument();
  });
});
