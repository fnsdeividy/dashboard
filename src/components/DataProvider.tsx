import { createContext, useContext } from "react";
import type { CostEntry, RevenueEntry } from "../types";
import { useDataLoader } from "../hooks/useDataLoader";

interface DataContextValue {
  entries: CostEntry[];
  revenueEntries: RevenueEntry[];
  months: string[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { entries, revenueEntries, months, loading, error, retry } = useDataLoader();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-dark-bg"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-4 border-dark-border border-t-purple-accent rounded-full animate-spin"
            aria-hidden="true"
          />
          <p className="text-text-secondary text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-dark-bg"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center gap-4 p-6 max-w-md text-center">
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 min-w-[44px] min-h-[44px] bg-purple-accent text-white rounded hover:bg-purple-accent/80 focus:outline-none focus:ring-2 focus:ring-purple-accent focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ entries, revenueEntries, months, loading, error, retry }}>
      {children}
    </DataContext.Provider>
  );
}
