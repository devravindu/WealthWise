import { formatCurrency } from '@/lib/currency';
import { Currency } from '@shared/schema';
import { TrendingUp, TrendingDown } from 'lucide-react';

type SavingsCardProps = {
  savings: {
    amount: number;
    percentOfIncome: number;
    trend: number;
    monthlyAverage: number;
  } | null | undefined;
  currency: Currency;
};

export default function SavingsCard({ savings, currency }: SavingsCardProps) {
  const amount = savings?.amount || 0;
  const percentOfIncome = savings?.percentOfIncome || 0;
  const trend = savings?.trend || 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">Net Savings</p>
          <h2 className="mt-1 text-2xl font-semibold text-green-600 font-mono">
            {formatCurrency(amount, currency)}
          </h2>
        </div>
        <span className="bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs font-medium">
          {percentOfIncome}% of income
        </span>
      </div>
      <div className="mt-3 text-sm">
        <span className="text-gray-500">Monthly trend: </span>
        {trend >= 0 ? (
          <span className="text-green-600 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {formatCurrency(Math.abs(trend), currency)} from last month
          </span>
        ) : (
          <span className="text-red-600 flex items-center">
            <TrendingDown className="h-4 w-4 mr-1" />
            {formatCurrency(Math.abs(trend), currency)} from last month
          </span>
        )}
      </div>
    </div>
  );
}
