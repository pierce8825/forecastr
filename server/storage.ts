import {
  User, InsertUser,
  Subaccount, InsertSubaccount,
  Forecast, InsertForecast,
  RevenueDriver, InsertRevenueDriver,
  RevenueStream, InsertRevenueStream,
  RevenueDriverToStream, InsertRevenueDriverToStream,
  Expense, InsertExpense,
  Department, InsertDepartment,
  PersonnelRole, InsertPersonnelRole,
  CustomFormula, InsertCustomFormula,
  PuzzleIntegration, InsertPuzzleIntegration,
  FinancialProjection, InsertFinancialProjection,
  Employee, InsertEmployee,
  Payroll, InsertPayroll,
  PayrollItem, InsertPayrollItem,
  ExpenseBudget, InsertExpenseBudget,
  ChatConversation, InsertChatConversation,
  ChatMessage, InsertChatMessage,
  users, subaccounts, forecasts, revenueDrivers, revenueStreams, revenueDriverToStream,
  expenses, departments, personnelRoles, customFormulas, puzzleIntegrations,
  financialProjections, employees, payrolls, payrollItems, expenseBudgets,
  chatConversations, chatMessages
} from "@shared/schema";

import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat operations
  getChatConversationsByUserId(userId: number): Promise<ChatConversation[]>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: number, data: Partial<InsertChatConversation>): Promise<ChatConversation | undefined>;
  deleteChatConversation(id: number): Promise<boolean>;
  getChatMessagesByConversationId(conversationId: number, limit?: number): Promise<ChatMessage[]>;
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Subaccount operations
  getSubaccountsByUserId(userId: number): Promise<Subaccount[]>;
  getSubaccount(id: number): Promise<Subaccount | undefined>;
  createSubaccount(subaccount: InsertSubaccount): Promise<Subaccount>;
  updateSubaccount(id: number, subaccount: Partial<InsertSubaccount>): Promise<Subaccount | undefined>;
  deleteSubaccount(id: number): Promise<boolean>;
  
  // Forecast operations
  getForecastsByUserId(userId: number): Promise<Forecast[]>;
  getForecastsBySubaccountId(subaccountId: number): Promise<Forecast[]>;
  getForecast(id: number): Promise<Forecast | undefined>;
  createForecast(forecast: InsertForecast): Promise<Forecast>;
  updateForecast(id: number, forecast: Partial<InsertForecast>): Promise<Forecast | undefined>;
  deleteForecast(id: number): Promise<boolean>;
  
  // Revenue Driver operations
  getRevenueDriversByForecastId(forecastId: number): Promise<RevenueDriver[]>;
  getRevenueDriver(id: number): Promise<RevenueDriver | undefined>;
  createRevenueDriver(driver: InsertRevenueDriver): Promise<RevenueDriver>;
  updateRevenueDriver(id: number, driver: Partial<InsertRevenueDriver>): Promise<RevenueDriver | undefined>;
  deleteRevenueDriver(id: number): Promise<boolean>;
  
  // Revenue Stream operations
  getRevenueStreamsByForecastId(forecastId: number): Promise<RevenueStream[]>;
  getRevenueStream(id: number): Promise<RevenueStream | undefined>;
  createRevenueStream(stream: InsertRevenueStream): Promise<RevenueStream>;
  updateRevenueStream(id: number, stream: Partial<InsertRevenueStream>): Promise<RevenueStream | undefined>;
  deleteRevenueStream(id: number): Promise<boolean>;
  
  // Revenue Driver to Stream Mapping operations
  getDriverStreamMappingsByForecastId(forecastId: number): Promise<(RevenueDriverToStream & { driver: RevenueDriver, stream: RevenueStream })[]>;
  getDriverStreamMappingsByDriverId(driverId: number): Promise<(RevenueDriverToStream & { stream: RevenueStream })[]>;
  getDriverStreamMappingsByStreamId(streamId: number): Promise<(RevenueDriverToStream & { driver: RevenueDriver })[]>;
  createDriverStreamMapping(mapping: InsertRevenueDriverToStream): Promise<RevenueDriverToStream>;
  updateDriverStreamMapping(id: number, mapping: Partial<InsertRevenueDriverToStream>): Promise<RevenueDriverToStream | undefined>;
  deleteDriverStreamMapping(id: number): Promise<boolean>;
  
  // Expense operations
  getExpensesByForecastId(forecastId: number): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Department operations
  getDepartmentsByForecastId(forecastId: number): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;
  
  // Personnel Role operations
  getPersonnelRolesByForecastId(forecastId: number): Promise<PersonnelRole[]>;
  getPersonnelRolesByDepartmentId(departmentId: number): Promise<PersonnelRole[]>;
  getPersonnelRole(id: number): Promise<PersonnelRole | undefined>;
  createPersonnelRole(role: InsertPersonnelRole): Promise<PersonnelRole>;
  updatePersonnelRole(id: number, role: Partial<InsertPersonnelRole>): Promise<PersonnelRole | undefined>;
  deletePersonnelRole(id: number): Promise<boolean>;
  
  // Custom Formula operations
  getCustomFormulasByForecastId(forecastId: number): Promise<CustomFormula[]>;
  getCustomFormula(id: number): Promise<CustomFormula | undefined>;
  createCustomFormula(formula: InsertCustomFormula): Promise<CustomFormula>;
  updateCustomFormula(id: number, formula: Partial<InsertCustomFormula>): Promise<CustomFormula | undefined>;
  deleteCustomFormula(id: number): Promise<boolean>;
  
  // Puzzle.io Integration operations
  getPuzzleIntegrationByUserId(userId: number): Promise<PuzzleIntegration | undefined>;
  createPuzzleIntegration(integration: InsertPuzzleIntegration): Promise<PuzzleIntegration>;
  updatePuzzleIntegration(userId: number, integration: Partial<InsertPuzzleIntegration>): Promise<PuzzleIntegration | undefined>;
  deletePuzzleIntegration(userId: number): Promise<boolean>;
  
  // Financial Projection operations
  getFinancialProjectionsByForecastId(forecastId: number): Promise<FinancialProjection[]>;
  getFinancialProjection(id: number): Promise<FinancialProjection | undefined>;
  createFinancialProjection(projection: InsertFinancialProjection): Promise<FinancialProjection>;
  updateFinancialProjection(id: number, projection: Partial<InsertFinancialProjection>): Promise<FinancialProjection | undefined>;
  deleteFinancialProjection(id: number): Promise<boolean>;
  
  // Employee operations
  getEmployeesByUserId(userId: number): Promise<Employee[]>;
  getEmployeesBySubaccountId(subaccountId: number): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Payroll operations
  getPayrollsByUserId(userId: number): Promise<Payroll[]>;
  getPayrollsBySubaccountId(subaccountId: number): Promise<Payroll[]>;
  getPayroll(id: number): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, payroll: Partial<InsertPayroll>): Promise<Payroll | undefined>;
  deletePayroll(id: number): Promise<boolean>;
  
  // PayrollItem operations
  getPayrollItemsByPayrollId(payrollId: number): Promise<PayrollItem[]>;
  getPayrollItemsByEmployeeId(employeeId: number): Promise<PayrollItem[]>;
  getPayrollItem(id: number): Promise<PayrollItem | undefined>;
  createPayrollItem(payrollItem: InsertPayrollItem): Promise<PayrollItem>;
  updatePayrollItem(id: number, payrollItem: Partial<InsertPayrollItem>): Promise<PayrollItem | undefined>;
  deletePayrollItem(id: number): Promise<boolean>;
  
  // Expense Budget operations
  getExpenseBudgets(forecastId: number, year?: number): Promise<ExpenseBudget[]>;
  getExpenseBudgetById(id: number): Promise<ExpenseBudget | undefined>;
  createExpenseBudget(budget: InsertExpenseBudget): Promise<ExpenseBudget>;
  updateExpenseBudget(id: number, budget: Partial<InsertExpenseBudget>): Promise<ExpenseBudget | undefined>;
  deleteExpenseBudget(id: number): Promise<boolean>;
}

// Use database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Subaccount operations
  async getSubaccountsByUserId(userId: number): Promise<Subaccount[]> {
    return await db
      .select()
      .from(subaccounts)
      .where(eq(subaccounts.userId, userId));
  }

  async getSubaccount(id: number): Promise<Subaccount | undefined> {
    const [subaccount] = await db
      .select()
      .from(subaccounts)
      .where(eq(subaccounts.id, id));
    return subaccount || undefined;
  }

  async createSubaccount(insertSubaccount: InsertSubaccount): Promise<Subaccount> {
    const [subaccount] = await db
      .insert(subaccounts)
      .values(insertSubaccount)
      .returning();
    return subaccount;
  }

  async updateSubaccount(id: number, updateData: Partial<InsertSubaccount>): Promise<Subaccount | undefined> {
    const [updatedSubaccount] = await db
      .update(subaccounts)
      .set(updateData)
      .where(eq(subaccounts.id, id))
      .returning();
    return updatedSubaccount || undefined;
  }

  async deleteSubaccount(id: number): Promise<boolean> {
    const [deletedSubaccount] = await db
      .delete(subaccounts)
      .where(eq(subaccounts.id, id))
      .returning();
    return !!deletedSubaccount;
  }
  
  // Forecast operations
  async getForecastsByUserId(userId: number): Promise<Forecast[]> {
    return await db
      .select()
      .from(forecasts)
      .where(eq(forecasts.userId, userId));
  }
  
  async getForecastsBySubaccountId(subaccountId: number): Promise<Forecast[]> {
    return await db
      .select()
      .from(forecasts)
      .where(eq(forecasts.subaccountId, subaccountId));
  }

  async getForecast(id: number): Promise<Forecast | undefined> {
    const [forecast] = await db
      .select()
      .from(forecasts)
      .where(eq(forecasts.id, id));
    return forecast || undefined;
  }

  async createForecast(insertForecast: InsertForecast): Promise<Forecast> {
    const [forecast] = await db
      .insert(forecasts)
      .values(insertForecast)
      .returning();
    return forecast;
  }

  async updateForecast(id: number, updateData: Partial<InsertForecast>): Promise<Forecast | undefined> {
    const [updatedForecast] = await db
      .update(forecasts)
      .set(updateData)
      .where(eq(forecasts.id, id))
      .returning();
    return updatedForecast || undefined;
  }

  async deleteForecast(id: number): Promise<boolean> {
    const [deletedForecast] = await db
      .delete(forecasts)
      .where(eq(forecasts.id, id))
      .returning();
    return !!deletedForecast;
  }
  
  // Revenue Driver operations
  async getRevenueDriversByForecastId(forecastId: number): Promise<RevenueDriver[]> {
    return await db
      .select()
      .from(revenueDrivers)
      .where(eq(revenueDrivers.forecastId, forecastId));
  }

  async getRevenueDriver(id: number): Promise<RevenueDriver | undefined> {
    const [driver] = await db
      .select()
      .from(revenueDrivers)
      .where(eq(revenueDrivers.id, id));
    return driver || undefined;
  }

  async createRevenueDriver(insertDriver: InsertRevenueDriver): Promise<RevenueDriver> {
    const [driver] = await db
      .insert(revenueDrivers)
      .values(insertDriver)
      .returning();
    return driver;
  }

  async updateRevenueDriver(id: number, updateData: Partial<InsertRevenueDriver>): Promise<RevenueDriver | undefined> {
    const [updatedDriver] = await db
      .update(revenueDrivers)
      .set(updateData)
      .where(eq(revenueDrivers.id, id))
      .returning();
    return updatedDriver || undefined;
  }

  async deleteRevenueDriver(id: number): Promise<boolean> {
    const [deletedDriver] = await db
      .delete(revenueDrivers)
      .where(eq(revenueDrivers.id, id))
      .returning();
    return !!deletedDriver;
  }
  
  // Revenue Stream operations
  async getRevenueStreamsByForecastId(forecastId: number): Promise<RevenueStream[]> {
    return await db
      .select()
      .from(revenueStreams)
      .where(eq(revenueStreams.forecastId, forecastId));
  }

  async getRevenueStream(id: number): Promise<RevenueStream | undefined> {
    const [stream] = await db
      .select()
      .from(revenueStreams)
      .where(eq(revenueStreams.id, id));
    return stream || undefined;
  }

  async createRevenueStream(insertStream: InsertRevenueStream): Promise<RevenueStream> {
    const [stream] = await db
      .insert(revenueStreams)
      .values(insertStream)
      .returning();
    return stream;
  }

  async updateRevenueStream(id: number, updateData: Partial<InsertRevenueStream>): Promise<RevenueStream | undefined> {
    const [updatedStream] = await db
      .update(revenueStreams)
      .set(updateData)
      .where(eq(revenueStreams.id, id))
      .returning();
    return updatedStream || undefined;
  }

  async deleteRevenueStream(id: number): Promise<boolean> {
    const [deletedStream] = await db
      .delete(revenueStreams)
      .where(eq(revenueStreams.id, id))
      .returning();
    return !!deletedStream;
  }
  
  // Revenue Driver to Stream Mapping operations
  async getDriverStreamMappingsByForecastId(forecastId: number): Promise<(RevenueDriverToStream & { driver: RevenueDriver; stream: RevenueStream })[]> {
    const mappings = await db
      .select()
      .from(revenueDriverToStream)
      .innerJoin(revenueDrivers, eq(revenueDriverToStream.driverId, revenueDrivers.id))
      .innerJoin(revenueStreams, eq(revenueDriverToStream.streamId, revenueStreams.id))
      .where(eq(revenueDrivers.forecastId, forecastId));
      
    return mappings.map(m => ({
      ...m.revenue_driver_to_stream,
      driver: m.revenue_drivers,
      stream: m.revenue_streams
    }));
  }

  async getDriverStreamMappingsByDriverId(driverId: number): Promise<(RevenueDriverToStream & { stream: RevenueStream })[]> {
    const mappings = await db
      .select()
      .from(revenueDriverToStream)
      .innerJoin(revenueStreams, eq(revenueDriverToStream.streamId, revenueStreams.id))
      .where(eq(revenueDriverToStream.driverId, driverId));
      
    return mappings.map(m => ({
      ...m.revenue_driver_to_stream,
      stream: m.revenue_streams
    }));
  }

  async getDriverStreamMappingsByStreamId(streamId: number): Promise<(RevenueDriverToStream & { driver: RevenueDriver })[]> {
    const mappings = await db
      .select()
      .from(revenueDriverToStream)
      .innerJoin(revenueDrivers, eq(revenueDriverToStream.driverId, revenueDrivers.id))
      .where(eq(revenueDriverToStream.streamId, streamId));
      
    return mappings.map(m => ({
      ...m.revenue_driver_to_stream,
      driver: m.revenue_drivers
    }));
  }

  async createDriverStreamMapping(insertMapping: InsertRevenueDriverToStream): Promise<RevenueDriverToStream> {
    const [mapping] = await db
      .insert(revenueDriverToStream)
      .values(insertMapping)
      .returning();
    return mapping;
  }

  async updateDriverStreamMapping(id: number, updateData: Partial<InsertRevenueDriverToStream>): Promise<RevenueDriverToStream | undefined> {
    const [updatedMapping] = await db
      .update(revenueDriverToStream)
      .set(updateData)
      .where(eq(revenueDriverToStream.id, id))
      .returning();
    return updatedMapping || undefined;
  }

  async deleteDriverStreamMapping(id: number): Promise<boolean> {
    const [deletedMapping] = await db
      .delete(revenueDriverToStream)
      .where(eq(revenueDriverToStream.id, id))
      .returning();
    return !!deletedMapping;
  }
  
  // Expense Budget operations
  async getExpenseBudgets(forecastId: number, year?: number): Promise<ExpenseBudget[]> {
    // Base query with forecast filter
    if (year) {
      // With year filter
      return db
        .select()
        .from(expenseBudgets)
        .where(and(
          eq(expenseBudgets.forecastId, forecastId),
          eq(expenseBudgets.year, year)
        ))
        .orderBy(expenseBudgets.category);
    } else {
      // Without year filter
      return db
        .select()
        .from(expenseBudgets)
        .where(eq(expenseBudgets.forecastId, forecastId))
        .orderBy(expenseBudgets.category);
    }
  }

  async getExpenseBudgetById(id: number): Promise<ExpenseBudget | undefined> {
    const [budget] = await db
      .select()
      .from(expenseBudgets)
      .where(eq(expenseBudgets.id, id));
    return budget;
  }

  async createExpenseBudget(budget: InsertExpenseBudget): Promise<ExpenseBudget> {
    const [newBudget] = await db
      .insert(expenseBudgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateExpenseBudget(id: number, budgetData: Partial<InsertExpenseBudget>): Promise<ExpenseBudget | undefined> {
    const [updatedBudget] = await db
      .update(expenseBudgets)
      .set(budgetData)
      .where(eq(expenseBudgets.id, id))
      .returning();
    return updatedBudget || undefined;
  }

  async deleteExpenseBudget(id: number): Promise<boolean> {
    const [deletedBudget] = await db
      .delete(expenseBudgets)
      .where(eq(expenseBudgets.id, id))
      .returning();
    return !!deletedBudget;
  }
  
  // Expense operations
  async getExpensesByForecastId(forecastId: number): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.forecastId, forecastId));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const [deletedExpense] = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();
    return !!deletedExpense;
  }
  
  // Department operations
  async getDepartmentsByForecastId(forecastId: number): Promise<Department[]> {
    return await db
      .select()
      .from(departments)
      .where(eq(departments.forecastId, forecastId));
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db
      .insert(departments)
      .values(insertDepartment)
      .returning();
    return department;
  }

  async updateDepartment(id: number, updateData: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updatedDepartment] = await db
      .update(departments)
      .set(updateData)
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment || undefined;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    const [deletedDepartment] = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();
    return !!deletedDepartment;
  }
  
  // Personnel Role operations
  async getPersonnelRolesByForecastId(forecastId: number): Promise<PersonnelRole[]> {
    return await db
      .select()
      .from(personnelRoles)
      .where(eq(personnelRoles.forecastId, forecastId));
  }

  async getPersonnelRolesByDepartmentId(departmentId: number): Promise<PersonnelRole[]> {
    return await db
      .select()
      .from(personnelRoles)
      .where(eq(personnelRoles.departmentId, departmentId));
  }

  async getPersonnelRole(id: number): Promise<PersonnelRole | undefined> {
    const [role] = await db
      .select()
      .from(personnelRoles)
      .where(eq(personnelRoles.id, id));
    return role || undefined;
  }

  async createPersonnelRole(insertRole: InsertPersonnelRole): Promise<PersonnelRole> {
    const [role] = await db
      .insert(personnelRoles)
      .values(insertRole)
      .returning();
    return role;
  }

  async updatePersonnelRole(id: number, updateData: Partial<InsertPersonnelRole>): Promise<PersonnelRole | undefined> {
    const [updatedRole] = await db
      .update(personnelRoles)
      .set(updateData)
      .where(eq(personnelRoles.id, id))
      .returning();
    return updatedRole || undefined;
  }

  async deletePersonnelRole(id: number): Promise<boolean> {
    const [deletedRole] = await db
      .delete(personnelRoles)
      .where(eq(personnelRoles.id, id))
      .returning();
    return !!deletedRole;
  }
  
  // Custom Formula operations
  async getCustomFormulasByForecastId(forecastId: number): Promise<CustomFormula[]> {
    return await db
      .select()
      .from(customFormulas)
      .where(eq(customFormulas.forecastId, forecastId));
  }

  async getCustomFormula(id: number): Promise<CustomFormula | undefined> {
    const [formula] = await db
      .select()
      .from(customFormulas)
      .where(eq(customFormulas.id, id));
    return formula || undefined;
  }

  async createCustomFormula(insertFormula: InsertCustomFormula): Promise<CustomFormula> {
    const [formula] = await db
      .insert(customFormulas)
      .values(insertFormula)
      .returning();
    return formula;
  }

  async updateCustomFormula(id: number, updateData: Partial<InsertCustomFormula>): Promise<CustomFormula | undefined> {
    const [updatedFormula] = await db
      .update(customFormulas)
      .set(updateData)
      .where(eq(customFormulas.id, id))
      .returning();
    return updatedFormula || undefined;
  }

  async deleteCustomFormula(id: number): Promise<boolean> {
    const [deletedFormula] = await db
      .delete(customFormulas)
      .where(eq(customFormulas.id, id))
      .returning();
    return !!deletedFormula;
  }
  
  // Puzzle.io Integration operations
  async getPuzzleIntegrationByUserId(userId: number): Promise<PuzzleIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(puzzleIntegrations)
      .where(eq(puzzleIntegrations.userId, userId));
    return integration || undefined;
  }

  async createPuzzleIntegration(insertIntegration: InsertPuzzleIntegration): Promise<PuzzleIntegration> {
    const [integration] = await db
      .insert(puzzleIntegrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updatePuzzleIntegration(userId: number, updateData: Partial<InsertPuzzleIntegration>): Promise<PuzzleIntegration | undefined> {
    const [updatedIntegration] = await db
      .update(puzzleIntegrations)
      .set(updateData)
      .where(eq(puzzleIntegrations.userId, userId))
      .returning();
    return updatedIntegration || undefined;
  }

  async deletePuzzleIntegration(userId: number): Promise<boolean> {
    const [deletedIntegration] = await db
      .delete(puzzleIntegrations)
      .where(eq(puzzleIntegrations.userId, userId))
      .returning();
    return !!deletedIntegration;
  }
  
  // Financial Projection operations
  async getFinancialProjectionsByForecastId(forecastId: number): Promise<FinancialProjection[]> {
    return await db
      .select()
      .from(financialProjections)
      .where(eq(financialProjections.forecastId, forecastId));
  }

  async getFinancialProjection(id: number): Promise<FinancialProjection | undefined> {
    const [projection] = await db
      .select()
      .from(financialProjections)
      .where(eq(financialProjections.id, id));
    return projection || undefined;
  }

  async createFinancialProjection(insertProjection: InsertFinancialProjection): Promise<FinancialProjection> {
    const [projection] = await db
      .insert(financialProjections)
      .values(insertProjection)
      .returning();
    return projection;
  }

  async updateFinancialProjection(id: number, updateData: Partial<InsertFinancialProjection>): Promise<FinancialProjection | undefined> {
    const [updatedProjection] = await db
      .update(financialProjections)
      .set(updateData)
      .where(eq(financialProjections.id, id))
      .returning();
    return updatedProjection || undefined;
  }

  async deleteFinancialProjection(id: number): Promise<boolean> {
    const [deletedProjection] = await db
      .delete(financialProjections)
      .where(eq(financialProjections.id, id))
      .returning();
    return !!deletedProjection;
  }
  
  // Employee operations
  async getEmployeesByUserId(userId: number): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId));
  }
  
  async getEmployeesBySubaccountId(subaccountId: number): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.subaccountId, subaccountId));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.email, email));
    return employee || undefined;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const [deletedEmployee] = await db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning();
    return !!deletedEmployee;
  }
  
  // Payroll operations
  async getPayrollsByUserId(userId: number): Promise<Payroll[]> {
    return await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.userId, userId));
  }
  
  async getPayrollsBySubaccountId(subaccountId: number): Promise<Payroll[]> {
    return await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.subaccountId, subaccountId));
  }

  async getPayroll(id: number): Promise<Payroll | undefined> {
    const [payroll] = await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.id, id));
    return payroll || undefined;
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const [payroll] = await db
      .insert(payrolls)
      .values(insertPayroll)
      .returning();
    return payroll;
  }

  async updatePayroll(id: number, updateData: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const [updatedPayroll] = await db
      .update(payrolls)
      .set(updateData)
      .where(eq(payrolls.id, id))
      .returning();
    return updatedPayroll || undefined;
  }

  async deletePayroll(id: number): Promise<boolean> {
    const [deletedPayroll] = await db
      .delete(payrolls)
      .where(eq(payrolls.id, id))
      .returning();
    return !!deletedPayroll;
  }
  
  // PayrollItem operations
  async getPayrollItemsByPayrollId(payrollId: number): Promise<PayrollItem[]> {
    return await db
      .select()
      .from(payrollItems)
      .where(eq(payrollItems.payrollId, payrollId));
  }

  async getPayrollItemsByEmployeeId(employeeId: number): Promise<PayrollItem[]> {
    return await db
      .select()
      .from(payrollItems)
      .where(eq(payrollItems.employeeId, employeeId));
  }

  async getPayrollItem(id: number): Promise<PayrollItem | undefined> {
    const [payrollItem] = await db
      .select()
      .from(payrollItems)
      .where(eq(payrollItems.id, id));
    return payrollItem || undefined;
  }

  async createPayrollItem(insertPayrollItem: InsertPayrollItem): Promise<PayrollItem> {
    const [payrollItem] = await db
      .insert(payrollItems)
      .values(insertPayrollItem)
      .returning();
    return payrollItem;
  }

  async updatePayrollItem(id: number, updateData: Partial<InsertPayrollItem>): Promise<PayrollItem | undefined> {
    const [updatedPayrollItem] = await db
      .update(payrollItems)
      .set(updateData)
      .where(eq(payrollItems.id, id))
      .returning();
    return updatedPayrollItem || undefined;
  }

  async deletePayrollItem(id: number): Promise<boolean> {
    const [deletedPayrollItem] = await db
      .delete(payrollItems)
      .where(eq(payrollItems.id, id))
      .returning();
    return !!deletedPayrollItem;
  }

  // Chat Conversation operations
  async getChatConversationsByUserId(userId: number): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId));
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, id));
    return conversation || undefined;
  }

  async createChatConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const [conversation] = await db
      .insert(chatConversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateChatConversation(id: number, updateData: Partial<InsertChatConversation>): Promise<ChatConversation | undefined> {
    const [updatedConversation] = await db
      .update(chatConversations)
      .set(updateData)
      .where(eq(chatConversations.id, id))
      .returning();
    return updatedConversation || undefined;
  }

  async deleteChatConversation(id: number): Promise<boolean> {
    const [deletedConversation] = await db
      .delete(chatConversations)
      .where(eq(chatConversations.id, id))
      .returning();
    return !!deletedConversation;
  }

  // Chat Message operations
  async getChatMessagesByConversationId(conversationId: number, limit?: number): Promise<ChatMessage[]> {
    let query = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, id));
    return message || undefined;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();