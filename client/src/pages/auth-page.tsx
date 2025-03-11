import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";
import { Wallet } from "lucide-react";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full flex flex-col md:flex-row max-w-6xl">
        {/* Left: Form */}
        <div className="w-full md:w-1/2 md:pr-8">
          <div className="mb-8">
            <div className="flex items-center text-primary mb-2">
              <Wallet className="mr-2" size={24} />
              <h1 className="text-2xl font-bold">FinTrack</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Take control of your finances
            </h2>
            <p className="mt-2 text-gray-600">
              Track your income, expenses, and savings goals all in one place.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm setActiveTab={setActiveTab} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: App Info */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0 bg-primary text-white rounded-lg p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6">Personal Finance Tracker</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Track Your Income & Expenses</h3>
                <p className="mt-1 text-white/80">Easily record your earnings and spending to see where your money goes.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Visualize Your Spending</h3>
                <p className="mt-1 text-white/80">See how your money is distributed across different categories with charts.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Set Savings Goals</h3>
                <p className="mt-1 text-white/80">Define targets and track your progress to achieve financial objectives.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Premium Features</h3>
                <p className="mt-1 text-white/80">Subscribe to export detailed financial reports for better planning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
