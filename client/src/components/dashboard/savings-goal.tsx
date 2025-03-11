import { formatCurrency } from '@/lib/currency';
import { Currency } from '@shared/schema';
import { PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type SavingsGoalProps = {
  goal: {
    description: string;
    savedAmount: number;
    targetAmount: number;
    percentComplete: number;
    daysLeft: number;
    monthlySavingsNeeded: number;
    onTrack: boolean;
  } | null | undefined;
  currency: Currency;
  onEdit: () => void;
};

export default function SavingsGoal({ goal, currency, onEdit }: SavingsGoalProps) {
  if (!goal) {
    return (
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Savings Goal</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <PencilIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center py-6">
          <p className="text-gray-500">You haven't set a savings goal yet.</p>
          <Button onClick={onEdit} className="mt-4">
            Set a Goal
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">Savings Goal</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="ml-2 text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <PencilIcon className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
          <div className="font-medium text-gray-900">
            <span className="font-mono">{formatCurrency(goal.savedAmount, currency)}</span> / <span className="font-mono">{formatCurrency(goal.targetAmount, currency)}</span>
          </div>
          <div className="text-sm text-gray-500">
            {goal.percentComplete}% complete, {goal.daysLeft} days left
          </div>
        </div>
      </div>
      
      <div className="relative">
        <Progress value={goal.percentComplete} className="h-4" />
      </div>
      
      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="text-sm">
          <span className="text-gray-700">You need to save </span>
          <span className="font-medium font-mono text-gray-900">{formatCurrency(goal.monthlySavingsNeeded, currency)}</span>
          <span className="text-gray-700"> per month to reach your goal.</span>
        </div>
        
        <div className="mt-2 md:mt-0 text-sm flex items-center">
          <span className={`py-1 px-2 rounded-full text-xs font-medium ${goal.onTrack ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {goal.onTrack ? 'On track!' : 'Need to save more!'}
          </span>
          <span className="ml-2 text-gray-500">
            Current savings rate: <span className="font-medium">{formatCurrency(goal.savedAmount, currency)}</span>/month
          </span>
        </div>
      </div>
    </div>
  );
}
