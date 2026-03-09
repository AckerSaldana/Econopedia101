import { describe, it, expect } from 'vitest';
import { calculateROI } from '../roi';

describe('calculateROI', () => {
  it('calculates basic ROI correctly', () => {
    const result = calculateROI({
      initialInvestment: 1000,
      finalValue: 1500,
      years: 1,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalROI).toBe(50);
    expect(result.data.absoluteGain).toBe(500);
    expect(result.data.annualizedReturn).toBe(50);
  });

  it('calculates annualized return for multi-year period', () => {
    const result = calculateROI({
      initialInvestment: 1000,
      finalValue: 2000,
      years: 5,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalROI).toBe(100);
    // (2000/1000)^(1/5) - 1 = ~14.87%
    expect(result.data.annualizedReturn).toBeCloseTo(14.87, 1);
  });

  it('handles loss scenario', () => {
    const result = calculateROI({
      initialInvestment: 1000,
      finalValue: 500,
      years: 2,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalROI).toBe(-50);
    expect(result.data.absoluteGain).toBe(-500);
    expect(result.data.annualizedReturn).toBeLessThan(0);
  });

  it('handles zero final value', () => {
    const result = calculateROI({
      initialInvestment: 1000,
      finalValue: 0,
      years: 1,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalROI).toBe(-100);
    expect(result.data.absoluteGain).toBe(-1000);
  });

  it('rejects zero initial investment', () => {
    const result = calculateROI({
      initialInvestment: 0,
      finalValue: 1000,
      years: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative years', () => {
    const result = calculateROI({
      initialInvestment: 1000,
      finalValue: 1500,
      years: -1,
    });
    expect(result.success).toBe(false);
  });

  it('generates yearly breakdown', () => {
    const result = calculateROI({
      initialInvestment: 1000,
      finalValue: 2000,
      years: 3,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.yearlyBreakdown).toHaveLength(4); // year 0 + 3 years
    expect(result.data.yearlyBreakdown[0].year).toBe(0);
    expect(result.data.yearlyBreakdown[0].balance).toBe(1000);
    expect(result.data.yearlyBreakdown[3].balance).toBeCloseTo(2000, 0);
  });

  it('handles breakeven (no gain/loss)', () => {
    const result = calculateROI({
      initialInvestment: 5000,
      finalValue: 5000,
      years: 3,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalROI).toBe(0);
    expect(result.data.absoluteGain).toBe(0);
    expect(result.data.annualizedReturn).toBe(0);
  });
});
