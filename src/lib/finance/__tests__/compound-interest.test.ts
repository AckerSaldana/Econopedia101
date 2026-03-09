import { describe, it, expect } from 'vitest';
import { calculateCompoundInterest } from '../compound-interest';

describe('calculateCompoundInterest', () => {
  it('calculates simple compound interest correctly', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 0,
      rate: 10,
      years: 1,
      frequency: 'annually',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.finalAmount).toBe(1100);
    expect(result.data.totalInterest).toBe(100);
    expect(result.data.totalContributions).toBe(1000);
  });

  it('calculates monthly compounding correctly', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 0,
      rate: 12,
      years: 1,
      frequency: 'monthly',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    // (1 + 0.12/12)^12 * 1000 = 1126.83
    expect(result.data.finalAmount).toBeCloseTo(1126.83, 0);
  });

  it('handles monthly contributions', () => {
    const result = calculateCompoundInterest({
      principal: 0,
      monthlyContribution: 100,
      rate: 0,
      years: 1,
      frequency: 'monthly',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalContributions).toBe(1200);
    expect(result.data.finalAmount).toBe(1200);
  });

  it('handles zero rate', () => {
    const result = calculateCompoundInterest({
      principal: 5000,
      monthlyContribution: 0,
      rate: 0,
      years: 10,
      frequency: 'annually',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.finalAmount).toBe(5000);
    expect(result.data.totalInterest).toBe(0);
  });

  it('rejects negative principal', () => {
    const result = calculateCompoundInterest({
      principal: -100,
      monthlyContribution: 0,
      rate: 5,
      years: 1,
      frequency: 'annually',
    });
    expect(result.success).toBe(false);
  });

  it('rejects years over 100', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 0,
      rate: 5,
      years: 101,
      frequency: 'annually',
    });
    expect(result.success).toBe(false);
  });

  it('rejects rate over 100', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 0,
      rate: 101,
      years: 1,
      frequency: 'annually',
    });
    expect(result.success).toBe(false);
  });

  it('generates correct yearly breakdown length', () => {
    const result = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 100,
      rate: 5,
      years: 5,
      frequency: 'annually',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.yearlyBreakdown).toHaveLength(5);
    expect(result.data.yearlyBreakdown[0].year).toBe(1);
    expect(result.data.yearlyBreakdown[4].year).toBe(5);
  });

  it('quarterly compounding works', () => {
    const result = calculateCompoundInterest({
      principal: 10000,
      monthlyContribution: 0,
      rate: 8,
      years: 2,
      frequency: 'quarterly',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    // (1 + 0.08/4)^(4*2) * 10000 = 11716.59
    expect(result.data.finalAmount).toBeCloseTo(11716.59, 0);
  });
});
