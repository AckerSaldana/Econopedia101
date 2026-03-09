import { describe, it, expect } from 'vitest';
import { calculateInflation } from '../inflation';

describe('calculateInflation', () => {
  it('calculates inflation impact correctly', () => {
    const result = calculateInflation({
      amount: 1000,
      rate: 3,
      years: 10,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    // Future nominal value: 1000 * (1.03)^10 = 1343.92
    expect(result.data.futureNominalValue).toBeCloseTo(1343.92, 0);
    // Purchasing power: 1000 / (1.03)^10 = 744.09
    expect(result.data.purchasingPower).toBeCloseTo(744.09, 0);
    expect(result.data.valueLost).toBeCloseTo(255.91, 0);
  });

  it('handles zero inflation', () => {
    const result = calculateInflation({
      amount: 1000,
      rate: 0,
      years: 10,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.futureNominalValue).toBe(1000);
    expect(result.data.purchasingPower).toBe(1000);
    expect(result.data.valueLost).toBe(0);
  });

  it('generates correct yearly breakdown', () => {
    const result = calculateInflation({
      amount: 1000,
      rate: 5,
      years: 5,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.yearlyBreakdown).toHaveLength(6); // year 0 through 5
    expect(result.data.yearlyBreakdown[0].balance).toBe(1000);
    expect(result.data.yearlyBreakdown[0].year).toBe(0);
    expect(result.data.yearlyBreakdown[5].year).toBe(5);
  });

  it('rejects zero amount', () => {
    const result = calculateInflation({
      amount: 0,
      rate: 3,
      years: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative rate', () => {
    const result = calculateInflation({
      amount: 1000,
      rate: -5,
      years: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects years over 100', () => {
    const result = calculateInflation({
      amount: 1000,
      rate: 3,
      years: 101,
    });
    expect(result.success).toBe(false);
  });

  it('handles high inflation correctly', () => {
    const result = calculateInflation({
      amount: 10000,
      rate: 50,
      years: 5,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.purchasingPower).toBeLessThan(2000);
    expect(result.data.futureNominalValue).toBeGreaterThan(50000);
  });

  it('1 year at 100% halves purchasing power', () => {
    const result = calculateInflation({
      amount: 1000,
      rate: 100,
      years: 1,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.purchasingPower).toBe(500);
    expect(result.data.futureNominalValue).toBe(2000);
  });
});
