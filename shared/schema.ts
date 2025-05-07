import { pgTable, text, serial, integer, numeric, timestamp, boolean, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Workspaces
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  createdAt: true,
});

// Revenue streams
export const revenueStreams = pgTable("revenue_streams", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // subscription, one-time, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRevenueStreamSchema = createInsertSchema(revenueStreams).omit({
  id: true,
  createdAt: true,
});

// Revenue projections by month
export const revenueProjections = pgTable("revenue_projections", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").notNull(),
  workspaceId: integer("workspace_id").notNull(),
  month: text("month").notNull(), // YYYY-MM format
  amount: numeric("amount").notNull(),
  isActual: boolean("is_actual").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRevenueProjectionSchema = createInsertSchema(revenueProjections).omit({
  id: true,
  createdAt: true,
});

// Expense categories
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({
  id: true,
  createdAt: true,
});

// Expense projections by month
export const expenseProjections = pgTable("expense_projections", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  workspaceId: integer("workspace_id").notNull(),
  month: text("month").notNull(), // YYYY-MM format
  amount: numeric("amount").notNull(),
  isActual: boolean("is_actual").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseProjectionSchema = createInsertSchema(expenseProjections).omit({
  id: true,
  createdAt: true,
});

// Personnel roles
export const personnelRoles = pgTable("personnel_roles", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  title: text("title").notNull(),
  department: text("department"),
  baseSalary: numeric("base_salary").notNull(),
  benefits: numeric("benefits").default("0"),
  taxes: numeric("taxes").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPersonnelRoleSchema = createInsertSchema(personnelRoles).omit({
  id: true,
  createdAt: true,
});

// Personnel headcount projections
export const personnelProjections = pgTable("personnel_projections", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull(),
  workspaceId: integer("workspace_id").notNull(),
  month: text("month").notNull(), // YYYY-MM format
  headcount: integer("headcount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPersonnelProjectionSchema = createInsertSchema(personnelProjections).omit({
  id: true,
  createdAt: true,
});

// Custom formulas
export const formulas = pgTable("formulas", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  formula: text("formula").notNull(),
  variables: jsonb("variables").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFormulaSchema = createInsertSchema(formulas).omit({
  id: true,
  createdAt: true,
});

// Scenarios
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  assumptions: jsonb("assumptions"), // Store scenario assumptions
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
});

// QuickBooks integration
export const quickbooksIntegration = pgTable("quickbooks_integration", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().unique(),
  isConnected: boolean("is_connected").default(false),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  realmId: text("realm_id"),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuickbooksIntegrationSchema = createInsertSchema(quickbooksIntegration).omit({
  id: true,
  createdAt: true,
});

// Transactions from QuickBooks
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull(),
  externalId: text("external_id"), // ID from QuickBooks
  date: timestamp("date").notNull(),
  description: text("description"),
  amount: numeric("amount").notNull(),
  category: text("category"),
  type: text("type").notNull(), // income or expense
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;

export type RevenueStream = typeof revenueStreams.$inferSelect;
export type InsertRevenueStream = z.infer<typeof insertRevenueStreamSchema>;

export type RevenueProjection = typeof revenueProjections.$inferSelect;
export type InsertRevenueProjection = z.infer<typeof insertRevenueProjectionSchema>;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;

export type ExpenseProjection = typeof expenseProjections.$inferSelect;
export type InsertExpenseProjection = z.infer<typeof insertExpenseProjectionSchema>;

export type PersonnelRole = typeof personnelRoles.$inferSelect;
export type InsertPersonnelRole = z.infer<typeof insertPersonnelRoleSchema>;

export type PersonnelProjection = typeof personnelProjections.$inferSelect;
export type InsertPersonnelProjection = z.infer<typeof insertPersonnelProjectionSchema>;

export type Formula = typeof formulas.$inferSelect;
export type InsertFormula = z.infer<typeof insertFormulaSchema>;

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;

export type QuickbooksIntegration = typeof quickbooksIntegration.$inferSelect;
export type InsertQuickbooksIntegration = z.infer<typeof insertQuickbooksIntegrationSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
