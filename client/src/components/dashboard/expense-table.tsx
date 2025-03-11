import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Currency, Expense } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import CategoryBadge from '@/components/ui/category-badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

type ExpenseTableProps = {
  month: string;
  currency: Currency;
  onEdit: (id: number) => void;
};

export default function ExpenseTable({ month, currency, onEdit }: ExpenseTableProps) {
  const [page, setPage] = useState(1);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const pageSize = 5;
  
  // Fetch expenses for the selected month
  const { data: expenses, isLoading, isError } = useQuery<Expense[]>({
    queryKey: ['/api/expenses', month],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/expenses?month=${queryKey[1]}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      return response.json();
    },
  });
  
  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: 'Expense deleted',
        description: 'The expense has been successfully deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete expense: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle expense deletion
  const handleDelete = () => {
    if (expenseToDelete !== null) {
      deleteMutation.mutate(expenseToDelete);
      setExpenseToDelete(null);
    }
  };
  
  // Calculate pagination
  const totalItems = expenses?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentExpenses = expenses?.slice(startIndex, endIndex) || [];
  
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-500">
                    Error loading expenses
                  </td>
                </tr>
              ) : currentExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No expenses found for this month
                  </td>
                </tr>
              ) : (
                currentExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CategoryBadge category={expense.category} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 font-mono">
                      {formatCurrency(expense.amount, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.note || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(expense.id)}
                        className="text-primary hover:text-primary/80 mr-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setExpenseToDelete(expense.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex-shrink-0 text-sm text-gray-500">
              Showing <span className="font-medium">{Math.min(startIndex + 1, totalItems)}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium">{totalItems}</span> expenses
            </div>
            <div className="mt-3 sm:mt-0">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={index + 1 === page ? 'default' : 'outline'}
                    onClick={() => setPage(index + 1)}
                    className="relative inline-flex items-center px-4 py-2"
                  >
                    {index + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </Button>
              </nav>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={expenseToDelete !== null} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
