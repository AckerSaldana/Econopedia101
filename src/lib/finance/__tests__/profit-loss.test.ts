import { describe, it, expect } from 'vitest';
import { calculateProfitLoss } from '../profit-loss';

describe('calculateProfitLoss', () => {
  it('calculates basic profit correctly', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: 50,
      costPerUnit: 30,
      unitsSold: 100,
      fixedCosts: 500,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalRevenue).toBe(5000);
    expect(result.data.totalVariableCosts).toBe(3000);
    expect(result.data.grossProfit).toBe(2000);
    expect(result.data.netProfit).toBe(1500);
  });

  it('calculates profit margin correctly', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: 100,
      costPerUnit: 60,
      unitsSold: 10,
      fixedCosts: 0,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.profitMargin).toBe(40);
  });

  it('calculates breakeven correctly', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: 50,
      costPerUnit: 30,
      unitsSold: 0,
      fixedCosts: 1000,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    // breakeven = 1000 / (50 - 30) = 50 units
    expect(result.data.breakevenUnits).toBe(50);
  });

  it('returns null breakeven when costs exceed revenue per unit', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: 20,
      costPerUnit: 30,
      unitsSold: 10,
      fixedCosts: 100,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.breakevenUnits).toBeNull();
  });

  it('handles zero units sold', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: 50,
      costPerUnit: 30,
      unitsSold: 0,
      fixedCosts: 500,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalRevenue).toBe(0);
    expect(result.data.netProfit).toBe(-500);
  });

  it('handles zero fixed costs', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: 10,
      costPerUnit: 5,
      unitsSold: 100,
      fixedCosts: 0,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.grossProfit).toBe(500);
    expect(result.data.netProfit).toBe(500);
    expect(result.data.breakevenUnits).toBe(0);
  });

  it('rejects negative revenue', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: -10,
      costPerUnit: 5,
      unitsSold: 100,
      fixedCosts: 0,
    });
    expect(result.success).toBe(false);
  });

  it('handles equal revenue and cost (zero margin)', () => {
    const result = calculateProfitLoss({
      revenuePerUnit: 50,
      costPerUnit: 50,
      unitsSold: 100,
      fixedCosts: 500,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.grossProfit).toBe(0);
    expect(result.data.breakevenUnits).toBeNull();
  });
});
