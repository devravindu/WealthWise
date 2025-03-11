import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generatePdfHtml } from "./pdf";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { updateIncomeSchema, updateExpenseSchema, updateSavingsGoalSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper function to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

// Helper function to check if user is premium
function isPremium(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.isPremium) {
    return next();
  }
  return res.status(403).json({ message: "Premium subscription required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Income routes
  app.get("/api/income", isAuthenticated, async (req, res) => {
    try {
      const income = await storage.getIncome(req.user.id);
      res.json(income || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });

  app.post("/api/income", isAuthenticated, async (req, res) => {
    try {
      const incomeData = updateIncomeSchema.parse(req.body);
      const income = await storage.updateIncome(req.user.id, incomeData.amount, incomeData.currency);
      res.json(income);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update income" });
    }
  });

  // Expense routes
  app.get("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      let filterMonth: Date | undefined;
      
      if (req.query.month) {
        // Parse month query parameter (expected format: 'YYYY-MM')
        const [year, month] = (req.query.month as string).split('-').map(Number);
        if (!isNaN(year) && !isNaN(month)) {
          filterMonth = new Date(year, month - 1); // Month is 0-indexed in JS Date
        }
      }
      
      const expenses = await storage.getExpenses(req.user.id, filterMonth);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const expenseData = updateExpenseSchema.parse(req.body);
      
      // Create expense object
      const expense = await storage.createExpense({
        userId: req.user.id,
        amount: expenseData.amount,
        category: expenseData.category,
        date: new Date(expenseData.date),
        currency: expenseData.currency,
        note: expenseData.note || null
      });
      
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      // Check if expense exists and belongs to user
      if (!expense || expense.userId !== req.user.id) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      const expenseData = updateExpenseSchema.parse(req.body);
      
      // Update expense
      const updatedExpense = await storage.updateExpense(id, {
        amount: expenseData.amount,
        category: expenseData.category,
        date: new Date(expenseData.date),
        currency: expenseData.currency,
        note: expenseData.note || null
      });
      
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      // Check if expense exists and belongs to user
      if (!expense || expense.userId !== req.user.id) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      await storage.deleteExpense(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Savings Goal routes
  app.get("/api/savings-goal", isAuthenticated, async (req, res) => {
    try {
      const goal = await storage.getSavingsGoal(req.user.id);
      res.json(goal || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings goal" });
    }
  });

  app.post("/api/savings-goal", isAuthenticated, async (req, res) => {
    try {
      const goalData = updateSavingsGoalSchema.parse(req.body);
      
      // Update or create savings goal
      const goal = await storage.updateSavingsGoal(req.user.id, {
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        deadline: new Date(goalData.deadline),
        currency: goalData.currency
      });
      
      res.json(goal);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update savings goal" });
    }
  });

  // Dashboard summary route
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      let month: Date;
      
      if (req.query.month) {
        // Parse month query parameter (expected format: 'YYYY-MM')
        const [year, monthNum] = (req.query.month as string).split('-').map(Number);
        if (!isNaN(year) && !isNaN(monthNum)) {
          month = new Date(year, monthNum - 1); // Month is 0-indexed in JS Date
        } else {
          month = new Date();
        }
      } else {
        month = new Date();
      }
      
      // Start of the selected month
      const startDate = startOfMonth(month);
      
      // Get income, expenses, and savings goal
      const income = await storage.getIncome(req.user.id);
      const expenses = await storage.getExpenses(req.user.id, month);
      const savingsGoal = await storage.getSavingsGoal(req.user.id);
      
      // Calculate previous months for trend
      const previousMonth = subMonths(month, 1);
      const previousMonthExpenses = await storage.getExpenses(req.user.id, previousMonth);
      
      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const previousTotalExpenses = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate net savings
      const incomeAmount = income?.amount || 0;
      const netSavings = incomeAmount - totalExpenses;
      const previousNetSavings = incomeAmount - previousTotalExpenses;
      
      // Calculate savings trend
      const savingsTrend = netSavings - previousNetSavings;
      
      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += expense.amount;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate percentages
      const percentOfIncome = incomeAmount > 0 ? Math.round((totalExpenses / incomeAmount) * 100) : 0;
      const savingsPercentOfIncome = incomeAmount > 0 ? Math.round((netSavings / incomeAmount) * 100) : 0;
      
      // Find highest expense category
      let highestCategory = '';
      let highestAmount = 0;
      
      for (const [category, amount] of Object.entries(expensesByCategory)) {
        if (amount > highestAmount) {
          highestCategory = category;
          highestAmount = amount;
        }
      }
      
      // Calculate savings goal progress
      let goalProgress = null;
      if (savingsGoal) {
        const saved = netSavings; // Simplification - in real app you'd track cumulative savings
        const targetAmount = savingsGoal.targetAmount;
        const percentComplete = Math.min(100, Math.floor((saved / targetAmount) * 100));
        const deadline = new Date(savingsGoal.deadline);
        const daysLeft = Math.floor((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
        const monthlySavingsNeeded = (targetAmount - saved) / monthsLeft;
        
        goalProgress = {
          description: `${savingsGoal.name || 'Savings Goal'} by ${format(deadline, 'MMMM d, yyyy')}`,
          savedAmount: saved,
          targetAmount,
          percentComplete,
          daysLeft,
          monthlySavingsNeeded,
          onTrack: netSavings >= monthlySavingsNeeded
        };
      }
      
      res.json({
        month: format(month, 'MMMM yyyy'),
        income: {
          amount: incomeAmount,
          updatedAt: income?.updatedAt || null
        },
        expenses: {
          total: totalExpenses,
          percentOfIncome,
          categoriesCount: Object.keys(expensesByCategory).length,
          highest: {
            category: highestCategory,
            amount: highestAmount
          },
          byCategory: expensesByCategory
        },
        savings: {
          amount: netSavings,
          percentOfIncome: savingsPercentOfIncome,
          trend: savingsTrend,
          monthlyAverage: netSavings // Simplified - would calculate average over time
        },
        goal: goalProgress
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Premium subscription route
  app.post("/api/subscribe", isAuthenticated, async (req, res) => {
    try {
      // In a real app, this would process payment through Stripe
      // For this implementation, we'll just toggle the premium status
      await storage.updateUserPremiumStatus(req.user.id, true);
      
      // Don't send password in response
      const updatedUser = await storage.getUser(req.user.id);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });

  // PDF export route (premium feature)
  app.get("/api/export/pdf", isAuthenticated, isPremium, async (req, res) => {
    try {
      let month: Date;
      
      if (req.query.month) {
        // Parse month query parameter (expected format: 'YYYY-MM')
        const [year, monthNum] = (req.query.month as string).split('-').map(Number);
        if (!isNaN(year) && !isNaN(monthNum)) {
          month = new Date(year, monthNum - 1); // Month is 0-indexed in JS Date
        } else {
          month = new Date();
        }
      } else {
        month = new Date();
      }
      
      // Get user data
      const user = await storage.getUser(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      // Get financial data
      const income = await storage.getIncome(req.user.id);
      const expenses = await storage.getExpenses(req.user.id, month);
      const savingsGoal = await storage.getSavingsGoal(req.user.id);
      
      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const netSavings = (income?.amount || 0) - totalExpenses;
      
      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += expense.amount;
        return acc;
      }, {} as Record<string, number>);
      
      // Generate PDF HTML content
      const pdfHtml = generatePdfHtml({
        user,
        income: income || null,
        expenses,
        expensesByCategory,
        savingsGoal: savingsGoal || null,
        month,
        totalExpenses,
        netSavings
      });
      
      // Set headers for HTML response (in a real app, you'd generate a PDF)
      res.setHeader('Content-Type', 'text/html');
      res.send(pdfHtml);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to generate PDF export" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
