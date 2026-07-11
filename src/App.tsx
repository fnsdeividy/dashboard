import { DataProvider } from "./components/DataProvider";
import { Dashboard } from "./components/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-dark-bg overflow-x-hidden relative noise-overlay">
      {/* Ambient glow orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      {/* Top gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold gradient-text sm:text-3xl tracking-tight">
            Financial Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Visão geral dos seus custos e despesas
          </p>
        </header>
        <main>
          <DataProvider>
            <Dashboard />
          </DataProvider>
        </main>
      </div>
    </div>
  );
}

export default App;
