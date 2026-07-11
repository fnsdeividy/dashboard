import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VendorTable } from "./VendorTable";
import type { CostEntry, SortColumn } from "../types";

describe("VendorTable", () => {
  const sampleEntries: CostEntry[] = [
    {
      data: "2025-12",
      produto: "Coffstack",
      categoria: "Ferramentas/SaaS",
      descricao: "GitHub Pro",
      fornecedor: "GitHub",
      valor: 50.0,
      tipo: "Fixo",
      essencial: true,
      observacoes: "",
    },
    {
      data: "2025-12",
      produto: "BitWord",
      categoria: "Hospedagem/Cloud",
      descricao: "AWS S3",
      fornecedor: "Amazon",
      valor: 120.5,
      tipo: "Variável",
      essencial: false,
      observacoes: "storage",
    },
  ];

  const defaultProps = {
    entries: sampleEntries,
    sortColumn: "descricao" as SortColumn,
    sortDirection: "asc" as const,
    onSort: vi.fn(),
  };

  it("renders the section heading", () => {
    render(<VendorTable {...defaultProps} />);
    expect(
      screen.getByText("Detalhamento por Fornecedor")
    ).toBeInTheDocument();
  });

  it("renders table column headers", () => {
    render(<VendorTable {...defaultProps} />);
    const columnHeaders = screen.getAllByRole("columnheader");
    expect(columnHeaders).toHaveLength(6);
    expect(columnHeaders[0]).toHaveTextContent("Descrição");
    expect(columnHeaders[1]).toHaveTextContent("Fornecedor");
    expect(columnHeaders[2]).toHaveTextContent("Categoria");
    expect(columnHeaders[3]).toHaveTextContent("Valor (BRL)");
    expect(columnHeaders[4]).toHaveTextContent("Tipo");
    expect(columnHeaders[5]).toHaveTextContent("Essencial");
  });

  it("renders all entry rows with correct data", () => {
    render(<VendorTable {...defaultProps} />);

    expect(screen.getByText("GitHub Pro")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Ferramentas/SaaS")).toBeInTheDocument();
    expect(screen.getByText("R$ 50,00")).toBeInTheDocument();
    expect(screen.getByText("Fixo")).toBeInTheDocument();
    expect(screen.getByText("Sim")).toBeInTheDocument();

    expect(screen.getByText("AWS S3")).toBeInTheDocument();
    expect(screen.getByText("Amazon")).toBeInTheDocument();
    expect(screen.getByText("Hospedagem/Cloud")).toBeInTheDocument();
    expect(screen.getByText("R$ 120,50")).toBeInTheDocument();
    expect(screen.getByText("Variável")).toBeInTheDocument();
    expect(screen.getByText("Não")).toBeInTheDocument();
  });

  it("displays essencial as 'Sim' when true and 'Não' when false", () => {
    render(<VendorTable {...defaultProps} />);
    const rows = screen.getAllByRole("row");
    // Row 0 is header, row 1 is GitHub Pro (essencial=true), row 2 is AWS S3 (essencial=false)
    expect(rows[1]).toHaveTextContent("Sim");
    expect(rows[2]).toHaveTextContent("Não");
  });

  it("shows sort indicator on active sort column (ascending)", () => {
    render(<VendorTable {...defaultProps} sortColumn="descricao" sortDirection="asc" />);
    expect(screen.getByLabelText("sorted ascending")).toBeInTheDocument();
  });

  it("shows sort indicator on active sort column (descending)", () => {
    render(<VendorTable {...defaultProps} sortColumn="valor" sortDirection="desc" />);
    expect(screen.getByLabelText("sorted descending")).toBeInTheDocument();
  });

  it("does not show sort indicator on inactive columns", () => {
    render(<VendorTable {...defaultProps} sortColumn="descricao" sortDirection="asc" />);
    // Only one sort indicator should be present
    expect(screen.getAllByLabelText(/sorted/)).toHaveLength(1);
  });

  it("calls onSort with the correct column when a header is clicked", () => {
    const onSort = vi.fn();
    render(<VendorTable {...defaultProps} onSort={onSort} />);

    const headers = screen.getAllByRole("columnheader");

    fireEvent.click(headers[1]); // Fornecedor
    expect(onSort).toHaveBeenCalledWith("fornecedor");

    fireEvent.click(headers[3]); // Valor (BRL)
    expect(onSort).toHaveBeenCalledWith("valor");

    fireEvent.click(headers[4]); // Tipo
    expect(onSort).toHaveBeenCalledWith("tipo");
  });

  it("shows empty state message when entries array is empty", () => {
    render(<VendorTable {...defaultProps} entries={[]} />);
    expect(
      screen.getByText("Nenhum dado disponível para os filtros selecionados")
    ).toBeInTheDocument();
  });

  it("shows custom empty state message when provided", () => {
    render(
      <VendorTable {...defaultProps} entries={[]} emptyMessage="Nenhum resultado" />
    );
    expect(screen.getByText("Nenhum resultado")).toBeInTheDocument();
  });

  it("does not render a table when entries is empty", () => {
    render(<VendorTable {...defaultProps} entries={[]} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders a table when there are entries", () => {
    render(<VendorTable {...defaultProps} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("wraps table in overflow-x-auto container for responsive scrolling", () => {
    render(<VendorTable {...defaultProps} />);
    const table = screen.getByRole("table");
    const wrapper = table.parentElement;
    expect(wrapper).toHaveClass("overflow-x-auto");
  });
});
