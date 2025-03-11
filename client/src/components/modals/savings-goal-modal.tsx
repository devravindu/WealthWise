import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { updateSavingsGoalSchema, Currency } from "@shared/schema";
import { formatCurrency, getCurrencyOptions } from "@/lib/currency";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addMonths } from "date-fns";

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

type SavingsGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentGoal?: {
    description?: string;
    savedAmount: number;
    targetAmount: number;
    deadline: string;
    percentComplete: number;
    daysLeft: number;
    monthlySavingsNeeded: number;
    onTrack: boolean;
  } | null;
};

export default function SavingsGoalModal({
  isOpen,
  onClose,
  currentGoal,
}: SavingsGoalModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const currencyOptions = getCurrencyOptions();

  // Parse goal name from description (format: "<name> by <date>")
  const getGoalName = (description?: string): string => {
    if (!description) return "";
    const match = description.match(/^(.*) by/);
    return match ? match[1] : "";
  };

  // Default deadline is 1 year from now
  const defaultDeadline = format(addMonths(new Date(), 12), "yyyy-MM-dd");

  const form = useForm<z.infer<typeof updateSavingsGoalSchema>>({
    resolver: zodResolver(updateSavingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      deadline: defaultDeadline,
      currency: (user?.currency as Currency) || "USD",
    },
  });

  // Reset form values when current goal changes
  useEffect(() => {
    if (currentGoal) {
      const goalName = getGoalName(currentGoal.description);
      form.reset({
        name: goalName,
        targetAmount: currentGoal.targetAmount,
        deadline: currentGoal.deadline ? 
          format(new Date(currentGoal.deadline), "yyyy-MM-dd") : 
          defaultDeadline,
        currency: (user?.currency as Currency) || "USD",
      });
    } else {
      form.reset({
        name: "",
        targetAmount: 0,
        deadline: defaultDeadline,
        currency: (user?.currency as Currency) || "USD",
      });
    }
  }, [currentGoal, form, user?.currency, defaultDeadline]);

  // Update savings goal mutation
  const updateSavingsGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateSavingsGoalSchema>) => {
      const res = await apiRequest("POST", "/api/savings-goal", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Savings goal updated",
        description: "Your savings goal has been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update savings goal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof updateSavingsGoalSchema>) {
    updateSavingsGoalMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Savings Goal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
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
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New Car, Vacation"
                      {...field}
                    />
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
                disabled={updateSavingsGoalMutation.isPending}
              >
                {updateSavingsGoalMutation.isPending
                  ? "Saving..."
                  : "Save Goal"}
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
