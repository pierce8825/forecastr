import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSubaccountSchema,
  insertForecastSchema, 
  insertRevenueDriverSchema, 
  insertRevenueStreamSchema,
  insertRevenueDriverToStreamSchema,
  insertExpenseSchema,
  insertDepartmentSchema,
  insertPersonnelRoleSchema,
  insertCustomFormulaSchema,
  insertPuzzleIntegrationSchema,
  insertFinancialProjectionSchema,
  insertEmployeeSchema,
  insertPayrollSchema,
  insertPayrollItemSchema,
  insertExpenseBudgetSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import puzzleRouter from "./routes/puzzle";
import chatRouter from "./routes/chat";
import { setupAuth } from "./auth";
import * as math from 'mathjs';

// Extend Express Request to include resource property
interface Request extends ExpressRequest {
  resource?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
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
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: 'Not authenticated' });
  };
  
  // Middleware to check if user owns the resource
  const isResourceOwner = (resourceGetter: (id: number) => Promise<any>) => {
    return async (req: Request, res: Response, next: Function) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: 'Invalid resource ID' });
      }
      
      try {
        const resource = await resourceGetter(resourceId);
        if (!resource) {
          return res.status(404).json({ message: 'Resource not found' });
        }
        
        // Check if the resource belongs to the current user
        if (resource.userId && resource.userId !== req.user.id) {
          return res.status(403).json({ message: 'Access denied' });
        }
        
        // Store the resource in the request object for later use
        req.resource = resource;
        next();
      } catch (error) {
        console.error('Error in isResourceOwner middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    };
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
  
  app.get('/api/users/:id', isAuthenticated, async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Only allow users to access their own data
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send the password in the response
    const { password, ...userData } = user;
    return res.json(userData);
  });
  
  // Subaccount routes
  app.get('/api/subaccounts', isAuthenticated, async (req: Request, res: Response) => {
    // If userId isn't provided, use the authenticated user's ID
    const userId = Number(req.query.userId) || req.user.id;
    
    // Ensure users can only access their own subaccounts
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const subaccounts = await storage.getSubaccountsByUserId(userId);
    return res.json(subaccounts);
  });
  
  app.get('/api/subaccounts/:id', isAuthenticated, async (req: Request, res: Response) => {
    const subaccountId = parseInt(req.params.id);
    if (isNaN(subaccountId)) {
      return res.status(400).json({ message: 'Invalid subaccount ID' });
    }
    
    const subaccount = await storage.getSubaccount(subaccountId);
    if (!subaccount) {
      return res.status(404).json({ message: 'Subaccount not found' });
    }
    
    // Ensure users can only access their own subaccounts
    if (subaccount.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(subaccount);
  });
  
  app.post('/api/subaccounts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const subaccountData = insertSubaccountSchema.parse(req.body);
      
      // Force the userId to be the authenticated user's ID
      subaccountData.userId = req.user.id;
      
      const subaccount = await storage.createSubaccount(subaccountData);
      return res.status(201).json(subaccount);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/subaccounts/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const subaccountId = parseInt(req.params.id);
      if (isNaN(subaccountId)) {
        return res.status(400).json({ message: 'Invalid subaccount ID' });
      }
      
      // Check if the subaccount exists and belongs to the user
      const subaccount = await storage.getSubaccount(subaccountId);
      if (!subaccount) {
        return res.status(404).json({ message: 'Subaccount not found' });
      }
      
      // Ensure users can only modify their own subaccounts
      if (subaccount.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const subaccountData = insertSubaccountSchema.partial().parse(req.body);
      
      // Prevent changing the userId
      delete subaccountData.userId;
      
      const updatedSubaccount = await storage.updateSubaccount(subaccountId, subaccountData);
      return res.json(updatedSubaccount);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/subaccounts/:id', isAuthenticated, async (req: Request, res: Response) => {
    const subaccountId = parseInt(req.params.id);
    if (isNaN(subaccountId)) {
      return res.status(400).json({ message: 'Invalid subaccount ID' });
    }
    
    // Check if the subaccount exists and belongs to the user
    const subaccount = await storage.getSubaccount(subaccountId);
    if (!subaccount) {
      return res.status(404).json({ message: 'Subaccount not found' });
    }
    
    // Ensure users can only delete their own subaccounts
    if (subaccount.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const success = await storage.deleteSubaccount(subaccountId);
    return res.status(204).end();
  });
  
  // Forecast routes
  app.get('/api/forecasts', isAuthenticated, async (req: Request, res: Response) => {
    // If userId isn't provided, use the authenticated user's ID
    const userId = Number(req.query.userId) || req.user.id;
    const subaccountId = Number(req.query.subaccountId);
    
    // Ensure users can only access their own forecasts
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (subaccountId && !isNaN(subaccountId)) {
      // If subaccountId is provided, check it belongs to the current user
      const subaccount = await storage.getSubaccount(subaccountId);
      if (!subaccount || subaccount.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // If subaccountId is provided and verified, filter by subaccount
      const forecasts = await storage.getForecastsBySubaccountId(subaccountId);
      return res.json(forecasts);
    } else {
      // If only userId is provided and verified, filter by user
      const forecasts = await storage.getForecastsByUserId(userId);
      return res.json(forecasts);
    }
  });
  
  app.get('/api/forecasts/:id', isAuthenticated, async (req: Request, res: Response) => {
    const forecastId = parseInt(req.params.id);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    const forecast = await storage.getForecast(forecastId);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    // Check if the forecast belongs to a subaccount owned by the user
    if (forecast.subaccountId) {
      const subaccount = await storage.getSubaccount(forecast.subaccountId);
      if (!subaccount || subaccount.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    // Or check if the forecast is directly owned by the user
    else if (forecast.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(forecast);
  });
  
  app.post('/api/forecasts', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const forecastData = insertForecastSchema.parse(req.body);
      
      // Force the userId to be the authenticated user's ID
      forecastData.userId = req.user.id;
      
      // If a subaccountId is provided, verify it belongs to the user
      if (forecastData.subaccountId) {
        const subaccount = await storage.getSubaccount(forecastData.subaccountId);
        if (!subaccount || subaccount.userId !== req.user.id) {
          return res.status(403).json({ message: 'Access denied: The specified subaccount does not belong to you' });
        }
      }
      
      const forecast = await storage.createForecast(forecastData);
      return res.status(201).json(forecast);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/forecasts/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const forecastId = parseInt(req.params.id);
      if (isNaN(forecastId)) {
        return res.status(400).json({ message: 'Invalid forecast ID' });
      }
      
      // Check if the forecast exists and belongs to the user
      const forecast = await storage.getForecast(forecastId);
      if (!forecast) {
        return res.status(404).json({ message: 'Forecast not found' });
      }
      
      // Check ownership through subaccount or direct userId
      let hasAccess = false;
      if (forecast.subaccountId) {
        const subaccount = await storage.getSubaccount(forecast.subaccountId);
        hasAccess = subaccount && subaccount.userId === req.user.id;
      } else {
        hasAccess = forecast.userId === req.user.id;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const forecastData = insertForecastSchema.partial().parse(req.body);
      
      // Prevent changing ownership
      delete forecastData.userId;
      
      // If attempting to change the subaccountId, verify the new one belongs to the user
      if (forecastData.subaccountId && forecastData.subaccountId !== forecast.subaccountId) {
        const subaccount = await storage.getSubaccount(forecastData.subaccountId);
        if (!subaccount || subaccount.userId !== req.user.id) {
          return res.status(403).json({ message: 'Access denied: The specified subaccount does not belong to you' });
        }
      }
      
      const updatedForecast = await storage.updateForecast(forecastId, forecastData);
      return res.json(updatedForecast);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/forecasts/:id', isAuthenticated, async (req: Request, res: Response) => {
    const forecastId = parseInt(req.params.id);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    // Check if the forecast exists and belongs to the user
    const forecast = await storage.getForecast(forecastId);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    // Check ownership through subaccount or direct userId
    let hasAccess = false;
    if (forecast.subaccountId) {
      const subaccount = await storage.getSubaccount(forecast.subaccountId);
      hasAccess = subaccount && subaccount.userId === req.user.id;
    } else {
      hasAccess = forecast.userId === req.user.id;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const success = await storage.deleteForecast(forecastId);
    return res.status(204).end();
  });
  
  // Revenue Driver routes
  app.get('/api/revenue-drivers', isAuthenticated, async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    if (isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid forecast ID' });
    }
    
    // Verify that the forecast belongs to the user
    const forecast = await storage.getForecast(forecastId);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    // Check ownership through subaccount or direct userId
    let hasAccess = false;
    if (forecast.subaccountId) {
      const subaccount = await storage.getSubaccount(forecast.subaccountId);
      hasAccess = subaccount && subaccount.userId === req.user.id;
    } else {
      hasAccess = forecast.userId === req.user.id;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const drivers = await storage.getRevenueDriversByForecastId(forecastId);
    return res.json(drivers);
  });
  
  app.get('/api/revenue-drivers/:id', isAuthenticated, async (req: Request, res: Response) => {
    const driverId = parseInt(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: 'Invalid driver ID' });
    }
    
    const driver = await storage.getRevenueDriver(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Revenue driver not found' });
    }
    
    // Verify that the forecast belongs to the user
    const forecast = await storage.getForecast(driver.forecastId);
    if (!forecast) {
      return res.status(404).json({ message: 'Associated forecast not found' });
    }
    
    // Check ownership through subaccount or direct userId
    let hasAccess = false;
    if (forecast.subaccountId) {
      const subaccount = await storage.getSubaccount(forecast.subaccountId);
      hasAccess = subaccount && subaccount.userId === req.user.id;
    } else {
      hasAccess = forecast.userId === req.user.id;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.json(driver);
  });
  
  app.post('/api/revenue-drivers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const driverData = insertRevenueDriverSchema.parse(req.body);
      
      // Verify that the forecast belongs to the user
      const forecast = await storage.getForecast(driverData.forecastId);
      if (!forecast) {
        return res.status(404).json({ message: 'Forecast not found' });
      }
      
      // Check ownership through subaccount or direct userId
      let hasAccess = false;
      if (forecast.subaccountId) {
        const subaccount = await storage.getSubaccount(forecast.subaccountId);
        hasAccess = subaccount && subaccount.userId === req.user.id;
      } else {
        hasAccess = forecast.userId === req.user.id;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied: The specified forecast does not belong to you' });
      }
      
      const driver = await storage.createRevenueDriver(driverData);
      return res.status(201).json(driver);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/revenue-drivers/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const driverId = parseInt(req.params.id);
      if (isNaN(driverId)) {
        return res.status(400).json({ message: 'Invalid driver ID' });
      }
      
      // Get the current driver
      const driver = await storage.getRevenueDriver(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Revenue driver not found' });
      }
      
      // Verify that the forecast belongs to the user
      const forecast = await storage.getForecast(driver.forecastId);
      if (!forecast) {
        return res.status(404).json({ message: 'Associated forecast not found' });
      }
      
      // Check ownership through subaccount or direct userId
      let hasAccess = false;
      if (forecast.subaccountId) {
        const subaccount = await storage.getSubaccount(forecast.subaccountId);
        hasAccess = subaccount && subaccount.userId === req.user.id;
      } else {
        hasAccess = forecast.userId === req.user.id;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const driverData = insertRevenueDriverSchema.partial().parse(req.body);
      
      // If changing the forecastId, verify the new forecast also belongs to the user
      if (driverData.forecastId && driverData.forecastId !== driver.forecastId) {
        const newForecast = await storage.getForecast(driverData.forecastId);
        if (!newForecast) {
          return res.status(404).json({ message: 'New forecast not found' });
        }
        
        // Check ownership of the new forecast
        let hasAccessToNewForecast = false;
        if (newForecast.subaccountId) {
          const subaccount = await storage.getSubaccount(newForecast.subaccountId);
          hasAccessToNewForecast = subaccount && subaccount.userId === req.user.id;
        } else {
          hasAccessToNewForecast = newForecast.userId === req.user.id;
        }
        
        if (!hasAccessToNewForecast) {
          return res.status(403).json({ message: 'Access denied: The specified forecast does not belong to you' });
        }
      }
      
      const updatedDriver = await storage.updateRevenueDriver(driverId, driverData);
      return res.json(updatedDriver);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/revenue-drivers/:id', isAuthenticated, async (req: Request, res: Response) => {
    const driverId = parseInt(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: 'Invalid driver ID' });
    }
    
    // Get the current driver
    const driver = await storage.getRevenueDriver(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Revenue driver not found' });
    }
    
    // Verify that the forecast belongs to the user
    const forecast = await storage.getForecast(driver.forecastId);
    if (!forecast) {
      return res.status(404).json({ message: 'Associated forecast not found' });
    }
    
    // Check ownership through subaccount or direct userId
    let hasAccess = false;
    if (forecast.subaccountId) {
      const subaccount = await storage.getSubaccount(forecast.subaccountId);
      hasAccess = subaccount && subaccount.userId === req.user.id;
    } else {
      hasAccess = forecast.userId === req.user.id;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const success = await storage.deleteRevenueDriver(driverId);
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
  
  // Expense Budget routes
  app.get('/api/expense-budgets', async (req: Request, res: Response) => {
    const forecastId = Number(req.query.forecastId);
    const year = req.query.year ? Number(req.query.year) : undefined;
    
    if (!forecastId || isNaN(forecastId)) {
      return res.status(400).json({ message: 'Invalid or missing forecast ID' });
    }
    
    const budgets = await storage.getExpenseBudgets(forecastId, year);
    return res.json(budgets);
  });
  
  app.get('/api/expense-budgets/:id', async (req: Request, res: Response) => {
    const budgetId = parseInt(req.params.id);
    if (isNaN(budgetId)) {
      return res.status(400).json({ message: 'Invalid budget ID' });
    }
    
    const budget = await storage.getExpenseBudgetById(budgetId);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    return res.json(budget);
  });
  
  app.post('/api/expense-budgets', async (req: Request, res: Response) => {
    try {
      const budgetData = insertExpenseBudgetSchema.parse(req.body);
      const budget = await storage.createExpenseBudget(budgetData);
      return res.status(201).json(budget);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/expense-budgets/:id', async (req: Request, res: Response) => {
    try {
      const budgetId = parseInt(req.params.id);
      if (isNaN(budgetId)) {
        return res.status(400).json({ message: 'Invalid budget ID' });
      }
      
      const budgetData = insertExpenseBudgetSchema.partial().parse(req.body);
      const updatedBudget = await storage.updateExpenseBudget(budgetId, budgetData);
      
      if (!updatedBudget) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      
      return res.json(updatedBudget);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/expense-budgets/:id', async (req: Request, res: Response) => {
    const budgetId = parseInt(req.params.id);
    if (isNaN(budgetId)) {
      return res.status(400).json({ message: 'Invalid budget ID' });
    }
    
    const success = await storage.deleteExpenseBudget(budgetId);
    if (!success) {
      return res.status(404).json({ message: 'Budget not found' });
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
  
  // Employee routes
  app.get('/api/employees', async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    const subaccountId = Number(req.query.subaccountId);
    
    if (subaccountId && !isNaN(subaccountId)) {
      // If subaccountId is provided, filter by subaccount
      const employees = await storage.getEmployeesBySubaccountId(subaccountId);
      return res.json(employees);
    } else if (userId && !isNaN(userId)) {
      // If only userId is provided, filter by user
      const employees = await storage.getEmployeesByUserId(userId);
      return res.json(employees);
    } else {
      return res.status(400).json({ message: 'Invalid or missing user ID or subaccount ID' });
    }
  });
  
  app.get('/api/employees/:id', async (req: Request, res: Response) => {
    const employeeId = parseInt(req.params.id);
    if (isNaN(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }
    
    const employee = await storage.getEmployee(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    return res.json(employee);
  });
  
  app.post('/api/employees', async (req: Request, res: Response) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      
      // Check if email exists
      const existingEmployee = await storage.getEmployeeByEmail(employeeData.email);
      if (existingEmployee) {
        return res.status(400).json({ message: 'An employee with this email already exists' });
      }
      
      const employee = await storage.createEmployee(employeeData);
      return res.status(201).json(employee);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ message: 'Invalid employee ID' });
      }
      
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      
      // If email is being updated, check if it's already in use
      if (employeeData.email) {
        const existingEmployee = await storage.getEmployeeByEmail(employeeData.email);
        if (existingEmployee && existingEmployee.id !== employeeId) {
          return res.status(400).json({ message: 'Email already in use by another employee' });
        }
      }
      
      const updatedEmployee = await storage.updateEmployee(employeeId, employeeData);
      
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      return res.json(updatedEmployee);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/employees/:id', async (req: Request, res: Response) => {
    const employeeId = parseInt(req.params.id);
    if (isNaN(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }
    
    const success = await storage.deleteEmployee(employeeId);
    if (!success) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    return res.status(204).end();
  });
  
  // Payroll routes
  app.get('/api/payrolls', async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    const subaccountId = Number(req.query.subaccountId);
    
    if (subaccountId && !isNaN(subaccountId)) {
      // If subaccountId is provided, filter by subaccount
      const payrolls = await storage.getPayrollsBySubaccountId(subaccountId);
      return res.json(payrolls);
    } else if (userId && !isNaN(userId)) {
      // If only userId is provided, filter by user
      const payrolls = await storage.getPayrollsByUserId(userId);
      return res.json(payrolls);
    } else {
      return res.status(400).json({ message: 'Invalid or missing user ID or subaccount ID' });
    }
  });
  
  app.get('/api/payrolls/:id', async (req: Request, res: Response) => {
    const payrollId = parseInt(req.params.id);
    if (isNaN(payrollId)) {
      return res.status(400).json({ message: 'Invalid payroll ID' });
    }
    
    const payroll = await storage.getPayroll(payrollId);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    return res.json(payroll);
  });
  
  app.post('/api/payrolls', async (req: Request, res: Response) => {
    try {
      const payrollData = insertPayrollSchema.parse(req.body);
      const payroll = await storage.createPayroll(payrollData);
      return res.status(201).json(payroll);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/payrolls/:id', async (req: Request, res: Response) => {
    try {
      const payrollId = parseInt(req.params.id);
      if (isNaN(payrollId)) {
        return res.status(400).json({ message: 'Invalid payroll ID' });
      }
      
      const payrollData = insertPayrollSchema.partial().parse(req.body);
      const updatedPayroll = await storage.updatePayroll(payrollId, payrollData);
      
      if (!updatedPayroll) {
        return res.status(404).json({ message: 'Payroll not found' });
      }
      
      return res.json(updatedPayroll);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/payrolls/:id', async (req: Request, res: Response) => {
    const payrollId = parseInt(req.params.id);
    if (isNaN(payrollId)) {
      return res.status(400).json({ message: 'Invalid payroll ID' });
    }
    
    const success = await storage.deletePayroll(payrollId);
    if (!success) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    return res.status(204).end();
  });
  
  // Payroll Item routes
  app.get('/api/payroll-items', async (req: Request, res: Response) => {
    const payrollId = Number(req.query.payrollId);
    const employeeId = Number(req.query.employeeId);
    
    if (payrollId && !isNaN(payrollId)) {
      const items = await storage.getPayrollItemsByPayrollId(payrollId);
      return res.json(items);
    } else if (employeeId && !isNaN(employeeId)) {
      const items = await storage.getPayrollItemsByEmployeeId(employeeId);
      return res.json(items);
    } else {
      return res.status(400).json({ message: 'Invalid or missing payroll ID or employee ID' });
    }
  });
  
  app.get('/api/payroll-items/:id', async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid payroll item ID' });
    }
    
    const item = await storage.getPayrollItem(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Payroll item not found' });
    }
    
    return res.json(item);
  });
  
  app.post('/api/payroll-items', async (req: Request, res: Response) => {
    try {
      const itemData = insertPayrollItemSchema.parse(req.body);
      const item = await storage.createPayrollItem(itemData);
      return res.status(201).json(item);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.put('/api/payroll-items/:id', async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid payroll item ID' });
      }
      
      const itemData = insertPayrollItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updatePayrollItem(itemId, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: 'Payroll item not found' });
      }
      
      return res.json(updatedItem);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });
  
  app.delete('/api/payroll-items/:id', async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid payroll item ID' });
    }
    
    const success = await storage.deletePayrollItem(itemId);
    if (!success) {
      return res.status(404).json({ message: 'Payroll item not found' });
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
      
      // Math.js is already imported at the top of the file
      
      try {
        // Validate the formula by attempting to parse it
        math.parse(formula);

        // Replace variable names with their values
        let calculationFormula = formula;
        
        // Replace entity references like stream_1, driver_2 with their values
        const refRegex = /(stream|driver|expense|personnel)_(\d+)/g;
        calculationFormula = calculationFormula.replace(refRegex, (match) => {
          if (variables[match] !== undefined) {
            return variables[match].toString();
          }
          return '0'; // Default to 0 if variable not found
        });
        
        // Replace any remaining variables
        Object.keys(variables).forEach(varName => {
          // Use a regex to match the exact variable name (not as a substring)
          const varRegex = new RegExp(`\\b${varName}\\b`, 'g');
          calculationFormula = calculationFormula.replace(varRegex, variables[varName]);
        });
        
        // Evaluate the formula
        const result = math.evaluate(calculationFormula);
        
        // Check if result is a valid number
        if (isNaN(result) || !isFinite(result)) {
          return res.status(400).json({ 
            message: 'Formula evaluation resulted in an invalid number',
            isValid: false,
            error: {
              message: 'Invalid result',
              type: 'calculation',
              details: 'The formula evaluation resulted in NaN or Infinity'
            }
          });
        }
        
        return res.json({ 
          result, 
          isValid: true 
        });
      } catch (error) {
        // Formula is invalid or calculation failed
        return res.status(400).json({ 
          message: 'Invalid formula',
          isValid: false,
          error: {
            message: error.message || 'Syntax error in formula',
            type: 'syntax',
            details: error.toString()
          }
        });
      }
    } catch (err) {
      console.error('Error calculating formula:', err);
      return res.status(500).json({ 
        message: 'Error calculating formula',
        isValid: false,
        error: {
          message: 'Server error while processing formula',
          type: 'server',
          details: err.toString()
        }
      });
    }
  });
  
  // Register Puzzle.io routes
  app.use('/api/puzzle', puzzleRouter);
  app.use('/api/chat', chatRouter);

  const httpServer = createServer(app);
  return httpServer;
}
