import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertWorkspaceSchema,
  insertRevenueStreamSchema,
  insertRevenueProjectionSchema,
  insertExpenseCategorySchema,
  insertExpenseProjectionSchema,
  insertPersonnelRoleSchema,
  insertPersonnelProjectionSchema,
  insertFormulaSchema,
  insertScenarioSchema,
  insertQuickbooksIntegrationSchema,
  insertTransactionSchema,
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const authenticateUser = async (req: Request, res: Response, next: Function) => {
    // In a real app, this would validate a session/token
    // For the MVP, we'll just use a simple authentication
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(401).json({ message: 'Invalid user' });
      }
      
      // Add user to request object
      (req as any).user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error during authentication' });
    }
  };

  // Error handler for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Unexpected error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  };

  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingByUsername = await storage.getUserByUsername(userData.username);
      if (existingByUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingByEmail = await storage.getUserByEmail(userData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // In a real app, we'd create a proper session
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  // Workspace routes
  app.get('/api/workspaces', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const workspaces = await storage.getWorkspacesByOwnerId(user.id);
      res.status(200).json(workspaces);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces', authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const workspaceData = insertWorkspaceSchema.parse({
        ...req.body,
        ownerId: user.id
      });
      
      const workspace = await storage.createWorkspace(workspaceData);
      res.status(201).json(workspace);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get('/api/workspaces/:id', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      res.status(200).json(workspace);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Revenue Stream routes
  app.get('/api/workspaces/:workspaceId/revenue-streams', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const streams = await storage.getRevenueStreamsByWorkspaceId(workspaceId);
      res.status(200).json(streams);
    } catch (error) {
      console.error('Error fetching revenue streams:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/revenue-streams', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const streamData = insertRevenueStreamSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const stream = await storage.createRevenueStream(streamData);
      res.status(201).json(stream);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Revenue Projection routes
  app.get('/api/workspaces/:workspaceId/revenue-projections', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const month = req.query.month as string | undefined;
      
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const projections = await storage.getRevenueProjectionsByWorkspaceId(workspaceId, month);
      res.status(200).json(projections);
    } catch (error) {
      console.error('Error fetching revenue projections:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/revenue-projections', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const projectionData = insertRevenueProjectionSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const projection = await storage.createRevenueProjection(projectionData);
      res.status(201).json(projection);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Expense Category routes
  app.get('/api/workspaces/:workspaceId/expense-categories', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const categories = await storage.getExpenseCategoriesByWorkspaceId(workspaceId);
      res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/expense-categories', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const categoryData = insertExpenseCategorySchema.parse({
        ...req.body,
        workspaceId
      });
      
      const category = await storage.createExpenseCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Expense Projection routes
  app.get('/api/workspaces/:workspaceId/expense-projections', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const month = req.query.month as string | undefined;
      
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const projections = await storage.getExpenseProjectionsByWorkspaceId(workspaceId, month);
      res.status(200).json(projections);
    } catch (error) {
      console.error('Error fetching expense projections:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/expense-projections', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const projectionData = insertExpenseProjectionSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const projection = await storage.createExpenseProjection(projectionData);
      res.status(201).json(projection);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Personnel Role routes
  app.get('/api/workspaces/:workspaceId/personnel-roles', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const roles = await storage.getPersonnelRolesByWorkspaceId(workspaceId);
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error fetching personnel roles:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/personnel-roles', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const roleData = insertPersonnelRoleSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const role = await storage.createPersonnelRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Personnel Projection routes
  app.get('/api/workspaces/:workspaceId/personnel-projections', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const month = req.query.month as string | undefined;
      
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const projections = await storage.getPersonnelProjectionsByWorkspaceId(workspaceId, month);
      res.status(200).json(projections);
    } catch (error) {
      console.error('Error fetching personnel projections:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/personnel-projections', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const projectionData = insertPersonnelProjectionSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const projection = await storage.createPersonnelProjection(projectionData);
      res.status(201).json(projection);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Formula routes
  app.get('/api/workspaces/:workspaceId/formulas', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const formulas = await storage.getFormulasByWorkspaceId(workspaceId);
      res.status(200).json(formulas);
    } catch (error) {
      console.error('Error fetching formulas:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/formulas', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const formulaData = insertFormulaSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const formula = await storage.createFormula(formulaData);
      res.status(201).json(formula);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Scenario routes
  app.get('/api/workspaces/:workspaceId/scenarios', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const scenarios = await storage.getScenariosByWorkspaceId(workspaceId);
      res.status(200).json(scenarios);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/scenarios', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const scenarioData = insertScenarioSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const scenario = await storage.createScenario(scenarioData);
      res.status(201).json(scenario);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.post('/api/workspaces/:workspaceId/scenarios/:id/activate', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const scenarioId = parseInt(req.params.id);
      
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const success = await storage.setActiveScenario(scenarioId, workspaceId);
      
      if (!success) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      res.status(200).json({ message: 'Scenario activated successfully' });
    } catch (error) {
      console.error('Error activating scenario:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // QuickBooks Integration routes
  app.get('/api/workspaces/:workspaceId/quickbooks', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const integration = await storage.getQuickbooksIntegration(workspaceId);
      
      if (!integration) {
        return res.status(404).json({ message: 'QuickBooks integration not found' });
      }
      
      // Don't return sensitive data
      const { accessToken, refreshToken, ...safeData } = integration;
      res.status(200).json(safeData);
    } catch (error) {
      console.error('Error fetching QuickBooks integration:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/quickbooks', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const integrationData = insertQuickbooksIntegrationSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const integration = await storage.createOrUpdateQuickbooksIntegration(integrationData);
      
      // Don't return sensitive data
      const { accessToken, refreshToken, ...safeData } = integration;
      res.status(201).json(safeData);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.post('/api/workspaces/:workspaceId/quickbooks/disconnect', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const success = await storage.disconnectQuickbooksIntegration(workspaceId);
      
      if (!success) {
        return res.status(404).json({ message: 'QuickBooks integration not found' });
      }
      
      res.status(200).json({ message: 'QuickBooks integration disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting QuickBooks integration:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Transaction routes
  app.get('/api/workspaces/:workspaceId/transactions', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const transactions = await storage.getTransactionsByWorkspaceId(workspaceId, limit);
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/workspaces/:workspaceId/transactions', authenticateUser, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      const workspace = await storage.getWorkspace(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Verify ownership
      const user = (req as any).user;
      if (workspace.ownerId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this workspace' });
      }
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        workspaceId
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
