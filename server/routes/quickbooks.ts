import { Express, Request, Response } from 'express';
import * as quickbooksService from '../services/quickbooks';

/**
 * Register QuickBooks API routes
 */
export function registerQuickbooksRoutes(app: Express) {
  // Initiate QuickBooks OAuth
  app.get('/api/quickbooks/auth', (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const authUrl = quickbooksService.getAuthorizationUrl();
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error initiating QuickBooks auth:', error);
      res.status(500).json({ 
        message: 'Error initiating QuickBooks authorization',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Handle OAuth callback
  app.get('/api/quickbooks/callback', async (req: Request, res: Response) => {
    try {
      // For now, we'll use a hard-coded user ID for MVP
      // In a production app, this would come from the authenticated session
      const userId = 1; 
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      
      const result = await quickbooksService.handleOAuthCallback(fullUrl, userId);
      
      if (result.success) {
        // Redirect to the settings page with success message
        res.redirect('/settings?tab=integrations&status=success');
      } else {
        // Redirect with error
        res.redirect(`/settings?tab=integrations&status=error&message=${encodeURIComponent(result.error || 'Unknown error')}`);
      }
    } catch (error) {
      console.error('Error handling QuickBooks callback:', error);
      res.redirect(`/settings?tab=integrations&status=error&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
  });

  // Get QuickBooks integration status
  app.get('/api/quickbooks/status/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const isConnected = await quickbooksService.hasValidIntegration(userId);
      
      res.json({ connected: isConnected });
    } catch (error) {
      console.error('Error checking QuickBooks status:', error);
      res.status(500).json({ 
        message: 'Error checking QuickBooks connection status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Disconnect QuickBooks integration
  app.delete('/api/quickbooks/disconnect/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const result = await quickbooksService.disconnectQuickbooks(userId);
      
      if (result.success) {
        res.json({ message: 'QuickBooks disconnected successfully' });
      } else {
        res.status(500).json({ 
          message: 'Error disconnecting QuickBooks',
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error disconnecting QuickBooks:', error);
      res.status(500).json({ 
        message: 'Error disconnecting QuickBooks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get QuickBooks accounts
  app.get('/api/quickbooks/accounts/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const accounts = await quickbooksService.getAccounts(userId);
      
      res.json(accounts);
    } catch (error) {
      console.error('Error getting QuickBooks accounts:', error);
      res.status(500).json({ 
        message: 'Error getting QuickBooks accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get QuickBooks income accounts
  app.get('/api/quickbooks/accounts/income/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const accounts = await quickbooksService.getIncomeAccounts(userId);
      
      res.json(accounts);
    } catch (error) {
      console.error('Error getting QuickBooks income accounts:', error);
      res.status(500).json({ 
        message: 'Error getting QuickBooks income accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get QuickBooks expense accounts
  app.get('/api/quickbooks/accounts/expense/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const accounts = await quickbooksService.getExpenseAccounts(userId);
      
      res.json(accounts);
    } catch (error) {
      console.error('Error getting QuickBooks expense accounts:', error);
      res.status(500).json({ 
        message: 'Error getting QuickBooks expense accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get QuickBooks profit and loss report
  app.get('/api/quickbooks/reports/profit-loss/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const report = await quickbooksService.getProfitAndLoss(userId, startDate, endDate);
      
      res.json(report);
    } catch (error) {
      console.error('Error getting QuickBooks profit and loss report:', error);
      res.status(500).json({ 
        message: 'Error getting QuickBooks profit and loss report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}