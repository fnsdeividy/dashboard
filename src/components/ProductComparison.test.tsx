import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductComparison } from "./ProductComparison";
import type { ProductSummary } from "../types";

describe("ProductComparison", () => {
  const mockProducts: ProductSummary[] = [
    {
      name: "Coffstack",
      total: 3000.5,
      percentage: 60.2,
      formattedTotal: "R$ 3.000,50",
    },
    {
      name: "BitWord",
      total: 1980.0,
      percentage: 39.8,
      formattedTotal: "R$ 1.980,00",
    },
  ];

  it("renders both products when visible is true", () => {
    render(<ProductComparison products={mockProducts} visible={true} />);

    expect(screen.getByText("Coffstack")).toBeInTheDocument();
    expect(screen.getByText("BitWord")).toBeInTheDocument();
  });

  it("renders nothing when visible is false", () => {
    const { container } = render(
      <ProductComparison products={mockProducts} visible={false} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("displays formatted total for each product", () => {
    render(<ProductComparison products={mockProducts} visible={true} />);

    expect(screen.getByText("R$ 3.000,50")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.980,00")).toBeInTheDocument();
  });

  it("displays percentage formatted to 1 decimal place", () => {
    render(<ProductComparison products={mockProducts} visible={true} />);

    expect(screen.getByText("60,2%")).toBeInTheDocument();
    expect(screen.getByText("39,8%")).toBeInTheDocument();
  });

  it("displays zero values for products with no entries", () => {
    const zeroProducts: ProductSummary[] = [
      {
        name: "Coffstack",
        total: 0,
        percentage: 0,
        formattedTotal: "R$ 0,00",
      },
      {
        name: "BitWord",
        total: 0,
        percentage: 0,
        formattedTotal: "R$ 0,00",
      },
    ];

    render(<ProductComparison products={zeroProducts} visible={true} />);

    expect(screen.getByText("Coffstack")).toBeInTheDocument();
    expect(screen.getByText("BitWord")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 0,00")).toHaveLength(2);
    expect(screen.getAllByText("0,0%")).toHaveLength(2);
  });

  it("handles one product with zero and one with data", () => {
    const mixedProducts: ProductSummary[] = [
      {
        name: "Coffstack",
        total: 2500,
        percentage: 100,
        formattedTotal: "R$ 2.500,00",
      },
      {
        name: "BitWord",
        total: 0,
        percentage: 0,
        formattedTotal: "R$ 0,00",
      },
    ];

    render(<ProductComparison products={mixedProducts} visible={true} />);

    expect(screen.getByText("R$ 2.500,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
    expect(screen.getByText("100,0%")).toBeInTheDocument();
    expect(screen.getByText("0,0%")).toBeInTheDocument();
  });

  it("renders section heading", () => {
    render(<ProductComparison products={mockProducts} visible={true} />);

    expect(screen.getByText("Comparação por Produto")).toBeInTheDocument();
  });
});
