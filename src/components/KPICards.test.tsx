import { render, screen } from "@testing-library/react";
import { KPICards } from "./KPICards";

describe("KPICards", () => {
  it("displays the monthly cost title and formatted value", () => {
    render(<KPICards total="R$ 1.234,56" />);

    expect(screen.getByText("Custos do mês")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.234,56")).toBeInTheDocument();
  });

  it("displays BRL currency indicator", () => {
    render(<KPICards total="R$ 500,00" />);

    expect(screen.getByText("BRL")).toBeInTheDocument();
    expect(screen.getByText("Moeda")).toBeInTheDocument();
  });

  it("displays zero value when no entries match", () => {
    render(<KPICards total="R$ 0,00" />);

    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
  });

  it("shows error state when error prop is true", () => {
    render(<KPICards total="R$ 1.000,00" error={true} />);

    expect(screen.getByText("Erro ao carregar dados")).toBeInTheDocument();
    expect(screen.queryByText("R$ 1.000,00")).not.toBeInTheDocument();
  });

  it("does not show error message when error is false", () => {
    render(<KPICards total="R$ 2.500,00" error={false} />);

    expect(screen.queryByText("Erro ao carregar dados")).not.toBeInTheDocument();
    expect(screen.getByText("R$ 2.500,00")).toBeInTheDocument();
  });

  it("renders with accessible section landmark", () => {
    render(<KPICards total="R$ 100,00" />);

    expect(screen.getByRole("region", { name: "Indicadores" })).toBeInTheDocument();
  });

  it("stacks vertically by default (flex-col) and horizontally on md breakpoint", () => {
    const { container } = render(<KPICards total="R$ 100,00" />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("flex-col", "md:flex-row");
  });
});
