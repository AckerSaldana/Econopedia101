import { z } from 'zod';
import {
  type CalculatorResponse,
  type YearlyBreakdown,
  formatCurrency,
  formatPercentage,
  round2,
} from './types';

export const inflationSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(1_000_000_000, 'Maximum is 1 billion'),
  rate: z.number().min(0, 'Inflation rate must be 0 or more').max(100, 'Maximum rate is 100%'),
  years: z.number().int().min(1, 'Minimum period is 1 year').max(100, 'Maximum period is 100 years'),
});

export type InflationInput = z.infer<typeof inflationSchema>;

export interface InflationResult {
  futureNominalValue: number;
  purchasingPower: number;
  valueLost: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export function calculateInflation(
  input: InflationInput,
): CalculatorResponse<InflationResult> {
  const parsed = inflationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { amount, rate, years } = parsed.data;
  const r = rate / 100;

  // Future nominal value: what you'd need in the future to match today's amount
  const futureNominalValue = round2(amount * Math.pow(1 + r, years));

  // Purchasing power: what today's amount will be worth in future terms
  const purchasingPower = round2(amount / Math.pow(1 + r, years));

  const valueLost = round2(amount - purchasingPower);

  const yearlyBreakdown: YearlyBreakdown[] = [];
  for (let year = 0; year <= years; year++) {
    const power = round2(amount / Math.pow(1 + r, year));
    yearlyBreakdown.push({
      year,
      balance: power,
      interest: round2(amount - power),
      contributions: amount,
    });
  }

  return {
    success: true,
    data: {
      futureNominalValue,
      purchasingPower,
      valueLost,
      yearlyBreakdown,
    },
  };
}

export function formatInflationResult(data: InflationResult) {
  return {
    futureNominalValue: formatCurrency(data.futureNominalValue),
    purchasingPower: formatCurrency(data.purchasingPower),
    valueLost: formatCurrency(data.valueLost),
    totalLossPercent: formatPercentage(
      data.purchasingPower > 0
        ? ((data.valueLost) / (data.purchasingPower + data.valueLost)) * 100
        : 100,
    ),
  };
}
