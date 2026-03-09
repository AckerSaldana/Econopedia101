import { useState } from 'react';
import {
  calculateCompoundInterest,
  formatCompoundInterestResult,
  type CompoundInterestInput,
} from '../../lib/finance/compound-interest';
import { formatCurrency } from '../../lib/finance/types';
import CalculatorShell from './CalculatorShell';
import NumberInput from './NumberInput';
import ResultDisplay from './ResultDisplay';
import ChartDisplay from './ChartDisplay';

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState<CompoundInterestInput['frequency']>('monthly');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReturnType<typeof formatCompoundInterestResult> | null>(null);
  const [chartData, setChartData] = useState<{ year: number; balance: number; contributions: number }[]>([]);

  function handleCalculate() {
    const res = calculateCompoundInterest({
      principal,
      monthlyContribution,
      rate,
      years,
      frequency,
    });

    if (!res.success) {
      setError(res.error);
      setResult(null);
      setChartData([]);
      return;
    }

    setError('');
    setResult(formatCompoundInterestResult(res.data));
    setChartData(
      res.data.yearlyBreakdown.map((y) => ({
        year: y.year,
        balance: y.balance,
        contributions: y.contributions,
      })),
    );
  }

  return (
    <CalculatorShell
      title="Compound Interest Calculator"
      description="See how your savings grow over time with the power of compound interest."
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
                { label: 'Final Amount', value: result.finalAmount, highlight: true },
                { label: 'Total Contributions', value: result.totalContributions },
                { label: 'Total Interest Earned', value: result.totalInterest },
                { label: 'Effective Return', value: result.effectiveReturn },
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
            yKey="balance"
            yKey2="contributions"
            yLabel="Balance"
            y2Label="Contributions"
            type="area"
            formatY={(v) => formatCurrency(v)}
          />
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Initial Deposit"
          value={principal}
          onChange={setPrincipal}
          min={0}
          prefix="£"
          step={100}
        />
        <NumberInput
          label="Monthly Contribution"
          value={monthlyContribution}
          onChange={setMonthlyContribution}
          min={0}
          prefix="£"
          step={50}
        />
        <NumberInput
          label="Annual Interest Rate"
          value={rate}
          onChange={setRate}
          min={0}
          max={100}
          step={0.1}
          suffix="%"
        />
        <NumberInput
          label="Time Period"
          value={years}
          onChange={setYears}
          min={1}
          max={100}
          suffix="years"
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="frequency"
          className="text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Compounding Frequency
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as CompoundInterestInput['frequency'])}
          className="border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annually">Annually</option>
        </select>
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
