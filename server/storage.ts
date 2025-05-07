import {
  User, InsertUser,
  Workspace, InsertWorkspace,
  RevenueStream, InsertRevenueStream,
  RevenueProjection, InsertRevenueProjection,
  ExpenseCategory, InsertExpenseCategory,
  ExpenseProjection, InsertExpenseProjection,
  PersonnelRole, InsertPersonnelRole,
  PersonnelProjection, InsertPersonnelProjection,
  Formula, InsertFormula,
  Scenario, InsertScenario,
  QuickbooksIntegration, InsertQuickbooksIntegration,
  Transaction, InsertTransaction
} from "@shared/schema";

// Define storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Workspaces
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspacesByOwnerId(ownerId: number): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: number, workspace: Partial<InsertWorkspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;

  // Revenue Streams
  getRevenueStream(id: number): Promise<RevenueStream | undefined>;
  getRevenueStreamsByWorkspaceId(workspaceId: number): Promise<RevenueStream[]>;
  createRevenueStream(stream: InsertRevenueStream): Promise<RevenueStream>;
  updateRevenueStream(id: number, stream: Partial<InsertRevenueStream>): Promise<RevenueStream | undefined>;
  deleteRevenueStream(id: number): Promise<boolean>;

  // Revenue Projections
  getRevenueProjection(id: number): Promise<RevenueProjection | undefined>;
  getRevenueProjectionsByStreamId(streamId: number): Promise<RevenueProjection[]>;
  getRevenueProjectionsByWorkspaceId(workspaceId: number, month?: string): Promise<RevenueProjection[]>;
  createRevenueProjection(projection: InsertRevenueProjection): Promise<RevenueProjection>;
  updateRevenueProjection(id: number, projection: Partial<InsertRevenueProjection>): Promise<RevenueProjection | undefined>;
  deleteRevenueProjection(id: number): Promise<boolean>;

  // Expense Categories
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  getExpenseCategoriesByWorkspaceId(workspaceId: number): Promise<ExpenseCategory[]>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined>;
  deleteExpenseCategory(id: number): Promise<boolean>;

  // Expense Projections
  getExpenseProjection(id: number): Promise<ExpenseProjection | undefined>;
  getExpenseProjectionsByCategoryId(categoryId: number): Promise<ExpenseProjection[]>;
  getExpenseProjectionsByWorkspaceId(workspaceId: number, month?: string): Promise<ExpenseProjection[]>;
  createExpenseProjection(projection: InsertExpenseProjection): Promise<ExpenseProjection>;
  updateExpenseProjection(id: number, projection: Partial<InsertExpenseProjection>): Promise<ExpenseProjection | undefined>;
  deleteExpenseProjection(id: number): Promise<boolean>;

  // Personnel Roles
  getPersonnelRole(id: number): Promise<PersonnelRole | undefined>;
  getPersonnelRolesByWorkspaceId(workspaceId: number): Promise<PersonnelRole[]>;
  createPersonnelRole(role: InsertPersonnelRole): Promise<PersonnelRole>;
  updatePersonnelRole(id: number, role: Partial<InsertPersonnelRole>): Promise<PersonnelRole | undefined>;
  deletePersonnelRole(id: number): Promise<boolean>;

  // Personnel Projections
  getPersonnelProjection(id: number): Promise<PersonnelProjection | undefined>;
  getPersonnelProjectionsByRoleId(roleId: number): Promise<PersonnelProjection[]>;
  getPersonnelProjectionsByWorkspaceId(workspaceId: number, month?: string): Promise<PersonnelProjection[]>;
  createPersonnelProjection(projection: InsertPersonnelProjection): Promise<PersonnelProjection>;
  updatePersonnelProjection(id: number, projection: Partial<InsertPersonnelProjection>): Promise<PersonnelProjection | undefined>;
  deletePersonnelProjection(id: number): Promise<boolean>;

  // Formulas
  getFormula(id: number): Promise<Formula | undefined>;
  getFormulasByWorkspaceId(workspaceId: number): Promise<Formula[]>;
  createFormula(formula: InsertFormula): Promise<Formula>;
  updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined>;
  deleteFormula(id: number): Promise<boolean>;

  // Scenarios
  getScenario(id: number): Promise<Scenario | undefined>;
  getScenariosByWorkspaceId(workspaceId: number): Promise<Scenario[]>;
  getActiveScenarioByWorkspaceId(workspaceId: number): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  updateScenario(id: number, scenario: Partial<InsertScenario>): Promise<Scenario | undefined>;
  deleteScenario(id: number): Promise<boolean>;
  setActiveScenario(id: number, workspaceId: number): Promise<boolean>;

  // QuickBooks Integration
  getQuickbooksIntegration(workspaceId: number): Promise<QuickbooksIntegration | undefined>;
  createOrUpdateQuickbooksIntegration(integration: InsertQuickbooksIntegration): Promise<QuickbooksIntegration>;
  disconnectQuickbooksIntegration(workspaceId: number): Promise<boolean>;

  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByWorkspaceId(workspaceId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workspaces: Map<number, Workspace>;
  private revenueStreams: Map<number, RevenueStream>;
  private revenueProjections: Map<number, RevenueProjection>;
  private expenseCategories: Map<number, ExpenseCategory>;
  private expenseProjections: Map<number, ExpenseProjection>;
  private personnelRoles: Map<number, PersonnelRole>;
  private personnelProjections: Map<number, PersonnelProjection>;
  private formulas: Map<number, Formula>;
  private scenarios: Map<number, Scenario>;
  private quickbooksIntegrations: Map<number, QuickbooksIntegration>;
  private transactions: Map<number, Transaction>;

  private userIdCounter: number;
  private workspaceIdCounter: number;
  private revenueStreamIdCounter: number;
  private revenueProjectionIdCounter: number;
  private expenseCategoryIdCounter: number;
  private expenseProjectionIdCounter: number;
  private personnelRoleIdCounter: number;
  private personnelProjectionIdCounter: number;
  private formulaIdCounter: number;
  private scenarioIdCounter: number;
  private quickbooksIntegrationIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.revenueStreams = new Map();
    this.revenueProjections = new Map();
    this.expenseCategories = new Map();
    this.expenseProjections = new Map();
    this.personnelRoles = new Map();
    this.personnelProjections = new Map();
    this.formulas = new Map();
    this.scenarios = new Map();
    this.quickbooksIntegrations = new Map();
    this.transactions = new Map();

    this.userIdCounter = 1;
    this.workspaceIdCounter = 1;
    this.revenueStreamIdCounter = 1;
    this.revenueProjectionIdCounter = 1;
    this.expenseCategoryIdCounter = 1;
    this.expenseProjectionIdCounter = 1;
    this.personnelRoleIdCounter = 1;
    this.personnelProjectionIdCounter = 1;
    this.formulaIdCounter = 1;
    this.scenarioIdCounter = 1;
    this.quickbooksIntegrationIdCounter = 1;
    this.transactionIdCounter = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  // Initialize demo data for the application
  private initializeDemoData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "demo123", // In a real app, this would be hashed
      email: "demo@example.com",
      fullName: "John Smith",
      companyName: "Startup Inc."
    };
    this.createUser(demoUser);

    // Create a workspace
    const demoWorkspace: InsertWorkspace = {
      name: "Startup Growth Plan",
      description: "Financial planning for our startup",
      ownerId: 1
    };
    this.createWorkspace(demoWorkspace);

    // Create revenue streams
    const revenueStreams = [
      { name: "Basic Subscription", type: "subscription", description: "Monthly basic tier", workspaceId: 1 },
      { name: "Premium Tier", type: "subscription", description: "Monthly premium tier", workspaceId: 1 },
      { name: "Enterprise Plans", type: "subscription", description: "Annual enterprise contracts", workspaceId: 1 },
      { name: "One-time Services", type: "one-time", description: "Implementation and consulting", workspaceId: 1 }
    ];

    revenueStreams.forEach(stream => {
      this.createRevenueStream(stream as InsertRevenueStream);
    });

    // Create expense categories
    const expenseCategories = [
      { name: "Personnel", description: "Salaries and benefits", workspaceId: 1 },
      { name: "Marketing", description: "Advertising and promotions", workspaceId: 1 },
      { name: "Software & Tools", description: "SaaS and tools", workspaceId: 1 },
      { name: "Office & Operations", description: "Rent and utilities", workspaceId: 1 }
    ];

    expenseCategories.forEach(category => {
      this.createExpenseCategory(category as InsertExpenseCategory);
    });

    // Create personnel roles
    const personnelRoles = [
      { title: "Software Engineer", department: "Engineering", baseSalary: 120000, benefits: 24000, taxes: 18000, workspaceId: 1 },
      { title: "Product Manager", department: "Product", baseSalary: 130000, benefits: 26000, taxes: 19500, workspaceId: 1 },
      { title: "Sales Representative", department: "Sales", baseSalary: 100000, benefits: 20000, taxes: 15000, workspaceId: 1 },
      { title: "Marketing Specialist", department: "Marketing", baseSalary: 90000, benefits: 18000, taxes: 13500, workspaceId: 1 }
    ];

    personnelRoles.forEach(role => {
      this.createPersonnelRole(role as InsertPersonnelRole);
    });

    // Create scenarios
    const scenarios = [
      { name: "Base Scenario", description: "Current plan", isActive: true, workspaceId: 1, assumptions: { mrrGrowth: 10, burnRate: 42000, runway: 14.2 } },
      { name: "Optimistic Growth", description: "Product-market fit", isActive: false, workspaceId: 1, assumptions: { mrrGrowth: 18, burnRate: 52000, runway: 11.9 } }
    ];

    scenarios.forEach(scenario => {
      this.createScenario(scenario as InsertScenario);
    });

    // Create formula
    const formula: InsertFormula = {
      name: "Customer Acquisition Cost",
      description: "Marketing spend divided by new customers",
      formula: "[Marketing.Total] / [Revenue.NewCustomers]",
      variables: { "Marketing.Total": "Marketing expenses total", "Revenue.NewCustomers": "Number of new customers" },
      workspaceId: 1
    };
    this.createFormula(formula);

    // Create QuickBooks integration
    const qbIntegration: InsertQuickbooksIntegration = {
      workspaceId: 1,
      isConnected: true,
      realmId: "123456789",
      accessToken: "sample-access-token",
      refreshToken: "sample-refresh-token",
      lastSynced: new Date()
    };
    this.createOrUpdateQuickbooksIntegration(qbIntegration);

    // Create some transactions
    const transactions = [
      { workspaceId: 1, date: new Date(), description: "Adobe Creative Cloud", amount: 52.99, category: "Software", type: "expense", externalId: "qb-123" },
      { workspaceId: 1, date: new Date(), description: "Customer Payment #10045", amount: 49.00, category: "Basic Plan", type: "income", externalId: "qb-124" },
      { workspaceId: 1, date: new Date(), description: "AWS Cloud Services", amount: 342.18, category: "Infrastructure", type: "expense", externalId: "qb-125" },
      { workspaceId: 1, date: new Date(), description: "Enterprise Client #E-224", amount: 4800.00, category: "Enterprise Plans", type: "income", externalId: "qb-126" }
    ];

    transactions.forEach(transaction => {
      this.createTransaction(transaction as InsertTransaction);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }

  async getWorkspacesByOwnerId(ownerId: number): Promise<Workspace[]> {
    return Array.from(this.workspaces.values()).filter(workspace => workspace.ownerId === ownerId);
  }

  async createWorkspace(insertWorkspace: InsertWorkspace): Promise<Workspace> {
    const id = this.workspaceIdCounter++;
    const workspace: Workspace = { ...insertWorkspace, id, createdAt: new Date() };
    this.workspaces.set(id, workspace);
    return workspace;
  }

  async updateWorkspace(id: number, workspace: Partial<InsertWorkspace>): Promise<Workspace | undefined> {
    const existing = await this.getWorkspace(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...workspace };
    this.workspaces.set(id, updated);
    return updated;
  }

  async deleteWorkspace(id: number): Promise<boolean> {
    return this.workspaces.delete(id);
  }

  // Revenue Stream methods
  async getRevenueStream(id: number): Promise<RevenueStream | undefined> {
    return this.revenueStreams.get(id);
  }

  async getRevenueStreamsByWorkspaceId(workspaceId: number): Promise<RevenueStream[]> {
    return Array.from(this.revenueStreams.values()).filter(stream => stream.workspaceId === workspaceId);
  }

  async createRevenueStream(insertStream: InsertRevenueStream): Promise<RevenueStream> {
    const id = this.revenueStreamIdCounter++;
    const stream: RevenueStream = { ...insertStream, id, createdAt: new Date() };
    this.revenueStreams.set(id, stream);
    return stream;
  }

  async updateRevenueStream(id: number, stream: Partial<InsertRevenueStream>): Promise<RevenueStream | undefined> {
    const existing = await this.getRevenueStream(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...stream };
    this.revenueStreams.set(id, updated);
    return updated;
  }

  async deleteRevenueStream(id: number): Promise<boolean> {
    return this.revenueStreams.delete(id);
  }

  // Revenue Projection methods
  async getRevenueProjection(id: number): Promise<RevenueProjection | undefined> {
    return this.revenueProjections.get(id);
  }

  async getRevenueProjectionsByStreamId(streamId: number): Promise<RevenueProjection[]> {
    return Array.from(this.revenueProjections.values()).filter(projection => projection.streamId === streamId);
  }

  async getRevenueProjectionsByWorkspaceId(workspaceId: number, month?: string): Promise<RevenueProjection[]> {
    let projections = Array.from(this.revenueProjections.values()).filter(projection => projection.workspaceId === workspaceId);
    
    if (month) {
      projections = projections.filter(projection => projection.month === month);
    }
    
    return projections;
  }

  async createRevenueProjection(insertProjection: InsertRevenueProjection): Promise<RevenueProjection> {
    const id = this.revenueProjectionIdCounter++;
    const projection: RevenueProjection = { ...insertProjection, id, createdAt: new Date() };
    this.revenueProjections.set(id, projection);
    return projection;
  }

  async updateRevenueProjection(id: number, projection: Partial<InsertRevenueProjection>): Promise<RevenueProjection | undefined> {
    const existing = await this.getRevenueProjection(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...projection };
    this.revenueProjections.set(id, updated);
    return updated;
  }

  async deleteRevenueProjection(id: number): Promise<boolean> {
    return this.revenueProjections.delete(id);
  }

  // Expense Category methods
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    return this.expenseCategories.get(id);
  }

  async getExpenseCategoriesByWorkspaceId(workspaceId: number): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategories.values()).filter(category => category.workspaceId === workspaceId);
  }

  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = this.expenseCategoryIdCounter++;
    const category: ExpenseCategory = { ...insertCategory, id, createdAt: new Date() };
    this.expenseCategories.set(id, category);
    return category;
  }

  async updateExpenseCategory(id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const existing = await this.getExpenseCategory(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...category };
    this.expenseCategories.set(id, updated);
    return updated;
  }

  async deleteExpenseCategory(id: number): Promise<boolean> {
    return this.expenseCategories.delete(id);
  }

  // Expense Projection methods
  async getExpenseProjection(id: number): Promise<ExpenseProjection | undefined> {
    return this.expenseProjections.get(id);
  }

  async getExpenseProjectionsByCategoryId(categoryId: number): Promise<ExpenseProjection[]> {
    return Array.from(this.expenseProjections.values()).filter(projection => projection.categoryId === categoryId);
  }

  async getExpenseProjectionsByWorkspaceId(workspaceId: number, month?: string): Promise<ExpenseProjection[]> {
    let projections = Array.from(this.expenseProjections.values()).filter(projection => projection.workspaceId === workspaceId);
    
    if (month) {
      projections = projections.filter(projection => projection.month === month);
    }
    
    return projections;
  }

  async createExpenseProjection(insertProjection: InsertExpenseProjection): Promise<ExpenseProjection> {
    const id = this.expenseProjectionIdCounter++;
    const projection: ExpenseProjection = { ...insertProjection, id, createdAt: new Date() };
    this.expenseProjections.set(id, projection);
    return projection;
  }

  async updateExpenseProjection(id: number, projection: Partial<InsertExpenseProjection>): Promise<ExpenseProjection | undefined> {
    const existing = await this.getExpenseProjection(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...projection };
    this.expenseProjections.set(id, updated);
    return updated;
  }

  async deleteExpenseProjection(id: number): Promise<boolean> {
    return this.expenseProjections.delete(id);
  }

  // Personnel Role methods
  async getPersonnelRole(id: number): Promise<PersonnelRole | undefined> {
    return this.personnelRoles.get(id);
  }

  async getPersonnelRolesByWorkspaceId(workspaceId: number): Promise<PersonnelRole[]> {
    return Array.from(this.personnelRoles.values()).filter(role => role.workspaceId === workspaceId);
  }

  async createPersonnelRole(insertRole: InsertPersonnelRole): Promise<PersonnelRole> {
    const id = this.personnelRoleIdCounter++;
    const role: PersonnelRole = { ...insertRole, id, createdAt: new Date() };
    this.personnelRoles.set(id, role);
    return role;
  }

  async updatePersonnelRole(id: number, role: Partial<InsertPersonnelRole>): Promise<PersonnelRole | undefined> {
    const existing = await this.getPersonnelRole(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...role };
    this.personnelRoles.set(id, updated);
    return updated;
  }

  async deletePersonnelRole(id: number): Promise<boolean> {
    return this.personnelRoles.delete(id);
  }

  // Personnel Projection methods
  async getPersonnelProjection(id: number): Promise<PersonnelProjection | undefined> {
    return this.personnelProjections.get(id);
  }

  async getPersonnelProjectionsByRoleId(roleId: number): Promise<PersonnelProjection[]> {
    return Array.from(this.personnelProjections.values()).filter(projection => projection.roleId === roleId);
  }

  async getPersonnelProjectionsByWorkspaceId(workspaceId: number, month?: string): Promise<PersonnelProjection[]> {
    let projections = Array.from(this.personnelProjections.values()).filter(projection => projection.workspaceId === workspaceId);
    
    if (month) {
      projections = projections.filter(projection => projection.month === month);
    }
    
    return projections;
  }

  async createPersonnelProjection(insertProjection: InsertPersonnelProjection): Promise<PersonnelProjection> {
    const id = this.personnelProjectionIdCounter++;
    const projection: PersonnelProjection = { ...insertProjection, id, createdAt: new Date() };
    this.personnelProjections.set(id, projection);
    return projection;
  }

  async updatePersonnelProjection(id: number, projection: Partial<InsertPersonnelProjection>): Promise<PersonnelProjection | undefined> {
    const existing = await this.getPersonnelProjection(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...projection };
    this.personnelProjections.set(id, updated);
    return updated;
  }

  async deletePersonnelProjection(id: number): Promise<boolean> {
    return this.personnelProjections.delete(id);
  }

  // Formula methods
  async getFormula(id: number): Promise<Formula | undefined> {
    return this.formulas.get(id);
  }

  async getFormulasByWorkspaceId(workspaceId: number): Promise<Formula[]> {
    return Array.from(this.formulas.values()).filter(formula => formula.workspaceId === workspaceId);
  }

  async createFormula(insertFormula: InsertFormula): Promise<Formula> {
    const id = this.formulaIdCounter++;
    const formula: Formula = { ...insertFormula, id, createdAt: new Date() };
    this.formulas.set(id, formula);
    return formula;
  }

  async updateFormula(id: number, formula: Partial<InsertFormula>): Promise<Formula | undefined> {
    const existing = await this.getFormula(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...formula };
    this.formulas.set(id, updated);
    return updated;
  }

  async deleteFormula(id: number): Promise<boolean> {
    return this.formulas.delete(id);
  }

  // Scenario methods
  async getScenario(id: number): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async getScenariosByWorkspaceId(workspaceId: number): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(scenario => scenario.workspaceId === workspaceId);
  }

  async getActiveScenarioByWorkspaceId(workspaceId: number): Promise<Scenario | undefined> {
    return Array.from(this.scenarios.values()).find(scenario => scenario.workspaceId === workspaceId && scenario.isActive);
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const id = this.scenarioIdCounter++;
    const scenario: Scenario = { ...insertScenario, id, createdAt: new Date() };
    
    // If this is the first scenario or marked as active, ensure others are inactive
    if (scenario.isActive) {
      await this.deactivateAllScenarios(scenario.workspaceId);
    }
    
    this.scenarios.set(id, scenario);
    return scenario;
  }

  async updateScenario(id: number, scenario: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const existing = await this.getScenario(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...scenario };
    
    // If setting to active, deactivate others
    if (scenario.isActive && scenario.isActive !== existing.isActive) {
      await this.deactivateAllScenarios(existing.workspaceId);
    }
    
    this.scenarios.set(id, updated);
    return updated;
  }

  async deleteScenario(id: number): Promise<boolean> {
    return this.scenarios.delete(id);
  }

  async setActiveScenario(id: number, workspaceId: number): Promise<boolean> {
    const scenario = await this.getScenario(id);
    if (!scenario || scenario.workspaceId !== workspaceId) return false;
    
    await this.deactivateAllScenarios(workspaceId);
    
    scenario.isActive = true;
    this.scenarios.set(id, scenario);
    return true;
  }

  private async deactivateAllScenarios(workspaceId: number): Promise<void> {
    const scenarios = await this.getScenariosByWorkspaceId(workspaceId);
    scenarios.forEach(scenario => {
      scenario.isActive = false;
      this.scenarios.set(scenario.id, scenario);
    });
  }

  // QuickBooks Integration methods
  async getQuickbooksIntegration(workspaceId: number): Promise<QuickbooksIntegration | undefined> {
    return Array.from(this.quickbooksIntegrations.values()).find(integration => integration.workspaceId === workspaceId);
  }

  async createOrUpdateQuickbooksIntegration(insertIntegration: InsertQuickbooksIntegration): Promise<QuickbooksIntegration> {
    const existing = await this.getQuickbooksIntegration(insertIntegration.workspaceId);
    
    if (existing) {
      const updated = { ...existing, ...insertIntegration };
      this.quickbooksIntegrations.set(existing.id, updated);
      return updated;
    } else {
      const id = this.quickbooksIntegrationIdCounter++;
      const integration: QuickbooksIntegration = { ...insertIntegration, id, createdAt: new Date() };
      this.quickbooksIntegrations.set(id, integration);
      return integration;
    }
  }

  async disconnectQuickbooksIntegration(workspaceId: number): Promise<boolean> {
    const integration = await this.getQuickbooksIntegration(workspaceId);
    if (!integration) return false;
    
    integration.isConnected = false;
    integration.accessToken = undefined;
    integration.refreshToken = undefined;
    
    this.quickbooksIntegrations.set(integration.id, integration);
    return true;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByWorkspaceId(workspaceId: number, limit?: number): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values())
      .filter(transaction => transaction.workspaceId === workspaceId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date desc
    
    if (limit) {
      transactions = transactions.slice(0, limit);
    }
    
    return transactions;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = { ...insertTransaction, id, createdAt: new Date() };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
}

export const storage = new MemStorage();
