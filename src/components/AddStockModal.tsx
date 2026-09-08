import React, { useState, useEffect } from "react";
import { X, Search, Loader2, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StockQuote, StockHolding } from "../types";

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (symbol: string, quantity: number, mode: "add" | "replace") => void;
  existingHolding?: StockHolding;
}

const POPULAR_TICKERS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "META", name: "Meta" },
];

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onAddStock,
  existingHolding,
}) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("5");
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [mode, setMode] = useState<"add" | "replace">("add");

  useEffect(() => {
    if (!isOpen) {
      setSymbol("");
      setQuantity("5");
      setQuote(null);
      setQuoteError(null);
      setMode("add");
    } else if (existingHolding) {
      setSymbol(existingHolding.symbol);
      setQuantity(existingHolding.quantity.toString());
      fetchQuote(existingHolding.symbol);
    }
  }, [isOpen, existingHolding]);

  const fetchQuote = async (symToFetch: string) => {
    const cleanSym = symToFetch.trim().toUpperCase();
    if (!cleanSym) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    setIsLoadingQuote(true);
    setQuoteError(null);

    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(cleanSym)}`);
      const data = await res.json();

      if (data.success) {
        setQuote(data);
        setQuoteError(null);
      } else {
        setQuote(null);
        setQuoteError(data.error || `Symbol ${cleanSym} not found`);
      }
    } catch {
      setQuote(null);
      setQuoteError("Unable to fetch market quote");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSymbol(val);
  };

  const handleSelectTicker = (sym: string) => {
    setSymbol(sym);
    fetchQuote(sym);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantity);
    if (!symbol || isNaN(qtyNum) || qtyNum <= 0) {
      return;
    }
    onAddStock(symbol.toUpperCase(), qtyNum, mode);
    onClose();
  };

  if (!isOpen) return null;

  const qtyNumber = parseFloat(quantity) || 0;
  const unitPrice = quote?.price || 0;
  const totalValue = qtyNumber * unitPrice;
  const isDuplicate = Boolean(existingHolding);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-950">
            {isDuplicate ? `Update ${existingHolding?.symbol} position` : "Add holding"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Symbol Input */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1.5">
              Ticker symbol
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. AAPL, NVDA, MSFT"
                value={symbol}
                onChange={handleSymbolChange}
                onBlur={() => symbol && fetchQuote(symbol)}
                className="w-full pl-8 pr-20 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-zinc-500 font-mono uppercase"
                required
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <button
                type="button"
                onClick={() => fetchQuote(symbol)}
                disabled={!symbol || isLoadingQuote}
                className="absolute right-1.5 top-1.5 px-2 py-1 text-[11px] font-medium bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded transition disabled:opacity-40"
              >
                {isLoadingQuote ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Quote"
                )}
              </button>
            </div>

            {/* Quick ticker suggestions */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-zinc-400">Popular:</span>
              {POPULAR_TICKERS.map((t) => (
                <button
                  key={t.symbol}
                  type="button"
                  onClick={() => handleSelectTicker(t.symbol)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition ${
                    symbol === t.symbol
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {t.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Quote info strip if available */}
          {quote && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-900">{quote.name}</div>
                <div className="text-[11px] text-zinc-400">
                  {quote.currency} · {quote.source}
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="font-mono font-semibold text-zinc-950">
                  ${quote.price.toFixed(2)}
                </div>
                {quote.change_pct !== null && quote.change_pct !== undefined && (
                  <div
                    className={`text-[11px] font-medium inline-flex items-center ${
                      quote.change_pct >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {quote.change_pct >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    )}
                    {quote.change_pct >= 0 ? "+" : ""}
                    {quote.change_pct.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          )}

          {quoteError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-[11px]">
              {quoteError}
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1.5">
              Number of shares
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-zinc-500 font-mono"
              placeholder="e.g. 10.0"
              required
            />
          </div>

          {/* Existing holding adjustment option */}
          {isDuplicate && (
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-1.5">
              <span className="text-zinc-600 block text-[11px] font-medium">
                Current position: {existingHolding?.quantity} shares
              </span>
              <div className="flex gap-3 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "add"}
                    onChange={() => setMode("add")}
                    className="text-zinc-900"
                  />
                  <span>Add to current shares (+{qtyNumber})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "replace"}
                    onChange={() => setMode("replace")}
                    className="text-zinc-900"
                  />
                  <span>Replace quantity</span>
                </label>
              </div>
            </div>
          )}

          {/* Calculated Total Position Value */}
          {quote && (
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Estimated position value</span>
              <span className="font-mono font-bold text-zinc-950 tabular-nums">
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-zinc-600 hover:bg-zinc-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!symbol || !quantity || isLoadingQuote}
              className="px-3.5 py-1.5 rounded-md bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {isDuplicate ? "Update holding" : "Add holding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
