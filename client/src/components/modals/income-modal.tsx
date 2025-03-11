import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { updateIncomeSchema, Currency } from "@shared/schema";
import { formatCurrency, getCurrencyOptions } from "@/lib/currency";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

type IncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentIncome?: {
    amount: number;
    updatedAt: string | null;
  } | null;
};

export default function IncomeModal({
  isOpen,
  onClose,
  currentIncome,
}: IncomeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const currencyOptions = getCurrencyOptions();

  const form = useForm<z.infer<typeof updateIncomeSchema>>({
    resolver: zodResolver(updateIncomeSchema),
    defaultValues: {
      amount: currentIncome?.amount || 0,
      currency: (user?.currency as Currency) || "USD",
    },
  });

  // Reset form values when current income changes
  useEffect(() => {
    if (currentIncome) {
      form.reset({
        amount: currentIncome.amount,
        currency: (user?.currency as Currency) || "USD",
      });
    }
  }, [currentIncome, form, user?.currency]);

  // Update income mutation
  const updateIncomeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateIncomeSchema>) => {
      const res = await apiRequest("POST", "/api/income", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Income updated",
        description: "Your monthly income has been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update income: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof updateIncomeSchema>) {
    updateIncomeMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Monthly Income</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
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
                disabled={updateIncomeMutation.isPending}
              >
                {updateIncomeMutation.isPending
                  ? "Updating..."
                  : "Update Income"}
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
