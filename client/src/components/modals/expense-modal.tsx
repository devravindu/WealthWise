import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { updateExpenseSchema, EXPENSE_CATEGORIES, Currency } from "@shared/schema";
import { formatCurrency, getCurrencyOptions } from "@/lib/currency";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type ExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expenseId: number | null;
};

export default function ExpenseModal({
  isOpen,
  onClose,
  expenseId,
}: ExpenseModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const currencyOptions = getCurrencyOptions();
  const isEditing = expenseId !== null;
  
  // Fetch expense data if editing
  const { data: expenseData, isLoading: isFetchingExpense } = useQuery({
    queryKey: ['/api/expenses', expenseId],
    queryFn: async () => {
      if (!expenseId) return null;
      const response = await fetch(`/api/expenses/${expenseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expense');
      }
      return response.json();
    },
    enabled: isEditing && isOpen,
  });

  const form = useForm<z.infer<typeof updateExpenseSchema>>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: {
      amount: 0,
      category: "",
      date: format(new Date(), "yyyy-MM-dd"),
      currency: (user?.currency as Currency) || "USD",
      note: "",
    },
  });

  // Reset form values when expense data changes
  useEffect(() => {
    if (isEditing && expenseData) {
      form.reset({
        amount: expenseData.amount,
        category: expenseData.category,
        date: format(new Date(expenseData.date), "yyyy-MM-dd"),
        currency: expenseData.currency as Currency,
        note: expenseData.note || "",
      });
    } else if (!isEditing) {
      form.reset({
        amount: 0,
        category: "",
        date: format(new Date(), "yyyy-MM-dd"),
        currency: (user?.currency as Currency) || "USD",
        note: "",
      });
    }
  }, [expenseData, form, isEditing, user?.currency, isOpen]);

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateExpenseSchema>) => {
      const res = await apiRequest("POST", "/api/expenses", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Expense added",
        description: "Your expense has been added successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async (data: { id: number; expense: z.infer<typeof updateExpenseSchema> }) => {
      const res = await apiRequest("PUT", `/api/expenses/${data.id}`, data.expense);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof updateExpenseSchema>) {
    if (isEditing && expenseId) {
      updateExpenseMutation.mutate({ id: expenseId, expense: values });
    } else {
      createExpenseMutation.mutate(values);
    }
  }

  const isPending = createExpenseMutation.isPending || updateExpenseMutation.isPending;

  if (isEditing && isFetchingExpense) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {CURRENCY_OPTIONS[form.watch("currency") as Currency]?.symbol || "$"}
                      </span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note about this expense"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending
                  ? (isEditing ? "Updating..." : "Saving...")
                  : (isEditing ? "Update Expense" : "Save Expense")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Import this from schema.ts to avoid undefined reference
const CURRENCY_OPTIONS = {
  USD: { symbol: "$", name: "US Dollar", conversionRate: { USD: 1, EUR: 0.95, LKR: 300 } },
  EUR: { symbol: "€", name: "Euro", conversionRate: { USD: 1.05, EUR: 1, LKR: 330 } },
  LKR: { symbol: "Rs", name: "Sri Lankan Rupee", conversionRate: { USD: 1/300, EUR: 1/330, LKR: 1 } }
};
