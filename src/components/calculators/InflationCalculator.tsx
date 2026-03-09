import { useState } from 'react';
import {
  calculateInflation,
  formatInflationResult,
} from '../../lib/finance/inflation';
import { formatCurrency } from '../../lib/finance/types';
import CalculatorShell from './CalculatorShell';
import NumberInput from './NumberInput';
import ResultDisplay from './ResultDisplay';
import ChartDisplay from './ChartDisplay';

export default function InflationCalculator() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(3);
  const [years, setYears] = useState(10);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReturnType<typeof formatInflationResult> | null>(null);
  const [chartData, setChartData] = useState<{ year: number; purchasingPower: number; originalValue: number }[]>([]);

  function handleCalculate() {
    const res = calculateInflation({ amount, rate, years });

    if (!res.success) {
      setError(res.error);
      setResult(null);
      setChartData([]);
      return;
    }

    setError('');
    setResult(formatInflationResult(res.data));
    setChartData(
      res.data.yearlyBreakdown.map((y) => ({
        year: y.year,
        purchasingPower: y.balance,
        originalValue: y.contributions,
      })),
    );
  }

  return (
    <CalculatorShell
      title="Inflation Calculator"
      description="See how inflation erodes the purchasing power of your money over time."
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
                { label: 'Future Equivalent Needed', value: result.futureNominalValue },
                { label: 'Purchasing Power', value: result.purchasingPower, highlight: true },
                { label: 'Value Lost to Inflation', value: result.valueLost },
                { label: 'Total Loss', value: result.totalLossPercent },
              ]}
            />
          )}
        </>
      }
      chart={
        chartData.length > 0 ? (
          <ChartDisplay
            data={chartData}
            xKey="year"
            yKey="purchasingPower"
            yKey2="originalValue"
            yLabel="Purchasing Power"
            y2Label="Original Value"
            type="area"
            formatY={(v) => formatCurrency(v)}
          />
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Current Amount"
          value={amount}
          onChange={setAmount}
          min={0.01}
          prefix="£"
          step={1000}
        />
        <NumberInput
          label="Annual Inflation Rate"
          value={rate}
          onChange={setRate}
          min={0}
          max={100}
          step={0.1}
          suffix="%"
        />
      </div>
      <NumberInput
        label="Years into Future"
        value={years}
        onChange={setYears}
        min={1}
        max={100}
        suffix="years"
      />

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
