import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

type PremiumModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Payment form schema
const paymentFormSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
  name: z.string().min(2, "Please enter the name on your card"),
});

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { user, subscribeMutation } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      expiry: "",
      cvv: "",
      name: "",
    },
  });

  // Mock payment processing and subscription
  function onSubmit(values: z.infer<typeof paymentFormSchema>) {
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Call the subscribe mutation
      subscribeMutation.mutate(undefined, {
        onSuccess: () => onClose(),
        onError: (error) => {
          toast({
            title: "Subscription failed",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    }, 1500);
  }

  // If user is already premium, show a different message
  if (user?.isPremium) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Premium Subscription</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">You're already a Premium member!</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              You have access to all premium features including PDF export functionality.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Enhance your financial tracking experience with premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-primary">Premium Features</h3>
                <p className="text-sm text-gray-600 mt-1">Get more out of FinTrack</p>
              </div>
              <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                $5 / month
              </div>
            </div>
            
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">Export financial reports as PDF</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">Detailed monthly expense breakdown</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">Enhanced savings goal tracking</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">Priority customer support</span>
              </li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium">Payment Details</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-3">
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234 5678 9012 3456" 
                          {...field} 
                          onChange={(e) => {
                            // Format card number with spaces
                            const value = e.target.value.replace(/\s/g, '');
                            const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                            field.onChange(formatted);
                          }}
                          maxLength={19}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM/YY" 
                            {...field} 
                            onChange={(e) => {
                              // Format expiry date with slash
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 2) {
                                field.onChange(value);
                              } else {
                                field.onChange(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
                              }
                            }}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            {...field} 
                            type="password"
                            maxLength={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Card</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || subscribeMutation.isPending}
                  >
                    {isSubmitting || subscribeMutation.isPending ? "Processing..." : "Upgrade Now"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Your subscription will start immediately. You can cancel at any time. 
            By upgrading, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
