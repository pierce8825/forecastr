import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { handleValidationError } from '../utils/validation';
import { 
  connectPuzzle, 
  disconnectPuzzle, 
  getPuzzleIntegration, 
  getPuzzleAccounts,
  getPuzzleCategories,
  getPuzzleTransactions,
  getPuzzleFinancialReport,
  syncPuzzleData
} from '../services/puzzle';

const puzzleRouter = Router();

// Schema for connecting Puzzle.io
const connectPuzzleSchema = z.object({
  userId: z.number(),
  apiKey: z.string().min(1, 'API Key is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required')
});

/**
 * Get Puzzle.io integration for a user
 */
puzzleRouter.get('/integration/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const integration = await getPuzzleIntegration(userId);
    
    if (!integration) {
      return res.status(404).json({ error: 'Puzzle.io integration not found' });
    }
    
    // Don't return the API key in the response
    const { apiKey, ...safeIntegration } = integration;
    
    return res.json(safeIntegration);
  } catch (error) {
    console.error('Error getting Puzzle.io integration:', error);
    return res.status(500).json({ error: 'Failed to get Puzzle.io integration' });
  }
});

/**
 * Connect a user's account to Puzzle.io
 */
puzzleRouter.post('/integration', async (req: Request, res: Response) => {
  try {
    const validatedData = connectPuzzleSchema.parse(req.body);
    const result = await connectPuzzle(
      validatedData.userId, 
      validatedData.apiKey, 
      validatedData.workspaceId
    );
    
    return res.json(result);
  } catch (error) {
    return handleValidationError(error, res, 'Failed to connect to Puzzle.io');
  }
});

/**
 * Disconnect Puzzle.io integration
 */
puzzleRouter.delete('/integration/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const result = await disconnectPuzzle(userId);
    return res.json(result);
  } catch (error) {
    console.error('Error disconnecting Puzzle.io:', error);
    return res.status(500).json({ error: 'Failed to disconnect Puzzle.io integration' });
  }
});

/**
 * Get accounts from Puzzle.io
 */
puzzleRouter.get('/accounts/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const accounts = await getPuzzleAccounts(userId);
    return res.json(accounts);
  } catch (error) {
    console.error('Error getting Puzzle.io accounts:', error);
    return res.status(500).json({ error: 'Failed to get accounts from Puzzle.io' });
  }
});

/**
 * Get categories from Puzzle.io
 */
puzzleRouter.get('/categories/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const categories = await getPuzzleCategories(userId);
    return res.json(categories);
  } catch (error) {
    console.error('Error getting Puzzle.io categories:', error);
    return res.status(500).json({ error: 'Failed to get categories from Puzzle.io' });
  }
});

/**
 * Get transactions from Puzzle.io
 */
puzzleRouter.get('/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { startDate, endDate, page, pageSize } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string, 10) : 100;
    
    const transactions = await getPuzzleTransactions(
      userId, 
      startDate as string, 
      endDate as string,
      parsedPage,
      parsedPageSize
    );
    
    return res.json(transactions);
  } catch (error) {
    console.error('Error getting Puzzle.io transactions:', error);
    return res.status(500).json({ error: 'Failed to get transactions from Puzzle.io' });
  }
});

/**
 * Get financial report from Puzzle.io
 */
puzzleRouter.get('/reports/:userId/:reportType', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { reportType } = req.params;
    const { startDate, endDate, period } = req.query;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!reportType || !['balance_sheet', 'income_statement', 'cash_flow'].includes(reportType)) {
      return res.status(400).json({ 
        error: 'Valid report type is required (balance_sheet, income_statement, or cash_flow)' 
      });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const validPeriods = ['month', 'quarter', 'year'];
    const periodValue = period && validPeriods.includes(period as string) 
      ? period as 'month' | 'quarter' | 'year' 
      : 'month';
    
    const report = await getPuzzleFinancialReport(
      userId, 
      reportType as 'balance_sheet' | 'income_statement' | 'cash_flow', 
      startDate as string, 
      endDate as string,
      periodValue
    );
    
    return res.json(report);
  } catch (error) {
    console.error('Error getting financial report:', error);
    return res.status(500).json({ error: 'Failed to get financial report from Puzzle.io' });
  }
});

/**
 * Sync data from Puzzle.io to financial projections
 */
puzzleRouter.post('/sync/:userId/:forecastId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const forecastId = parseInt(req.params.forecastId, 10);
    
    if (isNaN(userId) || isNaN(forecastId)) {
      return res.status(400).json({ error: 'Invalid user ID or forecast ID' });
    }
    
    const result = await syncPuzzleData(userId, forecastId);
    return res.json(result);
  } catch (error) {
    console.error('Error syncing data from Puzzle.io:', error);
    return res.status(500).json({ error: 'Failed to sync data from Puzzle.io' });
  }
});

export default puzzleRouter;