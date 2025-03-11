import { users, incomes, expenses, savingsGoals } from "@shared/schema";
import type { User, InsertUser, Income, InsertIncome, Expense, InsertExpense, SavingsGoal, InsertSavingsGoal, Currency } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCurrency(userId: number, currency: Currency): Promise<void>;
  updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<void>;
  
  // Income operations
  getIncome(userId: number): Promise<Income | undefined>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(userId: number, amount: number, currency: Currency): Promise<Income>;
  
  // Expense operations
  getExpenses(userId: number, month?: Date): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, updatedExpense: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  
  // Savings Goal operations
  getSavingsGoal(userId: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(userId: number, updatedGoal: Partial<SavingsGoal>): Promise<SavingsGoal>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private incomes: Map<number, Income>;
  private expenses: Map<number, Expense>;
  private savingsGoals: Map<number, SavingsGoal>;
  private userIdCounter: number;
  private incomeIdCounter: number;
  private expenseIdCounter: number;
  private savingsGoalIdCounter: number;
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.incomes = new Map();
    this.expenses = new Map();
    this.savingsGoals = new Map();
    this.userIdCounter = 1;
    this.incomeIdCounter = 1;
    this.expenseIdCounter = 1;
    this.savingsGoalIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserCurrency(userId: number, currency: Currency): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    user.currency = currency;
    this.users.set(userId, user);
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    user.isPremium = isPremium;
    this.users.set(userId, user);
  }

  // Income operations
  async getIncome(userId: number): Promise<Income | undefined> {
    for (const income of this.incomes.values()) {
      if (income.userId === userId) {
        return income;
      }
    }
    return undefined;
  }

  async createIncome(incomeData: InsertIncome): Promise<Income> {
    const id = this.incomeIdCounter++;
    const income: Income = { ...incomeData, id, updatedAt: new Date() };
    this.incomes.set(id, income);
    return income;
  }

  async updateIncome(userId: number, amount: number, currency: Currency): Promise<Income> {
    let income = await this.getIncome(userId);
    
    if (income) {
      // Update existing income
      income.amount = amount;
      income.currency = currency;
      income.updatedAt = new Date();
      this.incomes.set(income.id, income);
    } else {
      // Create new income
      income = await this.createIncome({
        userId,
        amount,
        currency,
        updatedAt: new Date()
      });
    }
    
    return income;
  }

  // Expense operations
  async getExpenses(userId: number, month?: Date): Promise<Expense[]> {
    const result: Expense[] = [];
    
    for (const expense of this.expenses.values()) {
      if (expense.userId === userId) {
        if (month) {
          const expenseDate = new Date(expense.date);
          if (
            expenseDate.getMonth() === month.getMonth() &&
            expenseDate.getFullYear() === month.getFullYear()
          ) {
            result.push(expense);
          }
        } else {
          result.push(expense);
        }
      }
    }
    
    // Sort by date descending (newest first)
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const id = this.expenseIdCounter++;
    const expense: Expense = { ...expenseData, id };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, updatedExpense: Partial<Expense>): Promise<Expense> {
    const expense = await this.getExpense(id);
    if (!expense) throw new Error("Expense not found");
    
    const updated = { ...expense, ...updatedExpense };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: number): Promise<void> {
    const exists = this.expenses.has(id);
    if (!exists) throw new Error("Expense not found");
    
    this.expenses.delete(id);
  }

  // Savings Goal operations
  async getSavingsGoal(userId: number): Promise<SavingsGoal | undefined> {
    for (const goal of this.savingsGoals.values()) {
      if (goal.userId === userId) {
        return goal;
      }
    }
    return undefined;
  }

  async createSavingsGoal(goalData: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.savingsGoalIdCounter++;
    const goal: SavingsGoal = { ...goalData, id };
    this.savingsGoals.set(id, goal);
    return goal;
  }

  async updateSavingsGoal(userId: number, updatedGoal: Partial<SavingsGoal>): Promise<SavingsGoal> {
    let goal = await this.getSavingsGoal(userId);
    
    if (goal) {
      // Update existing goal
      goal = { ...goal, ...updatedGoal };
      this.savingsGoals.set(goal.id, goal);
    } else {
      // Create new goal if it doesn't exist
      if (!updatedGoal.targetAmount || !updatedGoal.deadline || !updatedGoal.currency) {
        throw new Error("Missing required fields for savings goal");
      }
      
      goal = await this.createSavingsGoal({
        userId,
        name: updatedGoal.name || "",
        targetAmount: updatedGoal.targetAmount,
        deadline: new Date(updatedGoal.deadline),
        currency: updatedGoal.currency
      });
    }
    
    return goal;
  }
}

export const storage = new MemStorage();
