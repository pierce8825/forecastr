import {
  User, InsertUser,
  Forecast, InsertForecast,
  RevenueDriver, InsertRevenueDriver,
  RevenueStream, InsertRevenueStream,
  RevenueDriverToStream, InsertRevenueDriverToStream,
  Expense, InsertExpense,
  Department, InsertDepartment,
  PersonnelRole, InsertPersonnelRole,
  CustomFormula, InsertCustomFormula,
  QuickbooksIntegration, InsertQuickbooksIntegration,
  FinancialProjection, InsertFinancialProjection
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Forecast operations
  getForecastsByUserId(userId: number): Promise<Forecast[]>;
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
  
  // QuickBooks Integration operations
  getQuickbooksIntegrationByUserId(userId: number): Promise<QuickbooksIntegration | undefined>;
  createQuickbooksIntegration(integration: InsertQuickbooksIntegration): Promise<QuickbooksIntegration>;
  updateQuickbooksIntegration(userId: number, integration: Partial<InsertQuickbooksIntegration>): Promise<QuickbooksIntegration | undefined>;
  deleteQuickbooksIntegration(userId: number): Promise<boolean>;
  
  // Financial Projection operations
  getFinancialProjectionsByForecastId(forecastId: number): Promise<FinancialProjection[]>;
  getFinancialProjection(id: number): Promise<FinancialProjection | undefined>;
  createFinancialProjection(projection: InsertFinancialProjection): Promise<FinancialProjection>;
  updateFinancialProjection(id: number, projection: Partial<InsertFinancialProjection>): Promise<FinancialProjection | undefined>;
  deleteFinancialProjection(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private forecasts: Map<number, Forecast>;
  private revenueDrivers: Map<number, RevenueDriver>;
  private revenueStreams: Map<number, RevenueStream>;
  private driverStreamMappings: Map<number, RevenueDriverToStream>;
  private expenses: Map<number, Expense>;
  private departments: Map<number, Department>;
  private personnelRoles: Map<number, PersonnelRole>;
  private customFormulas: Map<number, CustomFormula>;
  private quickbooksIntegrations: Map<number, QuickbooksIntegration>;
  private financialProjections: Map<number, FinancialProjection>;
  
  private currentUserId: number;
  private currentForecastId: number;
  private currentRevenueDriverId: number;
  private currentRevenueStreamId: number;
  private currentDriverStreamMappingId: number;
  private currentExpenseId: number;
  private currentDepartmentId: number;
  private currentPersonnelRoleId: number;
  private currentCustomFormulaId: number;
  private currentQuickbooksIntegrationId: number;
  private currentFinancialProjectionId: number;

  constructor() {
    this.users = new Map();
    this.forecasts = new Map();
    this.revenueDrivers = new Map();
    this.revenueStreams = new Map();
    this.driverStreamMappings = new Map();
    this.expenses = new Map();
    this.departments = new Map();
    this.personnelRoles = new Map();
    this.customFormulas = new Map();
    this.quickbooksIntegrations = new Map();
    this.financialProjections = new Map();
    
    this.currentUserId = 1;
    this.currentForecastId = 1;
    this.currentRevenueDriverId = 1;
    this.currentRevenueStreamId = 1;
    this.currentDriverStreamMappingId = 1;
    this.currentExpenseId = 1;
    this.currentDepartmentId = 1;
    this.currentPersonnelRoleId = 1;
    this.currentCustomFormulaId = 1;
    this.currentQuickbooksIntegrationId = 1;
    this.currentFinancialProjectionId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "password",
      email: "demo@example.com",
      companyName: "Demo Company"
    };
    
    const user = this.createUser(demoUser);
    
    // Create a demo forecast
    const demoForecast: InsertForecast = {
      userId: user.id,
      name: "2023 Growth Plan",
      description: "Financial forecast for 2023 growth",
      currency: "USD"
    };
    
    const forecast = this.createForecast(demoForecast);
    
    // Create demo revenue drivers
    const demoRevenueDrivers: InsertRevenueDriver[] = [
      {
        forecastId: forecast.id,
        name: "Monthly Active Users",
        value: "45200",
        unit: "users",
        minValue: "0",
        maxValue: "100000",
        growthRate: "0.024", // 2.4%
        category: "usage"
      },
      {
        forecastId: forecast.id,
        name: "Conversion Rate",
        value: "5.8",
        unit: "%",
        minValue: "0",
        maxValue: "10",
        growthRate: "0.003", // 0.3%
        category: "conversion"
      },
      {
        forecastId: forecast.id,
        name: "ARPU",
        value: "89",
        unit: "USD",
        minValue: "0",
        maxValue: "100",
        growthRate: "0.052", // 5.2%
        category: "monetization"
      }
    ];
    
    demoRevenueDrivers.forEach(driver => this.createRevenueDriver(driver));
    
    // Create demo revenue streams
    const demoRevenueStreams: InsertRevenueStream[] = [
      {
        forecastId: forecast.id,
        name: "Subscription Revenue",
        type: "subscription",
        amount: "1850400",
        frequency: "annual",
        growthRate: "0.182", // 18.2%
        category: "core"
      },
      {
        forecastId: forecast.id,
        name: "Service Revenue",
        type: "service",
        amount: "452800",
        frequency: "annual",
        growthRate: "0.057", // 5.7%
        category: "services"
      },
      {
        forecastId: forecast.id,
        name: "One-time Sales",
        type: "one-time",
        amount: "155000",
        frequency: "annual",
        growthRate: "-0.023", // -2.3%
        category: "other"
      }
    ];
    
    const streams = demoRevenueStreams.map(stream => this.createRevenueStream(stream));
    
    // Create demo driver-stream mappings
    const demoDriverStreamMappings: InsertRevenueDriverToStream[] = [
      {
        driverId: 1,  // Monthly Active Users
        streamId: 1,  // Subscription Revenue
        formula: "value * 0.058 * 89",  // MAU * conversion rate * ARPU
        multiplier: "1"
      },
      {
        driverId: 2,  // Conversion Rate
        streamId: 1,  // Subscription Revenue
        formula: "45200 * value * 89",  // MAU * conversion rate * ARPU
        multiplier: "1"
      },
      {
        driverId: 3,  // ARPU
        streamId: 1,  // Subscription Revenue
        formula: "45200 * 0.058 * value",  // MAU * conversion rate * ARPU
        multiplier: "1"
      },
      {
        driverId: 1,  // Monthly Active Users
        streamId: 2,  // Service Revenue
        formula: "value * 0.01 * 100",  // MAU * 1% * $100
        multiplier: "1"
      }
    ];
    
    demoDriverStreamMappings.forEach(mapping => this.createDriverStreamMapping(mapping));
    
    // Create demo departments
    const demoDepartments: InsertDepartment[] = [
      {
        forecastId: forecast.id,
        name: "Engineering"
      },
      {
        forecastId: forecast.id,
        name: "Sales"
      },
      {
        forecastId: forecast.id,
        name: "Marketing"
      }
    ];
    
    const departments = demoDepartments.map(dept => this.createDepartment(dept));
    
    // Create demo personnel roles
    const demoPersonnelRoles: InsertPersonnelRole[] = [
      {
        forecastId: forecast.id,
        departmentId: departments[0].id,
        title: "Software Engineer",
        count: 18,
        plannedCount: 22,
        annualSalary: "125000",
        benefits: "0.2", // 20% benefits
      },
      {
        forecastId: forecast.id,
        departmentId: departments[1].id,
        title: "Sales Representative",
        count: 12,
        plannedCount: 15,
        annualSalary: "110000",
        benefits: "0.15", // 15% benefits
      },
      {
        forecastId: forecast.id,
        departmentId: departments[2].id,
        title: "Marketing Specialist",
        count: 8,
        plannedCount: 10,
        annualSalary: "95000",
        benefits: "0.18", // 18% benefits
      }
    ];
    
    demoPersonnelRoles.forEach(role => this.createPersonnelRole(role));
    
    // Create demo expenses
    const demoExpenses: InsertExpense[] = [
      {
        forecastId: forecast.id,
        name: "Marketing Expense",
        amount: "18400",
        frequency: "monthly",
        category: "Marketing",
        isCogsRelated: false
      },
      {
        forecastId: forecast.id,
        name: "Software Subscriptions",
        amount: "12350",
        frequency: "monthly",
        category: "Software",
        isCogsRelated: false
      },
      {
        forecastId: forecast.id,
        name: "Office Rent",
        amount: "6750",
        frequency: "monthly",
        category: "Office",
        isCogsRelated: false
      },
      {
        forecastId: forecast.id,
        name: "Miscellaneous",
        amount: "3850",
        frequency: "monthly",
        category: "Other",
        isCogsRelated: false
      }
    ];
    
    demoExpenses.forEach(expense => this.createExpense(expense));
    
    // Create demo custom formulas
    const demoFormulas: InsertCustomFormula[] = [
      {
        forecastId: forecast.id,
        name: "Annual MRR",
        formula: "Monthly Active Users * Conversion Rate * ARPU * 12",
        description: "Calculates Annual MRR based on core metrics",
        category: "Revenue"
      },
      {
        forecastId: forecast.id,
        name: "CAC Payback Period",
        formula: "Customer Acquisition Cost / (ARPU * Gross Margin)",
        description: "Months to recover CAC",
        category: "Metrics"
      }
    ];
    
    demoFormulas.forEach(formula => this.createCustomFormula(formula));
    
    // Create demo financial projections
    const demoProjections: InsertFinancialProjection[] = [
      {
        forecastId: forecast.id,
        period: "01-2023",
        revenueTotal: "215000",
        cogsTotal: "65000",
        expenseTotal: "120000",
        personnelTotal: "84250",
        netProfit: "30000",
        cashInflow: "215000",
        cashOutflow: "185000",
        cashBalance: "980000",
        projectionData: {}
      },
      {
        forecastId: forecast.id,
        period: "02-2023",
        revenueTotal: "220000",
        cogsTotal: "68000",
        expenseTotal: "127000",
        personnelTotal: "84250",
        netProfit: "25000",
        cashInflow: "220000",
        cashOutflow: "195000",
        cashBalance: "1005000",
        projectionData: {}
      },
      {
        forecastId: forecast.id,
        period: "03-2023",
        revenueTotal: "205000",
        cogsTotal: "62000",
        expenseTotal: "148000",
        personnelTotal: "84250",
        netProfit: "-5000",
        cashInflow: "205000",
        cashOutflow: "210000",
        cashBalance: "1000000",
        projectionData: {}
      },
      {
        forecastId: forecast.id,
        period: "04-2023",
        revenueTotal: "235000",
        cogsTotal: "71000",
        expenseTotal: "134000",
        personnelTotal: "84250",
        netProfit: "30000",
        cashInflow: "235000",
        cashOutflow: "205000",
        cashBalance: "1030000",
        projectionData: {}
      }
    ];
    
    demoProjections.forEach(projection => this.createFinancialProjection(projection));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Forecast methods
  async getForecastsByUserId(userId: number): Promise<Forecast[]> {
    return Array.from(this.forecasts.values()).filter(
      (forecast) => forecast.userId === userId,
    );
  }
  
  async getForecast(id: number): Promise<Forecast | undefined> {
    return this.forecasts.get(id);
  }
  
  async createForecast(insertForecast: InsertForecast): Promise<Forecast> {
    const id = this.currentForecastId++;
    const now = new Date();
    const forecast: Forecast = { ...insertForecast, id, createdAt: now, updatedAt: now };
    this.forecasts.set(id, forecast);
    return forecast;
  }
  
  async updateForecast(id: number, updateData: Partial<InsertForecast>): Promise<Forecast | undefined> {
    const forecast = await this.getForecast(id);
    if (!forecast) return undefined;
    
    const updatedForecast: Forecast = {
      ...forecast,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.forecasts.set(id, updatedForecast);
    return updatedForecast;
  }
  
  async deleteForecast(id: number): Promise<boolean> {
    return this.forecasts.delete(id);
  }
  
  // Revenue Driver methods
  async getRevenueDriversByForecastId(forecastId: number): Promise<RevenueDriver[]> {
    return Array.from(this.revenueDrivers.values()).filter(
      (driver) => driver.forecastId === forecastId,
    );
  }
  
  async getRevenueDriver(id: number): Promise<RevenueDriver | undefined> {
    return this.revenueDrivers.get(id);
  }
  
  async createRevenueDriver(insertDriver: InsertRevenueDriver): Promise<RevenueDriver> {
    const id = this.currentRevenueDriverId++;
    const now = new Date();
    const driver: RevenueDriver = { ...insertDriver, id, createdAt: now, updatedAt: now };
    this.revenueDrivers.set(id, driver);
    return driver;
  }
  
  async updateRevenueDriver(id: number, updateData: Partial<InsertRevenueDriver>): Promise<RevenueDriver | undefined> {
    const driver = await this.getRevenueDriver(id);
    if (!driver) return undefined;
    
    const updatedDriver: RevenueDriver = {
      ...driver,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.revenueDrivers.set(id, updatedDriver);
    return updatedDriver;
  }
  
  async deleteRevenueDriver(id: number): Promise<boolean> {
    return this.revenueDrivers.delete(id);
  }
  
  // Revenue Stream methods
  async getRevenueStreamsByForecastId(forecastId: number): Promise<RevenueStream[]> {
    return Array.from(this.revenueStreams.values()).filter(
      (stream) => stream.forecastId === forecastId,
    );
  }
  
  async getRevenueStream(id: number): Promise<RevenueStream | undefined> {
    return this.revenueStreams.get(id);
  }
  
  async createRevenueStream(insertStream: InsertRevenueStream): Promise<RevenueStream> {
    const id = this.currentRevenueStreamId++;
    const now = new Date();
    const stream: RevenueStream = { ...insertStream, id, createdAt: now, updatedAt: now };
    this.revenueStreams.set(id, stream);
    return stream;
  }
  
  async updateRevenueStream(id: number, updateData: Partial<InsertRevenueStream>): Promise<RevenueStream | undefined> {
    const stream = await this.getRevenueStream(id);
    if (!stream) return undefined;
    
    const updatedStream: RevenueStream = {
      ...stream,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.revenueStreams.set(id, updatedStream);
    return updatedStream;
  }
  
  async deleteRevenueStream(id: number): Promise<boolean> {
    return this.revenueStreams.delete(id);
  }
  
  // Revenue Driver to Stream Mapping methods
  async getDriverStreamMappingsByForecastId(forecastId: number): Promise<(RevenueDriverToStream & { driver: RevenueDriver, stream: RevenueStream })[]> {
    const allMappings = Array.from(this.driverStreamMappings.values());
    const result: (RevenueDriverToStream & { driver: RevenueDriver, stream: RevenueStream })[] = [];
    
    for (const mapping of allMappings) {
      const driver = await this.getRevenueDriver(mapping.driverId);
      const stream = await this.getRevenueStream(mapping.streamId);
      
      if (driver && stream && driver.forecastId === forecastId && stream.forecastId === forecastId) {
        result.push({
          ...mapping,
          driver,
          stream
        });
      }
    }
    
    return result;
  }
  
  async getDriverStreamMappingsByDriverId(driverId: number): Promise<(RevenueDriverToStream & { stream: RevenueStream })[]> {
    const allMappings = Array.from(this.driverStreamMappings.values());
    const result: (RevenueDriverToStream & { stream: RevenueStream })[] = [];
    
    for (const mapping of allMappings) {
      if (mapping.driverId === driverId) {
        const stream = await this.getRevenueStream(mapping.streamId);
        if (stream) {
          result.push({
            ...mapping,
            stream
          });
        }
      }
    }
    
    return result;
  }
  
  async getDriverStreamMappingsByStreamId(streamId: number): Promise<(RevenueDriverToStream & { driver: RevenueDriver })[]> {
    const allMappings = Array.from(this.driverStreamMappings.values());
    const result: (RevenueDriverToStream & { driver: RevenueDriver })[] = [];
    
    for (const mapping of allMappings) {
      if (mapping.streamId === streamId) {
        const driver = await this.getRevenueDriver(mapping.driverId);
        if (driver) {
          result.push({
            ...mapping,
            driver
          });
        }
      }
    }
    
    return result;
  }
  
  async createDriverStreamMapping(insertMapping: InsertRevenueDriverToStream): Promise<RevenueDriverToStream> {
    const id = this.currentDriverStreamMappingId++;
    const now = new Date();
    const mapping: RevenueDriverToStream = { ...insertMapping, id, createdAt: now, updatedAt: now };
    this.driverStreamMappings.set(id, mapping);
    return mapping;
  }
  
  async updateDriverStreamMapping(id: number, updateData: Partial<InsertRevenueDriverToStream>): Promise<RevenueDriverToStream | undefined> {
    const mapping = this.driverStreamMappings.get(id);
    if (!mapping) return undefined;
    
    const updatedMapping: RevenueDriverToStream = {
      ...mapping,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.driverStreamMappings.set(id, updatedMapping);
    return updatedMapping;
  }
  
  async deleteDriverStreamMapping(id: number): Promise<boolean> {
    return this.driverStreamMappings.delete(id);
  }
  
  // Expense methods
  async getExpensesByForecastId(forecastId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.forecastId === forecastId,
    );
  }
  
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const now = new Date();
    const expense: Expense = { ...insertExpense, id, createdAt: now, updatedAt: now };
    this.expenses.set(id, expense);
    return expense;
  }
  
  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = await this.getExpense(id);
    if (!expense) return undefined;
    
    const updatedExpense: Expense = {
      ...expense,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  // Department methods
  async getDepartmentsByForecastId(forecastId: number): Promise<Department[]> {
    return Array.from(this.departments.values()).filter(
      (department) => department.forecastId === forecastId,
    );
  }
  
  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }
  
  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = this.currentDepartmentId++;
    const now = new Date();
    const department: Department = { ...insertDepartment, id, createdAt: now, updatedAt: now };
    this.departments.set(id, department);
    return department;
  }
  
  async updateDepartment(id: number, updateData: Partial<InsertDepartment>): Promise<Department | undefined> {
    const department = await this.getDepartment(id);
    if (!department) return undefined;
    
    const updatedDepartment: Department = {
      ...department,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.departments.set(id, updatedDepartment);
    return updatedDepartment;
  }
  
  async deleteDepartment(id: number): Promise<boolean> {
    return this.departments.delete(id);
  }
  
  // Personnel Role methods
  async getPersonnelRolesByForecastId(forecastId: number): Promise<PersonnelRole[]> {
    return Array.from(this.personnelRoles.values()).filter(
      (role) => role.forecastId === forecastId,
    );
  }
  
  async getPersonnelRolesByDepartmentId(departmentId: number): Promise<PersonnelRole[]> {
    return Array.from(this.personnelRoles.values()).filter(
      (role) => role.departmentId === departmentId,
    );
  }
  
  async getPersonnelRole(id: number): Promise<PersonnelRole | undefined> {
    return this.personnelRoles.get(id);
  }
  
  async createPersonnelRole(insertRole: InsertPersonnelRole): Promise<PersonnelRole> {
    const id = this.currentPersonnelRoleId++;
    const now = new Date();
    const role: PersonnelRole = { ...insertRole, id, createdAt: now, updatedAt: now };
    this.personnelRoles.set(id, role);
    return role;
  }
  
  async updatePersonnelRole(id: number, updateData: Partial<InsertPersonnelRole>): Promise<PersonnelRole | undefined> {
    const role = await this.getPersonnelRole(id);
    if (!role) return undefined;
    
    const updatedRole: PersonnelRole = {
      ...role,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.personnelRoles.set(id, updatedRole);
    return updatedRole;
  }
  
  async deletePersonnelRole(id: number): Promise<boolean> {
    return this.personnelRoles.delete(id);
  }
  
  // Custom Formula methods
  async getCustomFormulasByForecastId(forecastId: number): Promise<CustomFormula[]> {
    return Array.from(this.customFormulas.values()).filter(
      (formula) => formula.forecastId === forecastId,
    );
  }
  
  async getCustomFormula(id: number): Promise<CustomFormula | undefined> {
    return this.customFormulas.get(id);
  }
  
  async createCustomFormula(insertFormula: InsertCustomFormula): Promise<CustomFormula> {
    const id = this.currentCustomFormulaId++;
    const now = new Date();
    const formula: CustomFormula = { ...insertFormula, id, createdAt: now, updatedAt: now };
    this.customFormulas.set(id, formula);
    return formula;
  }
  
  async updateCustomFormula(id: number, updateData: Partial<InsertCustomFormula>): Promise<CustomFormula | undefined> {
    const formula = await this.getCustomFormula(id);
    if (!formula) return undefined;
    
    const updatedFormula: CustomFormula = {
      ...formula,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.customFormulas.set(id, updatedFormula);
    return updatedFormula;
  }
  
  async deleteCustomFormula(id: number): Promise<boolean> {
    return this.customFormulas.delete(id);
  }
  
  // QuickBooks Integration methods
  async getQuickbooksIntegrationByUserId(userId: number): Promise<QuickbooksIntegration | undefined> {
    return Array.from(this.quickbooksIntegrations.values()).find(
      (integration) => integration.userId === userId,
    );
  }
  
  async createQuickbooksIntegration(insertIntegration: InsertQuickbooksIntegration): Promise<QuickbooksIntegration> {
    const id = this.currentQuickbooksIntegrationId++;
    const now = new Date();
    const integration: QuickbooksIntegration = { ...insertIntegration, id, createdAt: now, updatedAt: now };
    this.quickbooksIntegrations.set(id, integration);
    return integration;
  }
  
  async updateQuickbooksIntegration(userId: number, updateData: Partial<InsertQuickbooksIntegration>): Promise<QuickbooksIntegration | undefined> {
    const integration = await this.getQuickbooksIntegrationByUserId(userId);
    if (!integration) return undefined;
    
    const updatedIntegration: QuickbooksIntegration = {
      ...integration,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.quickbooksIntegrations.set(integration.id, updatedIntegration);
    return updatedIntegration;
  }
  
  async deleteQuickbooksIntegration(userId: number): Promise<boolean> {
    const integration = await this.getQuickbooksIntegrationByUserId(userId);
    if (!integration) return false;
    
    return this.quickbooksIntegrations.delete(integration.id);
  }
  
  // Financial Projection methods
  async getFinancialProjectionsByForecastId(forecastId: number): Promise<FinancialProjection[]> {
    return Array.from(this.financialProjections.values()).filter(
      (projection) => projection.forecastId === forecastId,
    );
  }
  
  async getFinancialProjection(id: number): Promise<FinancialProjection | undefined> {
    return this.financialProjections.get(id);
  }
  
  async createFinancialProjection(insertProjection: InsertFinancialProjection): Promise<FinancialProjection> {
    const id = this.currentFinancialProjectionId++;
    const now = new Date();
    const projection: FinancialProjection = { ...insertProjection, id, createdAt: now, updatedAt: now };
    this.financialProjections.set(id, projection);
    return projection;
  }
  
  async updateFinancialProjection(id: number, updateData: Partial<InsertFinancialProjection>): Promise<FinancialProjection | undefined> {
    const projection = await this.getFinancialProjection(id);
    if (!projection) return undefined;
    
    const updatedProjection: FinancialProjection = {
      ...projection,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.financialProjections.set(id, updatedProjection);
    return updatedProjection;
  }
  
  async deleteFinancialProjection(id: number): Promise<boolean> {
    return this.financialProjections.delete(id);
  }
}

export const storage = new MemStorage();
