export interface StockHolding {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  currency: string;
  source: string;
  change_pct?: number | null;
  updated_at?: string;
}

export interface PortfolioTotals {
  total_value: number;
  total_holdings: number;
  total_shares: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  source: string;
  change_pct?: number | null;
  success: boolean;
  error?: string;
}

export interface TerminalExecutionResult {
  success: boolean;
  command: string;
  stdout: string;
  stderr: string;
  code: number;
}
