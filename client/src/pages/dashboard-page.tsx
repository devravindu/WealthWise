import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Header from "@/components/dashboard/header";
import IncomeCard from "@/components/dashboard/income-card";
import ExpensesCard from "@/components/dashboard/expenses-card";
import SavingsCard from "@/components/dashboard/savings-card";
import SavingsGoal from "@/components/dashboard/savings-goal";
import ExpenseChart from "@/components/dashboard/expense-chart";
import ExpenseTable from "@/components/dashboard/expense-table";
import Footer from "@/components/dashboard/footer";
import IncomeModal from "@/components/modals/income-modal";
import ExpenseModal from "@/components/modals/expense-modal";
import SavingsGoalModal from "@/components/modals/savings-goal-modal";
import PremiumModal from "@/components/modals/premium-modal";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSavingsGoalModalOpen, setIsSavingsGoalModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", selectedMonth],
    queryFn: async ({ queryKey }) => {
      const [_, month] = queryKey;
      const response = await fetch(`/api/dashboard?month=${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
    enabled: !!user,
  });
  
  const handleEditExpense = (id: number) => {
    setEditingExpenseId(id);
    setIsExpenseModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-light">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        onOpenPremiumModal={() => setIsPremiumModalOpen(true)} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Dashboard */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <div className="mt-4 md:mt-0">
              <label htmlFor="month-filter" className="sr-only">Filter by Month</label>
              <select 
                id="month-filter" 
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 12 }).map((_, index) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - index);
                  const value = format(date, "yyyy-MM");
                  const label = format(date, "MMMM yyyy");
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <IncomeCard 
              income={dashboardData?.income} 
              currency={user?.currency || "USD"} 
              onEdit={() => setIsIncomeModalOpen(true)}
            />
            
            <ExpensesCard 
              expenses={dashboardData?.expenses} 
              currency={user?.currency || "USD"}
            />
            
            <SavingsCard 
              savings={dashboardData?.savings} 
              currency={user?.currency || "USD"}
            />
          </div>
          
          {/* Savings Goal */}
          <SavingsGoal 
            goal={dashboardData?.goal} 
            currency={user?.currency || "USD"} 
            onEdit={() => setIsSavingsGoalModalOpen(true)}
          />
        </div>
        
        {/* Expense Management */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Expense Management</h2>
            <div className="mt-4 md:mt-0 flex items-center">
              <a 
                href={`/api/export/pdf?month=${selectedMonth}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`bg-white text-gray-700 border border-gray-300 rounded-md py-2 px-4 flex items-center text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3 ${!user?.isPremium && 'pointer-events-none opacity-60'}`}
                onClick={(e) => {
                  if (!user?.isPremium) {
                    e.preventDefault();
                    setIsPremiumModalOpen(true);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
                {!user?.isPremium && (
                  <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs py-0.5 px-1.5 rounded">Premium</span>
                )}
              </a>
              
              <button 
                onClick={() => {
                  setEditingExpenseId(null);
                  setIsExpenseModalOpen(true);
                }}
                className="bg-primary text-white rounded-md py-2 px-4 flex items-center text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </button>
            </div>
          </div>
          
          {/* Expense Chart */}
          <ExpenseChart 
            expensesByCategory={dashboardData?.expenses?.byCategory || {}} 
            currency={user?.currency || "USD"}
          />
          
          {/* Expense Table */}
          <ExpenseTable 
            month={selectedMonth}
            currency={user?.currency || "USD"}
            onEdit={handleEditExpense}
          />
        </div>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <IncomeModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => setIsIncomeModalOpen(false)} 
        currentIncome={dashboardData?.income}
      />
      
      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)}
        expenseId={editingExpenseId}
      />
      
      <SavingsGoalModal 
        isOpen={isSavingsGoalModalOpen} 
        onClose={() => setIsSavingsGoalModalOpen(false)}
        currentGoal={dashboardData?.goal}
      />
      
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </div>
  );
}
