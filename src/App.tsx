import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HeroPortfolioOverview } from "./components/HeroPortfolioOverview";
import { HoldingsTable } from "./components/HoldingsTable";
import { AddStockModal } from "./components/AddStockModal";
import { TerminalView } from "./components/TerminalView";
import { CodeViewer } from "./components/CodeViewer";
import { StockHolding, PortfolioTotals } from "./types";

const INITIAL_HOLDINGS: Record<string, number> = {
  AAPL: 5.0,
  TSLA: 2.0,
  MSFT: 3.0,
};

export default function App() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [totals, setTotals] = useState<PortfolioTotals>({
    total_value: 0,
    total_holdings: 0,
    total_shares: 0,
  });
  const [activeTab, setActiveTab] = useState<"dashboard" | "terminal" | "code">("dashboard");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHoldingForEdit, setSelectedHoldingForEdit] = useState<StockHolding | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingSymbol, setRefreshingSymbol] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Recalculate totals from holdings array
  const computeTotals = (items: StockHolding[]): PortfolioTotals => {
    const total_value = items.reduce((sum, i) => sum + i.value, 0);
    const total_shares = items.reduce((sum, i) => sum + i.quantity, 0);
    return {
      total_value: Math.round(total_value * 100) / 100,
      total_holdings: items.length,
      total_shares: Math.round(total_shares * 10000) / 10000,
    };
  };

  // Fetch live portfolio data via Python backend
  const calculateLivePortfolio = async (rawHoldings: Record<string, number>) => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/calc-holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: rawHoldings }),
      });
      const data = await res.json();
      if (data.success && data.portfolio) {
        const holdingList: StockHolding[] = Object.values(data.portfolio);
        setHoldings(holdingList);
        setTotals(data.totals || computeTotals(holdingList));
      }
    } catch (e) {
      console.error("Failed to fetch live portfolio calculation", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem("codealpha_portfolio");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) {
          calculateLivePortfolio(parsed);
          return;
        }
      } catch {
        // Fallback to default
      }
    }
    calculateLivePortfolio(INITIAL_HOLDINGS);
  }, []);

  // Save changes to localStorage
  const persistHoldings = (items: StockHolding[]) => {
    const map: Record<string, number> = {};
    items.forEach((h) => {
      map[h.symbol] = h.quantity;
    });
    localStorage.setItem("codealpha_portfolio", JSON.stringify(map));
  };

  // Add or update a stock
  const handleAddStock = async (symbol: string, quantity: number, mode: "add" | "replace") => {
    const sym = symbol.toUpperCase();
    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`);
      const quote = await res.json();
      const price = quote.success ? quote.price : 100.0;
      const name = quote.success ? quote.name : sym;
      const source = quote.success ? quote.source : "Manual";
      const change_pct = quote.change_pct ?? null;
      const currency = quote.currency || "USD";

      setHoldings((prev) => {
        const existingIdx = prev.findIndex((h) => h.symbol === sym);
        let updated: StockHolding[];

        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          const newQty = mode === "add" ? existing.quantity + quantity : quantity;
          const newHolding: StockHolding = {
            ...existing,
            quantity: newQty,
            price,
            value: Math.round(newQty * price * 100) / 100,
            source,
            change_pct,
            updated_at: new Date().toLocaleTimeString(),
          };
          updated = [...prev];
          updated[existingIdx] = newHolding;
        } else {
          const newHolding: StockHolding = {
            symbol: sym,
            name,
            quantity,
            price,
            value: Math.round(quantity * price * 100) / 100,
            currency,
            source,
            change_pct,
            updated_at: new Date().toLocaleTimeString(),
          };
          updated = [...prev, newHolding];
        }

        setTotals(computeTotals(updated));
        persistHoldings(updated);
        return updated;
      });

      showNotification(`Added ${quantity} shares of ${sym} to portfolio.`);
    } catch {
      showNotification(`Failed to quote ${sym}`);
    }
  };

  // Remove a stock
  const handleRemoveHolding = (symbol: string) => {
    setHoldings((prev) => {
      const updated = prev.filter((h) => h.symbol !== symbol);
      setTotals(computeTotals(updated));
      persistHoldings(updated);
      return updated;
    });
    showNotification(`Removed ${symbol} from portfolio.`);
  };

  // Update quantity directly
  const handleUpdateQuantity = (symbol: string, newQty: number) => {
    setHoldings((prev) => {
      const updated = prev.map((h) => {
        if (h.symbol === symbol) {
          return {
            ...h,
            quantity: newQty,
            value: Math.round(newQty * h.price * 100) / 100,
            updated_at: new Date().toLocaleTimeString(),
          };
        }
        return h;
      });
      setTotals(computeTotals(updated));
      persistHoldings(updated);
      return updated;
    });
    showNotification(`Updated ${symbol} quantity to ${newQty}.`);
  };

  // Refresh single stock price
  const handleRefreshSingle = async (symbol: string) => {
    setRefreshingSymbol(symbol);
    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      const quote = await res.json();
      if (quote.success) {
        setHoldings((prev) => {
          const updated = prev.map((h) => {
            if (h.symbol === symbol) {
              return {
                ...h,
                price: quote.price,
                name: quote.name,
                source: quote.source,
                change_pct: quote.change_pct,
                value: Math.round(h.quantity * quote.price * 100) / 100,
                updated_at: new Date().toLocaleTimeString(),
              };
            }
            return h;
          });
          setTotals(computeTotals(updated));
          return updated;
        });
        showNotification(`Refreshed ${symbol}: $${quote.price.toFixed(2)}`);
      }
    } catch {
      showNotification(`Failed to refresh ${symbol}`);
    } finally {
      setRefreshingSymbol(null);
    }
  };

  // Refresh all holdings
  const handleRefreshAll = () => {
    const map: Record<string, number> = {};
    holdings.forEach((h) => {
      map[h.symbol] = h.quantity;
    });
    calculateLivePortfolio(map);
    showNotification("Refreshed all holdings with live market quotes.");
  };

  // Load sample portfolio
  const handleLoadSample = () => {
    calculateLivePortfolio(INITIAL_HOLDINGS);
    showNotification("Loaded baseline portfolio (AAPL, TSLA, MSFT).");
  };

  const handleRunDemo = () => {
    setActiveTab("terminal");
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshing}
        onOpenAddModal={() => {
          setSelectedHoldingForEdit(undefined);
          setIsAddModalOpen(true);
        }}
        onRunDemo={handleRunDemo}
        totalHoldingsCount={holdings.length}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-3.5 py-2 rounded-md shadow-lg text-xs font-medium border border-zinc-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Visual Hero: Portfolio Value + daily P/L + clean performance line chart */}
            <HeroPortfolioOverview totals={totals} holdings={holdings} />

            {/* Holdings Table: Primary component with right-aligned numbers and clean formatting */}
            <HoldingsTable
              holdings={holdings}
              totals={totals}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveHolding={handleRemoveHolding}
              onRefreshSingle={handleRefreshSingle}
              onOpenAddModal={() => {
                setSelectedHoldingForEdit(undefined);
                setIsAddModalOpen(true);
              }}
              onLoadSample={handleLoadSample}
              refreshingSymbol={refreshingSymbol}
            />
          </div>
        )}

        {activeTab === "terminal" && <TerminalView />}
        {activeTab === "code" && <CodeViewer />}
      </main>

      {/* Add / Edit Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStock={handleAddStock}
        existingHolding={selectedHoldingForEdit}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-4 mt-auto text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-medium text-zinc-600">Portfolio Tracker</span> · Real-time market feed
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>NYSE / NASDAQ data</span>
            <span>•</span>
            <span>Local persistence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
