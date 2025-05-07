import { pgTable, text, serial, integer, jsonb, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
});

// Forecast schema
export const forecasts = pgTable("forecasts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertForecastSchema = createInsertSchema(forecasts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Revenue Driver schema
export const revenueDrivers = pgTable("revenue_drivers", {
  id: serial("id").primaryKey(),
  forecastId: integer("forecast_id").notNull(),
  name: text("name").notNull(),
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  unit: text("unit"),
  minValue: numeric("min_value", { precision: 15, scale: 2 }),
  maxValue: numeric("max_value", { precision: 15, scale: 2 }),
  growthRate: numeric("growth_rate", { precision: 6, scale: 4 }),
  category: text("category"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRevenueDriverSchema = createInsertSchema(revenueDrivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Revenue Stream schema
export const revenueStreams = pgTable("revenue_streams", {
  id: serial("id").primaryKey(),
  forecastId: integer("forecast_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // subscription, one-time, service
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  frequency: text("frequency"), // monthly, quarterly, annual
  growthRate: numeric("growth_rate", { precision: 6, scale: 4 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  category: text("category"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRevenueStreamSchema = createInsertSchema(revenueStreams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Expense schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  forecastId: integer("forecast_id").notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // one-time, monthly, quarterly, annual
  category: text("category"), // marketing, software, office, etc.
  isCogsRelated: boolean("is_cogs_related").default(false),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  growthRate: numeric("growth_rate", { precision: 6, scale: 4 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Department schema
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  forecastId: integer("forecast_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Personnel schema
export const personnelRoles = pgTable("personnel_roles", {
  id: serial("id").primaryKey(),
  forecastId: integer("forecast_id").notNull(),
  departmentId: integer("department_id").notNull(),
  title: text("title").notNull(),
  count: integer("count").notNull(),
  plannedCount: integer("planned_count").notNull(),
  annualSalary: numeric("annual_salary", { precision: 12, scale: 2 }).notNull(),
  startingMonth: integer("starting_month"), // month number (1-12)
  benefits: numeric("benefits", { precision: 5, scale: 4 }), // percentage of salary
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPersonnelRoleSchema = createInsertSchema(personnelRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Custom Formula schema
export const customFormulas = pgTable("custom_formulas", {
  id: serial("id").primaryKey(),
  forecastId: integer("forecast_id").notNull(),
  name: text("name").notNull(),
  formula: text("formula").notNull(),
  description: text("description"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomFormulaSchema = createInsertSchema(customFormulas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// QuickBooks Integration schema
export const quickbooksIntegrations = pgTable("quickbooks_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  realmId: text("realm_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuickbooksIntegrationSchema = createInsertSchema(quickbooksIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Financial Projections schema
export const financialProjections = pgTable("financial_projections", {
  id: serial("id").primaryKey(),
  forecastId: integer("forecast_id").notNull(),
  period: text("period").notNull(), // month-year like "01-2023"
  revenueTotal: numeric("revenue_total", { precision: 15, scale: 2 }),
  cogsTotal: numeric("cogs_total", { precision: 15, scale: 2 }),
  expenseTotal: numeric("expense_total", { precision: 15, scale: 2 }),
  personnelTotal: numeric("personnel_total", { precision: 15, scale: 2 }),
  netProfit: numeric("net_profit", { precision: 15, scale: 2 }),
  cashInflow: numeric("cash_inflow", { precision: 15, scale: 2 }),
  cashOutflow: numeric("cash_outflow", { precision: 15, scale: 2 }),
  cashBalance: numeric("cash_balance", { precision: 15, scale: 2 }),
  projectionData: jsonb("projection_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFinancialProjectionSchema = createInsertSchema(financialProjections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = z.infer<typeof insertForecastSchema>;

export type RevenueDriver = typeof revenueDrivers.$inferSelect;
export type InsertRevenueDriver = z.infer<typeof insertRevenueDriverSchema>;

export type RevenueStream = typeof revenueStreams.$inferSelect;
export type InsertRevenueStream = z.infer<typeof insertRevenueStreamSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type PersonnelRole = typeof personnelRoles.$inferSelect;
export type InsertPersonnelRole = z.infer<typeof insertPersonnelRoleSchema>;

export type CustomFormula = typeof customFormulas.$inferSelect;
export type InsertCustomFormula = z.infer<typeof insertCustomFormulaSchema>;

export type QuickbooksIntegration = typeof quickbooksIntegrations.$inferSelect;
export type InsertQuickbooksIntegration = z.infer<typeof insertQuickbooksIntegrationSchema>;

export type FinancialProjection = typeof financialProjections.$inferSelect;
export type InsertFinancialProjection = z.infer<typeof insertFinancialProjectionSchema>;
