import { useState } from 'react';
import {
  calculateROI,
  formatROIResult,
} from '../../lib/finance/roi';
import { formatCurrency } from '../../lib/finance/types';
import CalculatorShell from './CalculatorShell';
import NumberInput from './NumberInput';
import ResultDisplay from './ResultDisplay';
import ChartDisplay from './ChartDisplay';

export default function ROICalculator() {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [finalValue, setFinalValue] = useState(15000);
  const [years, setYears] = useState(3);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReturnType<typeof formatROIResult> | null>(null);
  const [chartData, setChartData] = useState<{ year: number; balance: number }[]>([]);

  function handleCalculate() {
    const res = calculateROI({
      initialInvestment,
      finalValue,
      years,
    });

    if (!res.success) {
      setError(res.error);
      setResult(null);
      setChartData([]);
      return;
    }

    setError('');
    setResult(formatROIResult(res.data));
    setChartData(
      res.data.yearlyBreakdown.map((y) => ({
        year: y.year,
        balance: y.balance,
      })),
    );
  }

  return (
    <CalculatorShell
      title="ROI Calculator"
      description="Calculate your return on investment, annualized return, and total gain or loss."
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
                { label: 'Total ROI', value: result.totalROI, highlight: true },
                { label: 'Annualized Return', value: result.annualizedReturn },
                { label: 'Absolute Gain/Loss', value: result.absoluteGain },
              ]}
            />
          )}
        </>
      }
      chart={
        chartData.length > 1 ? (
          <ChartDisplay
            data={chartData}
            xKey="year"
            yKey="balance"
            yLabel="Investment Value"
            type="line"
            formatY={(v) => formatCurrency(v)}
          />
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Initial Investment"
          value={initialInvestment}
          onChange={setInitialInvestment}
          min={0.01}
          prefix="£"
          step={1000}
        />
        <NumberInput
          label="Current / Final Value"
          value={finalValue}
          onChange={setFinalValue}
          min={0}
          prefix="£"
          step={1000}
        />
      </div>
      <NumberInput
        label="Time Period"
        value={years}
        onChange={setYears}
        min={0.1}
        max={100}
        step={0.5}
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
