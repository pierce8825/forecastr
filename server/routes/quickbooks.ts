import { Express, Request, Response } from 'express';
import * as quickbooksService from '../services/quickbooks';
import { storage } from '../storage';

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

  // Get QuickBooks balance sheet report
  app.get('/api/quickbooks/reports/balance-sheet/:userId', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }
      
      const report = await quickbooksService.getBalanceSheet(userId, date);
      
      res.json(report);
    } catch (error) {
      console.error('Error getting QuickBooks balance sheet report:', error);
      res.status(500).json({ 
        message: 'Error getting QuickBooks balance sheet report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get QuickBooks reports (unified endpoint)
  app.get('/api/quickbooks/reports/:type/:realmId', async (req: Request, res: Response) => {
    try {
      const { type, realmId } = req.params;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }

      if (!realmId) {
        return res.status(400).json({ message: 'Realm ID is required' });
      }
      
      let reportData;
      const userId = 1; // Placeholder - in a real app, this would come from the user session
      
      // Get the integration by realm ID
      const integration = await storage.getQuickbooksIntegrationByRealmId(realmId);
      if (!integration) {
        return res.status(404).json({ message: 'QuickBooks integration not found for the specified realm ID' });
      }

      if (type === 'PROFIT_AND_LOSS') {
        const rawReport = await quickbooksService.getProfitAndLoss(userId, startDate, endDate);
        
        // Process the raw P&L report into a simplified format
        reportData = {
          report: {
            income: processReportItems(rawReport, 'Income'),
            expenses: processReportItems(rawReport, 'Expenses'),
            totalIncome: extractTotalFromReport(rawReport, 'Income'),
            totalExpenses: extractTotalFromReport(rawReport, 'Expenses'),
          }
        };
      } else if (type === 'BALANCE_SHEET') {
        const rawReport = await quickbooksService.getBalanceSheet(userId, endDate);
        
        // Process the raw balance sheet report into a simplified format
        reportData = {
          report: {
            assets: processReportItems(rawReport, 'Assets'),
            liabilities: processReportItems(rawReport, 'Liabilities'),
            equity: processReportItems(rawReport, 'Equity'),
            totalAssets: extractTotalFromReport(rawReport, 'Assets'),
            totalLiabilities: extractTotalFromReport(rawReport, 'Liabilities'),
            totalEquity: extractTotalFromReport(rawReport, 'Equity'),
          }
        };
      } else {
        return res.status(400).json({ message: 'Invalid report type' });
      }
      
      res.json(reportData);
    } catch (error) {
      console.error(`Error getting QuickBooks ${req.params.type} report:`, error);
      res.status(500).json({ 
        message: `Error getting QuickBooks ${req.params.type} report`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get QuickBooks accounts with formatted data
  app.get('/api/quickbooks/accounts/:realmId', async (req: Request, res: Response) => {
    try {
      const { realmId } = req.params;
      
      if (!realmId) {
        return res.status(400).json({ message: 'Realm ID is required' });
      }
      
      // Get the integration by realm ID
      const integration = await storage.getQuickbooksIntegrationByRealmId(realmId);
      if (!integration) {
        return res.status(404).json({ message: 'QuickBooks integration not found for the specified realm ID' });
      }
      
      const userId = integration.userId;
      const rawAccounts = await quickbooksService.getAccounts(userId);
      
      // Format the accounts for the frontend
      const formattedAccounts = {
        accounts: (rawAccounts.QueryResponse.Account || []).map((account: any) => ({
          id: account.Id,
          name: account.Name,
          classification: account.Classification,
          accountType: account.AccountType,
          accountSubType: account.AccountSubType,
          currentBalance: account.CurrentBalance || 0,
          active: account.Active
        }))
      };
      
      res.json(formattedAccounts);
    } catch (error) {
      console.error('Error getting QuickBooks accounts:', error);
      res.status(500).json({ 
        message: 'Error getting QuickBooks accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Helper functions for processing QuickBooks report data
function processReportItems(report: any, category: string) {
  try {
    // This is a simplified parser - in a real app, this would need to be more robust
    // to handle the specific structure of QuickBooks reports
    const rows = report.Rows?.Row || [];
    const items = [];
    
    for (const row of rows) {
      if (row.group) {
        // Skip group headers
        continue;
      }
      
      // Process rows based on their header or group structure
      const rowData = row.Rows?.Row || [];
      for (const item of rowData) {
        if (item.ColData && item.ColData.length >= 2) {
          const name = item.ColData[0].value;
          const amountStr = item.ColData[1].value;
          const amount = parseFloat(amountStr.replace(/,/g, ''));
          
          if (!isNaN(amount)) {
            items.push({
              name,
              amount
            });
          }
        }
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error processing ${category} items:`, error);
    return [];
  }
}

function extractTotalFromReport(report: any, category: string) {
  try {
    const rows = report.Rows?.Row || [];
    
    // Find the summary row for the category
    for (const row of rows) {
      if (row.Summary && row.Summary.ColData && row.Summary.ColData.length >= 2) {
        const label = row.Summary.ColData[0].value;
        
        if (label.includes(`Total ${category}`)) {
          const amountStr = row.Summary.ColData[1].value;
          const amount = parseFloat(amountStr.replace(/,/g, ''));
          
          if (!isNaN(amount)) {
            return amount;
          }
        }
      }
    }
    
    return 0;
  } catch (error) {
    console.error(`Error extracting ${category} total:`, error);
    return 0;
  }
}