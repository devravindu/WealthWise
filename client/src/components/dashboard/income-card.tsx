import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Currency } from '@shared/schema';

type IncomeCardProps = {
  income: {
    amount: number;
    updatedAt: string | null;
  } | null | undefined;
  currency: Currency;
  onEdit: () => void;
};

export default function IncomeCard({ income, currency, onEdit }: IncomeCardProps) {
  const amount = income?.amount || 0;
  const updatedAt = income?.updatedAt ? new Date(income.updatedAt) : null;
  
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">Monthly Income</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900 font-mono">
            {formatCurrency(amount, currency)}
          </h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onEdit}
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <PencilIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-3 flex items-center text-sm">
        <span className="text-gray-500">Last updated: </span>
        <span className="ml-1 text-gray-700">
          {updatedAt ? format(updatedAt, 'MMM dd, yyyy') : 'Not set'}
        </span>
      </div>
    </div>
  );
}
