import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "./FilterBar";

const MONTHS = [
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
];

describe("FilterBar", () => {
  const defaultProps = {
    months: MONTHS,
    selectedMonth: "2026-07",
    onMonthChange: vi.fn(),
    selectedProduct: "Todos" as const,
    onProductChange: vi.fn(),
    disabled: false,
  };

  it("renders MonthSelector with all 8 months", () => {
    render(<FilterBar {...defaultProps} />);
    const monthSelect = screen.getByLabelText("Mês");
    expect(monthSelect).toBeInTheDocument();

    const options = monthSelect.querySelectorAll("option");
    expect(options).toHaveLength(8);
  });

  it("displays user-friendly month labels", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText("Dezembro 2025")).toBeInTheDocument();
    expect(screen.getByText("Janeiro 2026")).toBeInTheDocument();
    expect(screen.getByText("Julho 2026")).toBeInTheDocument();
  });

  it("renders ProductFilter with 3 options", () => {
    render(<FilterBar {...defaultProps} />);
    const productSelect = screen.getByLabelText("Produto");
    expect(productSelect).toBeInTheDocument();

    const options = productSelect.querySelectorAll("option");
    expect(options).toHaveLength(3);
    expect(screen.getByText("Todos")).toBeInTheDocument();
    expect(screen.getByText("Coffstack")).toBeInTheDocument();
    expect(screen.getByText("BitWord")).toBeInTheDocument();
  });

  it("calls onMonthChange when month is selected", () => {
    const onMonthChange = vi.fn();
    render(<FilterBar {...defaultProps} onMonthChange={onMonthChange} />);

    const monthSelect = screen.getByLabelText("Mês");
    fireEvent.change(monthSelect, { target: { value: "2026-01" } });

    expect(onMonthChange).toHaveBeenCalledWith("2026-01");
  });

  it("calls onProductChange when product is selected", () => {
    const onProductChange = vi.fn();
    render(<FilterBar {...defaultProps} onProductChange={onProductChange} />);

    const productSelect = screen.getByLabelText("Produto");
    fireEvent.change(productSelect, { target: { value: "Coffstack" } });

    expect(onProductChange).toHaveBeenCalledWith("Coffstack");
  });

  it("disables both selects when disabled prop is true", () => {
    render(<FilterBar {...defaultProps} disabled={true} />);

    const monthSelect = screen.getByLabelText("Mês");
    const productSelect = screen.getByLabelText("Produto");

    expect(monthSelect).toBeDisabled();
    expect(productSelect).toBeDisabled();
  });

  it("enables both selects when disabled prop is false", () => {
    render(<FilterBar {...defaultProps} disabled={false} />);

    const monthSelect = screen.getByLabelText("Mês");
    const productSelect = screen.getByLabelText("Produto");

    expect(monthSelect).not.toBeDisabled();
    expect(productSelect).not.toBeDisabled();
  });

  it("reflects selected month value", () => {
    render(<FilterBar {...defaultProps} selectedMonth="2026-03" />);
    const monthSelect = screen.getByLabelText("Mês") as HTMLSelectElement;
    expect(monthSelect.value).toBe("2026-03");
  });

  it("reflects selected product value", () => {
    render(<FilterBar {...defaultProps} selectedProduct="BitWord" />);
    const productSelect = screen.getByLabelText("Produto") as HTMLSelectElement;
    expect(productSelect.value).toBe("BitWord");
  });
});
