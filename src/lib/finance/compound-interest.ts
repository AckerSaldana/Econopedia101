import { z } from 'zod';
import {
  type CalculatorResponse,
  type YearlyBreakdown,
  formatCurrency,
  formatPercentage,
  round2,
} from './types';

export const compoundInterestSchema = z.object({
  principal: z.number().min(0, 'Initial deposit must be 0 or more').max(1_000_000_000, 'Maximum deposit is 1 billion'),
  monthlyContribution: z.number().min(0, 'Monthly contribution must be 0 or more').max(1_000_000, 'Maximum monthly contribution is 1 million'),
  rate: z.number().min(0, 'Interest rate must be 0 or more').max(100, 'Maximum rate is 100%'),
  years: z.number().int().min(1, 'Minimum period is 1 year').max(100, 'Maximum period is 100 years'),
  frequency: z.enum(['monthly', 'quarterly', 'annually']),
});

export type CompoundInterestInput = z.infer<typeof compoundInterestSchema>;

export interface CompoundInterestResult {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export function calculateCompoundInterest(
  input: CompoundInterestInput,
): CalculatorResponse<CompoundInterestResult> {
  const parsed = compoundInterestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { principal, monthlyContribution, rate, years, frequency } = parsed.data;

  const n = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const r = rate / 100;

  const yearlyBreakdown: YearlyBreakdown[] = [];
  let balance = principal;
  let totalContributions = principal;

  for (let year = 1; year <= years; year++) {
    let yearStartBalance = balance;
    for (let period = 0; period < n; period++) {
      // Add monthly contributions for each month in this compounding period
      const monthsInPeriod = 12 / n;
      balance += monthlyContribution * monthsInPeriod;
      totalContributions += monthlyContribution * monthsInPeriod;
      // Apply interest for this compounding period
      balance *= 1 + r / n;
    }
    const yearInterest = balance - yearStartBalance - monthlyContribution * 12;

    yearlyBreakdown.push({
      year,
      balance: round2(balance),
      interest: round2(yearInterest),
      contributions: round2(totalContributions),
    });
  }

  const finalAmount = round2(balance);
  const totalInterest = round2(finalAmount - totalContributions);

  return {
    success: true,
    data: {
      finalAmount,
      totalContributions: round2(totalContributions),
      totalInterest,
      yearlyBreakdown,
    },
  };
}

export function formatCompoundInterestResult(data: CompoundInterestResult) {
  return {
    finalAmount: formatCurrency(data.finalAmount),
    totalContributions: formatCurrency(data.totalContributions),
    totalInterest: formatCurrency(data.totalInterest),
    effectiveReturn: formatPercentage(
      data.totalContributions > 0
        ? ((data.finalAmount - data.totalContributions) / data.totalContributions) * 100
        : 0,
    ),
  };
}
