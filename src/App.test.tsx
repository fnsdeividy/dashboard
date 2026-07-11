import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

// Mock the DataProvider to avoid actual data fetching in unit tests
vi.mock("./components/DataProvider", () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="data-provider">{children}</div>
  ),
  useData: () => ({
    entries: [],
    revenueEntries: [],
    months: [],
    loading: false,
    error: null,
    retry: vi.fn(),
  }),
}));

// Mock the Dashboard component
vi.mock("./components/Dashboard", () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>,
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard heading", () => {
    render(<App />);
    expect(screen.getByText("Financial Dashboard")).toBeInTheDocument();
  });

  it("renders with DataProvider wrapping Dashboard", () => {
    render(<App />);
    const provider = screen.getByTestId("data-provider");
    const dashboard = screen.getByTestId("dashboard");
    expect(provider).toBeInTheDocument();
    expect(dashboard).toBeInTheDocument();
    // Dashboard should be inside DataProvider
    expect(provider).toContainElement(dashboard);
  });

  it("applies responsive container layout", () => {
    render(<App />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Financial Dashboard");
  });

  it("has a main landmark for accessibility", () => {
    render(<App />);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
  });

  it("prevents horizontal scrolling with overflow-x-hidden", () => {
    const { container } = render(<App />);
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.className).toContain("overflow-x-hidden");
  });
});
