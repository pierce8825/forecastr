import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertForecastSchema, 
  insertRevenueDriverSchema, 
  insertRevenueStreamSchema,
  insertRevenueDriverToStreamSchema,
  insertExpenseSchema,
  insertDepartmentSchema,
  insertPersonnelRoleSchema,
  insertCustomFormulaSchema,
  insertPuzzleIntegrationSchema,
  insertFinancialProjectionSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import puzzleRouter from "./routes/puzzle";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for validation errors
  const handleValidationError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        message: validationError.message,
        errors: err.errors
      });
    }
    
    console.error('Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  };

  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Check if email exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password in the response
    const { password, ...userData } = user;
    return res.json(userData);
  });
  
  // Forecast routes
  app.get('/api/forecasts', async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const forecasts = await storage.getForecastsByUserId(userId);
    return res.json(forecasts);
  });
  
  app.get('/api/forecasts/:id', async (req: Request, res: Response) => {
    const forecastId = parseInt(req.params.id);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const forecast = await storage.getForecast(forecastId);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    return res.json(forecast);
  });
  
  app.post('/api/forecasts', async (req: Request, res: Response) => {
    try {
      const forecastData = insertForecastSchema.parse(req.body);
      const forecast = await storage.createForecast(forecastData);
      return res.status(201).json(forecast);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/forecasts/:id', async (req: Request, res: Response) => {
    try {
      const forecastId = parseInt(req.params.id);
      if (isNaN(forecastId)) {
        return res.status(400).json({ message: 'Invalid forecast ID' });
      }
      
      const forecastData = insertForecastSchema.partial().parse(req.body);
      const updatedForecast = await storage.updateForecast(forecastId, forecastData);
      
      if (!updatedForecast) {
        return res.status(404).json({ message: 'Forecast not found' });
      }
      
      return res.json(updatedForecast);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/forecasts/:id', async (req: Request, res: Response) => {
    const forecastId = parseInt(req.params.id);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const success = await storage.deleteForecast(forecastId);
    if (!success) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    return res.status(204).end();
  });
  
  // Revenue Driver routes
  app.get('/api/revenue-drivers', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const drivers = await storage.getRevenueDriversByForecastId(forecastId);
    return res.json(drivers);
  });
  
  app.get('/api/revenue-drivers/:id', async (req: Request, res: Response) => {
    const driverId = parseInt(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: 'Invalid driver ID' });
    }
    
    const driver = await storage.getRevenueDriver(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Revenue driver not found' });
    }
    
    return res.json(driver);
  });
  
  app.post('/api/revenue-drivers', async (req: Request, res: Response) => {
    try {
      const driverData = insertRevenueDriverSchema.parse(req.body);
      const driver = await storage.createRevenueDriver(driverData);
      return res.status(201).json(driver);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/revenue-drivers/:id', async (req: Request, res: Response) => {
    try {
      const driverId = parseInt(req.params.id);
      if (isNaN(driverId)) {
        return res.status(400).json({ message: 'Invalid driver ID' });
      }
      
      const driverData = insertRevenueDriverSchema.partial().parse(req.body);
      const updatedDriver = await storage.updateRevenueDriver(driverId, driverData);
      
      if (!updatedDriver) {
        return res.status(404).json({ message: 'Revenue driver not found' });
      }
      
      return res.json(updatedDriver);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/revenue-drivers/:id', async (req: Request, res: Response) => {
    const driverId = parseInt(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: 'Invalid driver ID' });
    }
    
    const success = await storage.deleteRevenueDriver(driverId);
    if (!success) {
      return res.status(404).json({ message: 'Revenue driver not found' });
    }
    
    return res.status(204).end();
  });
  
  // Revenue Stream routes
  app.get('/api/revenue-streams', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const streams = await storage.getRevenueStreamsByForecastId(forecastId);
    return res.json(streams);
  });
  
  app.get('/api/revenue-streams/:id', async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.id);
    if (isNaN(streamId)) {
      return res.status(400).json({ message: 'Invalid stream ID' });
    }
    
    const stream = await storage.getRevenueStream(streamId);
    if (!stream) {
      return res.status(404).json({ message: 'Revenue stream not found' });
    }
    
    return res.json(stream);
  });
  
  app.post('/api/revenue-streams', async (req: Request, res: Response) => {
    try {
      const streamData = insertRevenueStreamSchema.parse(req.body);
      const stream = await storage.createRevenueStream(streamData);
      return res.status(201).json(stream);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/revenue-streams/:id', async (req: Request, res: Response) => {
    try {
      const streamId = parseInt(req.params.id);
      if (isNaN(streamId)) {
        return res.status(400).json({ message: 'Invalid stream ID' });
      }
      
      const streamData = insertRevenueStreamSchema.partial().parse(req.body);
      const updatedStream = await storage.updateRevenueStream(streamId, streamData);
      
      if (!updatedStream) {
        return res.status(404).json({ message: 'Revenue stream not found' });
      }
      
      return res.json(updatedStream);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/revenue-streams/:id', async (req: Request, res: Response) => {
    const streamId = parseInt(req.params.id);
    if (isNaN(streamId)) {
      return res.status(400).json({ message: 'Invalid stream ID' });
    }
    
    const success = await storage.deleteRevenueStream(streamId);
    if (!success) {
      return res.status(404).json({ message: 'Revenue stream not found' });
    }
    
    return res.status(204).end();
  });
  
  // Revenue Driver to Stream Mapping routes
  app.get('/api/driver-stream-mappings', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    const driverId = Number(req.query.driverId);
    const streamId = Number(req.query.streamId);
    
    if (forecastId && !isNaN(forecastId)) {
      const mappings = await storage.getDriverStreamMappingsByForecastId(forecastId);
      return res.json(mappings);
    } else if (driverId && !isNaN(driverId)) {
      const mappings = await storage.getDriverStreamMappingsByDriverId(driverId);
      return res.json(mappings);
    } else if (streamId && !isNaN(streamId)) {
      const mappings = await storage.getDriverStreamMappingsByStreamId(streamId);
      return res.json(mappings);
    } else {
      return res.status(400).json({ message: 'Invalid or missing forecast ID, driver ID, or stream ID' });
    }
  });
  
  app.post('/api/driver-stream-mappings', async (req: Request, res: Response) => {
    try {
      const mappingData = insertRevenueDriverToStreamSchema.parse(req.body);
      const mapping = await storage.createDriverStreamMapping(mappingData);
      return res.status(201).json(mapping);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/driver-stream-mappings/:id', async (req: Request, res: Response) => {
    try {
      const mappingId = parseInt(req.params.id);
      if (isNaN(mappingId)) {
        return res.status(400).json({ message: 'Invalid mapping ID' });
      }
      
      const mappingData = insertRevenueDriverToStreamSchema.partial().parse(req.body);
      const updatedMapping = await storage.updateDriverStreamMapping(mappingId, mappingData);
      
      if (!updatedMapping) {
        return res.status(404).json({ message: 'Driver-stream mapping not found' });
      }
      
      return res.json(updatedMapping);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/driver-stream-mappings/:id', async (req: Request, res: Response) => {
    const mappingId = parseInt(req.params.id);
    if (isNaN(mappingId)) {
      return res.status(400).json({ message: 'Invalid mapping ID' });
    }
    
    const success = await storage.deleteDriverStreamMapping(mappingId);
    if (!success) {
      return res.status(404).json({ message: 'Driver-stream mapping not found' });
    }
    
    return res.status(204).end();
  });
  
  // Expense routes
  app.get('/api/expenses', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const expenses = await storage.getExpensesByForecastId(forecastId);
    return res.json(expenses);
  });
  
  app.get('/api/expenses/:id', async (req: Request, res: Response) => {
    const expenseId = parseInt(req.params.id);
    if (isNaN(expenseId)) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }
    
    const expense = await storage.getExpense(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    return res.json(expense);
  });
  
  app.post('/api/expenses', async (req: Request, res: Response) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      return res.status(201).json(expense);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const expenseId = parseInt(req.params.id);
      if (isNaN(expenseId)) {
        return res.status(400).json({ message: 'Invalid expense ID' });
      }
      
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateExpense(expenseId, expenseData);
      
      if (!updatedExpense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      return res.json(updatedExpense);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
    const expenseId = parseInt(req.params.id);
    if (isNaN(expenseId)) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }
    
    const success = await storage.deleteExpense(expenseId);
    if (!success) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    return res.status(204).end();
  });
  
  // Department routes
  app.get('/api/departments', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const departments = await storage.getDepartmentsByForecastId(forecastId);
    return res.json(departments);
  });
  
  app.get('/api/departments/:id', async (req: Request, res: Response) => {
    const departmentId = parseInt(req.params.id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }
    
    const department = await storage.getDepartment(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    return res.json(department);
  });
  
  app.post('/api/departments', async (req: Request, res: Response) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      return res.status(201).json(department);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.id);
      if (isNaN(departmentId)) {
        return res.status(400).json({ message: 'Invalid department ID' });
      }
      
      const departmentData = insertDepartmentSchema.partial().parse(req.body);
      const updatedDepartment = await storage.updateDepartment(departmentId, departmentData);
      
      if (!updatedDepartment) {
        return res.status(404).json({ message: 'Department not found' });
      }
      
      return res.json(updatedDepartment);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/departments/:id', async (req: Request, res: Response) => {
    const departmentId = parseInt(req.params.id);
    if (isNaN(departmentId)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }
    
    const success = await storage.deleteDepartment(departmentId);
    if (!success) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    return res.status(204).end();
  });
  
  // Personnel Role routes
  app.get('/api/personnel-roles', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    const departmentId = Number(req.query.departmentId);
    
    if (forecastId && !isNaN(forecastId)) {
      const roles = await storage.getPersonnelRolesByForecastId(forecastId);
      return res.json(roles);
    } else if (departmentId && !isNaN(departmentId)) {
      const roles = await storage.getPersonnelRolesByDepartmentId(departmentId);
      return res.json(roles);
    } else {
      return res.status(400).json({ message: 'Invalid or missing forecast ID or department ID' });
    }
  });
  
  app.get('/api/personnel-roles/:id', async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }
    
    const role = await storage.getPersonnelRole(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Personnel role not found' });
    }
    
    return res.json(role);
  });
  
  app.post('/api/personnel-roles', async (req: Request, res: Response) => {
    try {
      const roleData = insertPersonnelRoleSchema.parse(req.body);
      const role = await storage.createPersonnelRole(roleData);
      return res.status(201).json(role);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/personnel-roles/:id', async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
      
      const roleData = insertPersonnelRoleSchema.partial().parse(req.body);
      const updatedRole = await storage.updatePersonnelRole(roleId, roleData);
      
      if (!updatedRole) {
        return res.status(404).json({ message: 'Personnel role not found' });
      }
      
      return res.json(updatedRole);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/personnel-roles/:id', async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ message: 'Invalid role ID' });
    }
    
    const success = await storage.deletePersonnelRole(roleId);
    if (!success) {
      return res.status(404).json({ message: 'Personnel role not found' });
    }
    
    return res.status(204).end();
  });
  
  // Custom Formula routes
  app.get('/api/custom-formulas', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const formulas = await storage.getCustomFormulasByForecastId(forecastId);
    return res.json(formulas);
  });
  
  app.get('/api/custom-formulas/:id', async (req: Request, res: Response) => {
    const formulaId = parseInt(req.params.id);
    if (isNaN(formulaId)) {
      return res.status(400).json({ message: 'Invalid formula ID' });
    }
    
    const formula = await storage.getCustomFormula(formulaId);
    if (!formula) {
      return res.status(404).json({ message: 'Custom formula not found' });
    }
    
    return res.json(formula);
  });
  
  app.post('/api/custom-formulas', async (req: Request, res: Response) => {
    try {
      const formulaData = insertCustomFormulaSchema.parse(req.body);
      const formula = await storage.createCustomFormula(formulaData);
      return res.status(201).json(formula);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/custom-formulas/:id', async (req: Request, res: Response) => {
    try {
      const formulaId = parseInt(req.params.id);
      if (isNaN(formulaId)) {
        return res.status(400).json({ message: 'Invalid formula ID' });
      }
      
      const formulaData = insertCustomFormulaSchema.partial().parse(req.body);
      const updatedFormula = await storage.updateCustomFormula(formulaId, formulaData);
      
      if (!updatedFormula) {
        return res.status(404).json({ message: 'Custom formula not found' });
      }
      
      return res.json(updatedFormula);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/custom-formulas/:id', async (req: Request, res: Response) => {
    const formulaId = parseInt(req.params.id);
    if (isNaN(formulaId)) {
      return res.status(400).json({ message: 'Invalid formula ID' });
    }
    
    const success = await storage.deleteCustomFormula(formulaId);
    if (!success) {
      return res.status(404).json({ message: 'Custom formula not found' });
    }
    
    return res.status(204).end();
  });
  
  // Puzzle.io Integration routes
  app.get('/api/puzzle-integration/:userId', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const integration = await storage.getPuzzleIntegrationByUserId(userId);
    if (!integration) {
      return res.status(404).json({ message: 'Puzzle.io integration not found' });
    }
    
    return res.json(integration);
  });
  
  app.post('/api/puzzle-integration', async (req: Request, res: Response) => {
    try {
      const integrationData = insertPuzzleIntegrationSchema.parse(req.body);
      const integration = await storage.createPuzzleIntegration(integrationData);
      return res.status(201).json(integration);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/puzzle-integration/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const integrationData = insertPuzzleIntegrationSchema.partial().parse(req.body);
      const updatedIntegration = await storage.updatePuzzleIntegration(userId, integrationData);
      
      if (!updatedIntegration) {
        return res.status(404).json({ message: 'Puzzle.io integration not found' });
      }
      
      return res.json(updatedIntegration);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/puzzle-integration/:userId', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const success = await storage.deletePuzzleIntegration(userId);
    if (!success) {
      return res.status(404).json({ message: 'Puzzle.io integration not found' });
    }
    
    return res.status(204).end();
  });
  
  // Financial Projection routes
  app.get('/api/financial-projections', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const projections = await storage.getFinancialProjectionsByForecastId(forecastId);
    return res.json(projections);
  });
  
  app.get('/api/financial-projections/:id', async (req: Request, res: Response) => {
    const projectionId = parseInt(req.params.id);
    if (isNaN(projectionId)) {
      return res.status(400).json({ message: 'Invalid projection ID' });
    }
    
    const projection = await storage.getFinancialProjection(projectionId);
    if (!projection) {
      return res.status(404).json({ message: 'Financial projection not found' });
    }
    
    return res.json(projection);
  });
  
  app.post('/api/financial-projections', async (req: Request, res: Response) => {
    try {
      const projectionData = insertFinancialProjectionSchema.parse(req.body);
      const projection = await storage.createFinancialProjection(projectionData);
      return res.status(201).json(projection);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/financial-projections/:id', async (req: Request, res: Response) => {
    try {
      const projectionId = parseInt(req.params.id);
      if (isNaN(projectionId)) {
        return res.status(400).json({ message: 'Invalid projection ID' });
      }
      
      const projectionData = insertFinancialProjectionSchema.partial().parse(req.body);
      const updatedProjection = await storage.updateFinancialProjection(projectionId, projectionData);
      
      if (!updatedProjection) {
        return res.status(404).json({ message: 'Financial projection not found' });
      }
      
      return res.json(updatedProjection);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/financial-projections/:id', async (req: Request, res: Response) => {
    const projectionId = parseInt(req.params.id);
    if (isNaN(projectionId)) {
      return res.status(400).json({ message: 'Invalid projection ID' });
    }
    
    const success = await storage.deleteFinancialProjection(projectionId);
    if (!success) {
      return res.status(404).json({ message: 'Financial projection not found' });
    }
    
    return res.status(204).end();
  });
  
  // Calculate formula endpoint
  app.post('/api/calculate-formula', (req: Request, res: Response) => {
    try {
      const { formula, variables } = req.body;
      
      if (!formula || typeof formula !== 'string') {
        return res.status(400).json({ message: 'Formula is required and must be a string' });
      }
      
      if (!variables || typeof variables !== 'object') {
        return res.status(400).json({ message: 'Variables must be provided as an object' });
      }
      
      // In a real implementation, this would use a math expression evaluation library
      // For the MVP, we'll just return a placeholder result
      return res.json({ result: 1000000 });
    } catch (err) {
      console.error('Error calculating formula:', err);
      return res.status(500).json({ message: 'Error calculating formula' });
    }
  });
  
  // Register Puzzle.io routes
  app.use('/api/puzzle', puzzleRouter);

  const httpServer = createServer(app);
  return httpServer;
}
