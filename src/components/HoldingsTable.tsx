import React, { useState, useMemo } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { StockHolding, PortfolioTotals } from "../types";

interface HoldingsTableProps {
  holdings: StockHolding[];
  totals: PortfolioTotals;
  onUpdateQuantity: (symbol: string, newQty: number) => void;
  onRemoveHolding: (symbol: string) => void;
  onRefreshSingle: (symbol: string) => void;
  onOpenAddModal: () => void;
  onLoadSample: () => void;
  refreshingSymbol: string | null;
}

type SortField = "symbol" | "price" | "change" | "quantity" | "value" | "allocation";
type SortDirection = "asc" | "desc";

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  totals,
  onUpdateQuantity,
  onRemoveHolding,
  onRefreshSingle,
  onOpenAddModal,
  onLoadSample,
  refreshingSymbol,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editQtyValue, setEditQtyValue] = useState<string>("");

  const startEdit = (symbol: string, currentQty: number) => {
    setEditingSymbol(symbol);
    setEditQtyValue(currentQty.toString());
  };

  const saveEdit = (symbol: string) => {
    const num = parseFloat(editQtyValue);
    if (!isNaN(num) && num > 0) {
      onUpdateQuantity(symbol, num);
      setEditingSymbol(null);
    }
  };

  const cancelEdit = () => {
    setEditingSymbol(null);
    setEditQtyValue("");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter & sort holdings
  const filteredAndSortedHoldings = useMemo(() => {
    let list = [...holdings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.symbol.toLowerCase().includes(q) ||
          h.name.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let aVal = 0;
      let bVal = 0;
      if (sortField === "symbol") {
        return sortDirection === "asc"
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      }
      if (sortField === "price") {
        aVal = a.price;
        bVal = b.price;
      } else if (sortField === "change") {
        aVal = a.change_pct ?? 0;
        bVal = b.change_pct ?? 0;
      } else if (sortField === "quantity") {
        aVal = a.quantity;
        bVal = b.quantity;
      } else if (sortField === "value" || sortField === "allocation") {
        aVal = a.value;
        bVal = b.value;
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [holdings, searchQuery, sortField, sortDirection]);

  if (holdings.length === 0) {
    return (
      <section className="bg-white border border-zinc-200 rounded-lg p-10 text-center mb-6">
        <h3 className="text-base font-semibold text-zinc-900">No positions in portfolio</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Add your first holding with live pricing or initialize with a sample portfolio.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add holding
          </button>
          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium hover:bg-zinc-200 transition"
          >
            Load sample holdings
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-zinc-200 rounded-lg overflow-hidden mb-6">
      {/* Table Toolbar / Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-zinc-950">Holdings</h3>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600">
            {holdings.length} {holdings.length === 1 ? "position" : "positions"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-zinc-400 w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add holding
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/75 border-b border-zinc-200/80 text-[11px] font-medium text-zinc-500">
              {/* Asset / Company (Left-aligned) */}
              <th className="py-2.5 px-4 font-medium">
                <button
                  onClick={() => handleSort("symbol")}
                  className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
                >
                  Asset
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* Price per share (Right-aligned) */}
              <th className="py-2.5 px-4 text-right font-medium">
                <button
                  onClick={() => handleSort("price")}
                  className="inline-flex items-center gap-1 ml-auto hover:text-zinc-900 transition-colors"
                >
                  Price per share
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* 24h change (Right-aligned) */}
              <th className="py-2.5 px-4 text-right font-medium">
                <button
                  onClick={() => handleSort("change")}
                  className="inline-flex items-center gap-1 ml-auto hover:text-zinc-900 transition-colors"
                >
                  24h change
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* Quantity (Right-aligned) */}
              <th className="py-2.5 px-4 text-right font-medium">
                <button
                  onClick={() => handleSort("quantity")}
                  className="inline-flex items-center gap-1 ml-auto hover:text-zinc-900 transition-colors"
                >
                  Quantity
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* Market value (Right-aligned) */}
              <th className="py-2.5 px-4 text-right font-medium">
                <button
                  onClick={() => handleSort("value")}
                  className="inline-flex items-center gap-1 ml-auto hover:text-zinc-900 transition-colors"
                >
                  Market value
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* Allocation (Right-aligned) */}
              <th className="py-2.5 px-4 text-right font-medium">
                <button
                  onClick={() => handleSort("allocation")}
                  className="inline-flex items-center gap-1 ml-auto hover:text-zinc-900 transition-colors"
                >
                  Allocation
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </button>
              </th>

              {/* Actions (Right-aligned) */}
              <th className="py-2.5 px-4 text-right font-medium w-20">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 text-xs">
            {filteredAndSortedHoldings.map((item) => {
              const allocationPct =
                totals.total_value > 0 ? (item.value / totals.total_value) * 100 : 0;
              const isItemRefreshing = refreshingSymbol === item.symbol;
              const isGain = (item.change_pct ?? 0) >= 0;

              return (
                <tr
                  key={item.symbol}
                  className="hover:bg-zinc-50/70 transition-colors group"
                >
                  {/* Symbol & Company Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded bg-zinc-100 border border-zinc-200/80 font-mono font-bold text-zinc-900 text-xs flex items-center justify-center">
                        {item.symbol.slice(0, 2)}
                      </span>
                      <div>
                        <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                          <span className="font-mono">{item.symbol}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price per share (Right-aligned) */}
                  <td className="py-3 px-4 text-right tabular-nums">
                    <span className="font-medium text-zinc-900 font-mono">
                      ${item.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  {/* 24h change (Right-aligned) */}
                  <td className="py-3 px-4 text-right tabular-nums">
                    {item.change_pct !== null && item.change_pct !== undefined ? (
                      <span
                        className={`inline-flex items-center font-medium ${
                          isGain ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isGain ? (
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        )}
                        {isGain ? "+" : ""}
                        {item.change_pct.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Quantity (Right-aligned) */}
                  <td className="py-3 px-4 text-right tabular-nums">
                    {editingSymbol === item.symbol ? (
                      <div className="inline-flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step="any"
                          min="0.001"
                          value={editQtyValue}
                          onChange={(e) => setEditQtyValue(e.target.value)}
                          className="w-16 px-1.5 py-0.5 text-xs text-right border border-zinc-300 rounded focus:outline-hidden focus:ring-1 focus:ring-zinc-500 font-mono"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(item.symbol);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <button
                          onClick={() => saveEdit(item.symbol)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-zinc-400 hover:text-zinc-600"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-end gap-1.5 group/edit">
                        <span className="font-mono text-zinc-800">
                          {item.quantity.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}
                        </span>
                        <button
                          onClick={() => startEdit(item.symbol, item.quantity)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 p-0.5 transition-opacity"
                          title="Edit shares"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Market value (Right-aligned) */}
                  <td className="py-3 px-4 text-right tabular-nums">
                    <div className="font-semibold text-zinc-950 font-mono">
                      ${item.value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </td>

                  {/* Allocation (Right-aligned) */}
                  <td className="py-3 px-4 text-right tabular-nums">
                    <div className="inline-flex flex-col items-end min-w-[70px]">
                      <span className="font-mono text-zinc-600 text-[11px]">
                        {allocationPct.toFixed(1)}%
                      </span>
                      <div className="w-16 bg-zinc-100 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-zinc-800 h-1 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, allocationPct))}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Actions (Right-aligned) */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        onClick={() => onRefreshSingle(item.symbol)}
                        disabled={isItemRefreshing}
                        className="p-1 text-zinc-400 hover:text-zinc-800 rounded transition"
                        title="Refresh quote"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            isItemRefreshing ? "animate-spin text-zinc-800" : ""
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => onRemoveHolding(item.symbol)}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded transition"
                        title="Remove position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer */}
          <tfoot className="bg-zinc-50/75 border-t border-zinc-200 text-xs font-medium text-zinc-800">
            <tr>
              <td className="py-2.5 px-4 text-zinc-500 font-medium">Portfolio total</td>
              <td className="py-2.5 px-4 text-right text-zinc-400">—</td>
              <td className="py-2.5 px-4 text-right text-zinc-400">—</td>
              <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-zinc-900">
                {totals.total_shares.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </td>
              <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-zinc-950">
                ${totals.total_value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-[11px] text-zinc-600 tabular-nums">
                100.0%
              </td>
              <td className="py-2.5 px-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};
