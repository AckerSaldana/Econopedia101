import { z } from 'zod';
import {
  type CalculatorResponse,
  type YearlyBreakdown,
  formatCurrency,
  formatPercentage,
  round2,
  round4,
} from './types';

export const roiSchema = z.object({
  initialInvestment: z.number().min(0.01, 'Initial investment must be greater than 0').max(1_000_000_000, 'Maximum is 1 billion'),
  finalValue: z.number().min(0, 'Final value must be 0 or more').max(1_000_000_000, 'Maximum is 1 billion'),
  years: z.number().min(0.1, 'Minimum period is 0.1 years').max(100, 'Maximum period is 100 years'),
});

export type ROIInput = z.infer<typeof roiSchema>;

export interface ROIResult {
  totalROI: number;
  annualizedReturn: number;
  absoluteGain: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export function calculateROI(
  input: ROIInput,
): CalculatorResponse<ROIResult> {
  const parsed = roiSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { initialInvestment, finalValue, years } = parsed.data;

  const absoluteGain = round2(finalValue - initialInvestment);
  const totalROI = round4((absoluteGain / initialInvestment) * 100);

  // Annualized return: (FV/PV)^(1/n) - 1
  const annualizedReturn = finalValue > 0
    ? round4((Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100)
    : -100;

  // Generate yearly breakdown using annualized return
  const yearlyBreakdown: YearlyBreakdown[] = [];
  const fullYears = Math.ceil(years);

  for (let year = 0; year <= fullYears; year++) {
    const t = Math.min(year, years);
    const balance = round2(
      initialInvestment * Math.pow(1 + annualizedReturn / 100, t),
    );
    yearlyBreakdown.push({
      year,
      balance,
      interest: round2(balance - initialInvestment),
      contributions: initialInvestment,
    });
  }

  return {
    success: true,
    data: {
      totalROI,
      annualizedReturn,
      absoluteGain,
      yearlyBreakdown,
    },
  };
}

export function formatROIResult(data: ROIResult) {
  return {
    totalROI: formatPercentage(data.totalROI),
    annualizedReturn: formatPercentage(data.annualizedReturn),
    absoluteGain: formatCurrency(data.absoluteGain),
  };
}
