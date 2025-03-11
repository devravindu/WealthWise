import { formatCurrency } from '@/lib/currency';
import { Currency } from '@shared/schema';

type ExpensesCardProps = {
  expenses: {
    total: number;
    percentOfIncome: number;
    categoriesCount: number;
    highest: {
      category: string;
      amount: number;
    };
  } | null | undefined;
  currency: Currency;
};

export default function ExpensesCard({ expenses, currency }: ExpensesCardProps) {
  const total = expenses?.total || 0;
  const percentOfIncome = expenses?.percentOfIncome || 0;
  const categoriesCount = expenses?.categoriesCount || 0;
  const highestCategory = expenses?.highest?.category || '';
  const highestAmount = expenses?.highest?.amount || 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">Monthly Expenses</p>
          <h2 className="mt-1 text-2xl font-semibold text-red-600 font-mono">
            {formatCurrency(total, currency)}
          </h2>
        </div>
        <span className="bg-red-100 text-red-800 py-1 px-2 rounded-full text-xs font-medium">
          {percentOfIncome}% of income
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="text-sm">
          <span className="text-gray-500">Highest: </span>
          <span className="text-gray-700">
            {highestCategory ? `${highestCategory} (${formatCurrency(highestAmount, currency)})` : 'None'}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Categories: </span>
          <span className="text-gray-700">{categoriesCount}</span>
        </div>
      </div>
    </div>
  );
}
