import { z } from 'zod';
import {
  type CalculatorResponse,
  formatCurrency,
  formatPercentage,
  round2,
  round4,
} from './types';

export const profitLossSchema = z.object({
  revenuePerUnit: z.number().min(0, 'Revenue per unit must be 0 or more').max(1_000_000_000, 'Maximum is 1 billion'),
  costPerUnit: z.number().min(0, 'Cost per unit must be 0 or more').max(1_000_000_000, 'Maximum is 1 billion'),
  unitsSold: z.number().int().min(0, 'Units sold must be 0 or more').max(1_000_000_000, 'Maximum is 1 billion'),
  fixedCosts: z.number().min(0, 'Fixed costs must be 0 or more').max(1_000_000_000, 'Maximum is 1 billion'),
});

export type ProfitLossInput = z.infer<typeof profitLossSchema>;

export interface ProfitLossResult {
  totalRevenue: number;
  totalVariableCosts: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  breakevenUnits: number | null;
}

export function calculateProfitLoss(
  input: ProfitLossInput,
): CalculatorResponse<ProfitLossResult> {
  const parsed = profitLossSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { revenuePerUnit, costPerUnit, unitsSold, fixedCosts } = parsed.data;

  const totalRevenue = round2(revenuePerUnit * unitsSold);
  const totalVariableCosts = round2(costPerUnit * unitsSold);
  const grossProfit = round2(totalRevenue - totalVariableCosts);
  const netProfit = round2(grossProfit - fixedCosts);

  const profitMargin = totalRevenue > 0
    ? round4((netProfit / totalRevenue) * 100)
    : 0;

  // Breakeven: fixedCosts / (revenuePerUnit - costPerUnit)
  const contributionMargin = revenuePerUnit - costPerUnit;
  const breakevenUnits = contributionMargin > 0
    ? Math.ceil(fixedCosts / contributionMargin)
    : null;

  return {
    success: true,
    data: {
      totalRevenue,
      totalVariableCosts,
      grossProfit,
      netProfit,
      profitMargin,
      breakevenUnits,
    },
  };
}

export function formatProfitLossResult(data: ProfitLossResult) {
  return {
    totalRevenue: formatCurrency(data.totalRevenue),
    totalVariableCosts: formatCurrency(data.totalVariableCosts),
    grossProfit: formatCurrency(data.grossProfit),
    netProfit: formatCurrency(data.netProfit),
    profitMargin: formatPercentage(data.profitMargin),
    breakevenUnits: data.breakevenUnits !== null
      ? `${data.breakevenUnits.toLocaleString('en-GB')} units`
      : 'N/A (costs exceed revenue per unit)',
  };
}
