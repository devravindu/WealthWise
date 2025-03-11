import { pgTable, text, serial, integer, doublePrecision, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  currency: text("currency").notNull().default("USD"),
  isPremium: boolean("is_premium").notNull().default(false),
});

// Income model
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Expense model
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  currency: text("currency").notNull().default("USD"),
  note: text("note"),
});

// SavingsGoal model
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name"),
  targetAmount: doublePrecision("target_amount").notNull(),
  deadline: timestamp("deadline").notNull(),
  currency: text("currency").notNull().default("USD"),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertIncomeSchema = createInsertSchema(incomes).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({ id: true });

// Extended schemas with validation
export const registerUserSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = registerUserSchema.pick({
  email: true,
  password: true,
});

export const updateIncomeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["USD", "EUR", "LKR"]).default("USD"),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  date: z.string(),
  currency: z.enum(["USD", "EUR", "LKR"]).default("USD"),
  note: z.string().optional(),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().optional(),
  targetAmount: z.number().positive("Target amount must be positive"),
  deadline: z.string(),
  currency: z.enum(["USD", "EUR", "LKR"]).default("USD"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type Income = typeof incomes.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type UpdateIncome = z.infer<typeof updateIncomeSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type UpdateSavingsGoal = z.infer<typeof updateSavingsGoalSchema>;

// Expense categories
export const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Health",
  "Education",
  "Other"
] as const;

// Currency options with conversion rates
export const CURRENCY_OPTIONS = {
  USD: { symbol: "$", name: "US Dollar", conversionRate: { USD: 1, EUR: 0.95, LKR: 300 } },
  EUR: { symbol: "€", name: "Euro", conversionRate: { USD: 1.05, EUR: 1, LKR: 330 } },
  LKR: { symbol: "Rs", name: "Sri Lankan Rupee", conversionRate: { USD: 1/300, EUR: 1/330, LKR: 1 } }
};

export type Currency = keyof typeof CURRENCY_OPTIONS;
