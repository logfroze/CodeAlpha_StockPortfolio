import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  RefreshCw,
  Plus,
  Download,
  MoreHorizontal,
  Terminal,
  FileCode,
  Play,
  Check,
} from "lucide-react";

interface HeaderProps {
  activeTab: "dashboard" | "terminal" | "code";
  setActiveTab: (tab: "dashboard" | "terminal" | "code") => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  onOpenAddModal: () => void;
  onRunDemo: () => void;
  totalHoldingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefreshAll,
  isRefreshing,
  onOpenAddModal,
  onRunDemo,
  totalHoldingsCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-950 tracking-tight">
                  Portfolio Tracker
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-900 text-white shadow-xs">
                  CodeAlpha - Python - Task 02
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Live
                </span>
              </div>
            </div>

            {/* Navigation Tabs (Subtle Linear/Mercury style) */}
            <nav className="flex items-center space-x-1 border-l border-zinc-200 pl-4 py-0.5 text-xs">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  activeTab === "dashboard"
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab("terminal")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
                  activeTab === "terminal"
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Terminal className="w-3 h-3 text-zinc-400" />
                Terminal
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
                  activeTab === "code"
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <FileCode className="w-3 h-3 text-zinc-400" />
                Documentation
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={onRefreshAll}
              disabled={isRefreshing || totalHoldingsCount === 0}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-colors disabled:opacity-40"
              title="Refresh all quotes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-zinc-900" : ""}`} />
            </button>

            {/* Secondary Actions Overflow Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-colors"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md border border-zinc-200 shadow-md py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Export data
                  </div>
                  <a
                    href="/api/download/csv"
                    download="portfolio_summary.csv"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    Download CSV
                  </a>
                  <a
                    href="/api/download/txt"
                    download="portfolio_summary.txt"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    Download TXT summary
                  </a>

                  <div className="my-1 border-t border-zinc-100"></div>

                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Automation & tools
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onRunDemo();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50 transition-colors text-left"
                  >
                    <Play className="w-3.5 h-3.5 text-zinc-400" />
                    Run Python CLI demo
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab("terminal");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50 transition-colors text-left"
                  >
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                    Interactive console
                  </button>
                </div>
              )}
            </div>

            {/* Primary CTA Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add holding</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
