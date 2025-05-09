import { pgTable, text, serial, integer, jsonb, numeric, timestamp, boolean, date, uuid } from "drizzle-orm/pg-core";
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

// Subaccount schema for managing multiple companies/projects
export const subaccounts = pgTable("subaccounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // The owner of the subaccount
  name: text("name").notNull(), // Company or project name
  description: text("description"),
  industry: text("industry"),
  logo: text("logo"), // URL to logo image
  active: boolean("active").default(true),
  customDomain: text("custom_domain"),
  settings: jsonb("settings"), // Store custom settings as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubaccountSchema = createInsertSchema(subaccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true,
});

// Forecast schema
export const forecasts = pgTable("forecasts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subaccountId: integer("subaccount_id"), // Optional if using shared forecasts
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
  formula: text("formula"), // Optional formula for calculating the amount
  frequency: text("frequency").notNull(), // one-time, monthly, quarterly, annual
  category: text("category"), // marketing, software, office, etc.
  isCogsRelated: boolean("is_cogs_related").default(false),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  growthRate: numeric("growth_rate", { precision: 6, scale: 4 }),
  notes: text("notes"),
  linkedStreamId: integer("linked_stream_id"), // Optional link to revenue stream
  linkedDriverId: integer("linked_driver_id"), // Optional link to revenue driver
  linkedPersonnelId: integer("linked_personnel_id"), // Optional link to personnel role
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
  startDate: timestamp("start_date"), // When the role starts
  endDate: timestamp("end_date"), // When the role ends (optional)
  startingMonth: integer("starting_month"), // Legacy: month number (1-12)
  benefits: numeric("benefits", { precision: 5, scale: 4 }), // percentage of salary
  employmentType: text("employment_type").default("W2"), // W2, 1099, overseas, etc.
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

// Puzzle.io Integration schema
export const puzzleIntegrations = pgTable("puzzle_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  apiKey: text("api_key"),
  workspaceId: text("workspace_id"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPuzzleIntegrationSchema = createInsertSchema(puzzleIntegrations).omit({
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

// Revenue Driver to Stream Mapping schema
export const revenueDriverToStream = pgTable("revenue_driver_to_stream", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  streamId: integer("stream_id").notNull(),
  formula: text("formula"), // Optional formula to calculate how the driver affects the stream
  multiplier: numeric("multiplier", { precision: 15, scale: 4 }), // e.g., ARPU value
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRevenueDriverToStreamSchema = createInsertSchema(revenueDriverToStream).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Subaccount = typeof subaccounts.$inferSelect;
export type InsertSubaccount = z.infer<typeof insertSubaccountSchema>;

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = z.infer<typeof insertForecastSchema>;

export type RevenueDriver = typeof revenueDrivers.$inferSelect;
export type InsertRevenueDriver = z.infer<typeof insertRevenueDriverSchema>;

export type RevenueStream = typeof revenueStreams.$inferSelect;
export type InsertRevenueStream = z.infer<typeof insertRevenueStreamSchema>;

export type RevenueDriverToStream = typeof revenueDriverToStream.$inferSelect;
export type InsertRevenueDriverToStream = z.infer<typeof insertRevenueDriverToStreamSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type PersonnelRole = typeof personnelRoles.$inferSelect;
export type InsertPersonnelRole = z.infer<typeof insertPersonnelRoleSchema>;

export type CustomFormula = typeof customFormulas.$inferSelect;
export type InsertCustomFormula = z.infer<typeof insertCustomFormulaSchema>;

export type PuzzleIntegration = typeof puzzleIntegrations.$inferSelect;
export type InsertPuzzleIntegration = z.infer<typeof insertPuzzleIntegrationSchema>;

export type FinancialProjection = typeof financialProjections.$inferSelect;
export type InsertFinancialProjection = z.infer<typeof insertFinancialProjectionSchema>;

// Employee schema
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subaccountId: integer("subaccount_id"), // Allow employees to be associated with specific subaccounts
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  employeeType: text("employee_type").notNull(), // fullTime, partTime, contractor
  departmentId: integer("department_id"),
  role: text("role").notNull(),
  startDate: date("start_date").notNull(),
  salary: numeric("salary", { precision: 12, scale: 2 }).notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  taxWithholding: text("tax_withholding"),
  isInternational: boolean("is_international").default(false),
  benefitsEligible: boolean("benefits_eligible").default(true),
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

// Payroll schema
export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subaccountId: integer("subaccount_id"), // Allow payrolls to be associated with specific subaccounts
  name: text("name").notNull(),
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  paymentDate: date("payment_date").notNull(),
  status: text("status").notNull(), // Scheduled, Pending, Completed
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPayrollSchema = createInsertSchema(payrolls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Payroll = typeof payrolls.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

// PayrollItem schema (links employees to payrolls)
export const payrollItems = pgTable("payroll_items", {
  id: serial("id").primaryKey(),
  payrollId: integer("payroll_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  hoursWorked: numeric("hours_worked", { precision: 8, scale: 2 }),
  regularPay: numeric("regular_pay", { precision: 12, scale: 2 }).notNull(),
  overtimePay: numeric("overtime_pay", { precision: 12, scale: 2 }),
  bonusPay: numeric("bonus_pay", { precision: 12, scale: 2 }),
  deductions: numeric("deductions", { precision: 12, scale: 2 }),
  netPay: numeric("net_pay", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPayrollItemSchema = createInsertSchema(payrollItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PayrollItem = typeof payrollItems.$inferSelect;
export type InsertPayrollItem = z.infer<typeof insertPayrollItemSchema>;

// Define the relationships between tables
export const relations = {
  users: {
    subaccounts: {
      // One user can have many subaccounts
      relationDef: {
        one: {
          table: users,
          field: users.id,
        },
        many: {
          table: subaccounts,
          field: subaccounts.userId,
        },
      },
    },
  },
  subaccounts: {
    forecasts: {
      // One subaccount can have many forecasts
      relationDef: {
        one: {
          table: subaccounts,
          field: subaccounts.id,
        },
        many: {
          table: forecasts,
          field: forecasts.subaccountId,
        },
      },
    },
    employees: {
      // One subaccount can have many employees
      relationDef: {
        one: {
          table: subaccounts,
          field: subaccounts.id,
        },
        many: {
          table: employees,
          field: employees.subaccountId,
        },
      },
    },
    payrolls: {
      // One subaccount can have many payrolls
      relationDef: {
        one: {
          table: subaccounts,
          field: subaccounts.id,
        },
        many: {
          table: payrolls,
          field: payrolls.subaccountId,
        },
      },
    },
  },
  employees: {
    payrollItems: {
      // One employee can have many payroll items
      relationDef: {
        one: {
          table: employees,
          field: employees.id,
        },
        many: {
          table: payrollItems,
          field: payrollItems.employeeId,
        },
      },
    },
  },
  payrolls: {
    payrollItems: {
      // One payroll can have many payroll items
      relationDef: {
        one: {
          table: payrolls,
          field: payrolls.id,
        },
        many: {
          table: payrollItems,
          field: payrollItems.payrollId,
        },
      },
    },
  },
};
