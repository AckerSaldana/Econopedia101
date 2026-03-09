export interface YearlyBreakdown {
  year: number;
  balance: number;
  interest: number;
  contributions: number;
}

export interface CalculatorResult<T> {
  success: true;
  data: T;
}

export interface CalculatorError {
  success: false;
  error: string;
}

export type CalculatorResponse<T> = CalculatorResult<T> | CalculatorError;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '' : ''}${value.toFixed(2)}%`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
