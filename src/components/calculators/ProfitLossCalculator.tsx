import { useState } from 'react';
import {
  calculateProfitLoss,
  formatProfitLossResult,
} from '../../lib/finance/profit-loss';
import { formatCurrency } from '../../lib/finance/types';
import CalculatorShell from './CalculatorShell';
import NumberInput from './NumberInput';
import ResultDisplay from './ResultDisplay';
import ChartDisplay from './ChartDisplay';

export default function ProfitLossCalculator() {
  const [revenuePerUnit, setRevenuePerUnit] = useState(50);
  const [costPerUnit, setCostPerUnit] = useState(30);
  const [unitsSold, setUnitsSold] = useState(100);
  const [fixedCosts, setFixedCosts] = useState(500);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReturnType<typeof formatProfitLossResult> | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

  function handleCalculate() {
    const res = calculateProfitLoss({
      revenuePerUnit,
      costPerUnit,
      unitsSold,
      fixedCosts,
    });

    if (!res.success) {
      setError(res.error);
      setResult(null);
      setChartData([]);
      return;
    }

    setError('');
    setResult(formatProfitLossResult(res.data));
    setChartData([
      { name: 'Revenue', value: res.data.totalRevenue },
      { name: 'Variable Costs', value: res.data.totalVariableCosts },
      { name: 'Fixed Costs', value: fixedCosts },
      { name: 'Net Profit', value: Math.max(0, res.data.netProfit) },
    ]);
  }

  return (
    <CalculatorShell
      title="Profit & Loss Calculator"
      description="Calculate your gross profit, net profit, margin, and break-even point."
      results={
        <>
          {error && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }} role="alert">
              {error}
            </p>
          )}
          {result && (
            <ResultDisplay
              visible
              results={[
                { label: 'Total Revenue', value: result.totalRevenue },
                { label: 'Variable Costs', value: result.totalVariableCosts },
                { label: 'Gross Profit', value: result.grossProfit },
                { label: 'Net Profit', value: result.netProfit, highlight: true },
                { label: 'Profit Margin', value: result.profitMargin },
                { label: 'Break-even Point', value: result.breakevenUnits },
              ]}
            />
          )}
        </>
      }
      chart={
        chartData.length > 0 ? (
          <ChartDisplay
            data={chartData}
            xKey="name"
            yKey="value"
            yLabel="Amount"
            type="bar"
            formatY={(v) => formatCurrency(v)}
          />
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Revenue per Unit"
          value={revenuePerUnit}
          onChange={setRevenuePerUnit}
          min={0}
          prefix="£"
          step={1}
        />
        <NumberInput
          label="Cost per Unit"
          value={costPerUnit}
          onChange={setCostPerUnit}
          min={0}
          prefix="£"
          step={1}
        />
        <NumberInput
          label="Units Sold"
          value={unitsSold}
          onChange={setUnitsSold}
          min={0}
          step={1}
        />
        <NumberInput
          label="Fixed Costs"
          value={fixedCosts}
          onChange={setFixedCosts}
          min={0}
          prefix="£"
          step={100}
        />
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        className="w-full py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors"
        style={{ backgroundColor: 'var(--color-accent)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
      >
        Calculate
      </button>
    </CalculatorShell>
  );
}
