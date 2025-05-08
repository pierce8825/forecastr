import { db } from '../db';
import { eq } from 'drizzle-orm';
import { puzzleIntegrations } from '@shared/schema';

// Updated API base URL for Puzzle Accounting API
const API_BASE_URL = 'https://api.puzzle.io/accounting/v1';

/**
 * Connect a user's account to Puzzle.io
 */
export async function connectPuzzle(userId: number, apiKey: string, workspaceId: string) {
  try {
    // Validate the API key by making a test request
    const isValid = await validatePuzzleCredentials(apiKey, workspaceId);
    
    if (!isValid) {
      throw new Error('Invalid Puzzle.io API key or workspace ID');
    }
    
    // Check if integration already exists
    const existingIntegration = await db
      .select()
      .from(puzzleIntegrations)
      .where(eq(puzzleIntegrations.userId, userId));
    
    if (existingIntegration.length > 0) {
      // Update existing integration
      await db.update(puzzleIntegrations)
        .set({ 
          apiKey, 
          workspaceId,
          updatedAt: new Date() 
        })
        .where(eq(puzzleIntegrations.userId, userId));
    } else {
      // Create new integration
      await db.insert(puzzleIntegrations)
        .values({
          userId,
          apiKey,
          workspaceId,
          updatedAt: new Date()
        });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error connecting to Puzzle.io:', error);
    throw error;
  }
}

/**
 * Disconnect a user's Puzzle.io integration
 */
export async function disconnectPuzzle(userId: number) {
  try {
    // Delete integration record
    await db.delete(puzzleIntegrations)
      .where(eq(puzzleIntegrations.userId, userId));
    
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Puzzle.io:', error);
    throw error;
  }
}

/**
 * Get puzzle integration for a user
 */
export async function getPuzzleIntegration(userId: number) {
  try {
    const [integration] = await db.select()
      .from(puzzleIntegrations)
      .where(eq(puzzleIntegrations.userId, userId));
    
    return integration;
  } catch (error) {
    console.error('Error getting Puzzle.io integration:', error);
    throw error;
  }
}

/**
 * Validate Puzzle.io credentials
 */
async function validatePuzzleCredentials(apiKey: string, workspaceId: string): Promise<boolean> {
  try {
    // According to Puzzle Accounting API docs, test the connection by fetching workspace info
    const response = await fetch(`${API_BASE_URL}/organizations/${workspaceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validating Puzzle.io credentials:', error);
    return false;
  }
}

/**
 * Get accounts from Puzzle.io
 */
export async function getPuzzleAccounts(userId: number) {
  try {
    const integration = await getPuzzleIntegration(userId);
    
    if (!integration) {
      throw new Error('Puzzle.io integration not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/organizations/${integration.workspaceId}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.accounts || data; // Return the accounts array if available, or the full response
  } catch (error) {
    console.error('Error getting Puzzle.io accounts:', error);
    throw error;
  }
}

/**
 * Get financial reports from Puzzle.io
 * @param userId User ID
 * @param reportType Type of report: 'balance_sheet', 'income_statement', or 'cash_flow'
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @param period Optional period: 'month', 'quarter', 'year'
 */
export async function getPuzzleFinancialReport(
  userId: number, 
  reportType: 'balance_sheet' | 'income_statement' | 'cash_flow', 
  startDate: string, 
  endDate: string,
  period: 'month' | 'quarter' | 'year' = 'month'
) {
  try {
    const integration = await getPuzzleIntegration(userId);
    
    if (!integration) {
      throw new Error('Puzzle.io integration not found');
    }
    
    // Construct the proper endpoint based on report type
    let endpoint = '';
    switch (reportType) {
      case 'balance_sheet':
        endpoint = 'balance-sheet';
        break;
      case 'income_statement':
        endpoint = 'profit-and-loss';
        break;
      case 'cash_flow':
        endpoint = 'cash-flow';
        break;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/organizations/${integration.workspaceId}/reports/${endpoint}?start_date=${startDate}&end_date=${endDate}&period=${period}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${reportType} report: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update last sync timestamp
    await db.update(puzzleIntegrations)
      .set({ lastSync: new Date() })
      .where(eq(puzzleIntegrations.userId, userId));
    
    return data;
  } catch (error) {
    console.error(`Error getting Puzzle.io ${reportType} report:`, error);
    throw error;
  }
}

/**
 * Get categories from Puzzle.io
 */
export async function getPuzzleCategories(userId: number) {
  try {
    const integration = await getPuzzleIntegration(userId);
    
    if (!integration) {
      throw new Error('Puzzle.io integration not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/organizations/${integration.workspaceId}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.categories || data;
  } catch (error) {
    console.error('Error getting Puzzle.io categories:', error);
    throw error;
  }
}

/**
 * Get transactions from Puzzle.io
 * @param userId User ID
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @param page Optional page number for pagination
 * @param pageSize Optional page size for pagination
 */
export async function getPuzzleTransactions(
  userId: number, 
  startDate: string, 
  endDate: string,
  page: number = 1,
  pageSize: number = 100
) {
  try {
    const integration = await getPuzzleIntegration(userId);
    
    if (!integration) {
      throw new Error('Puzzle.io integration not found');
    }
    
    const response = await fetch(
      `${API_BASE_URL}/organizations/${integration.workspaceId}/transactions?start_date=${startDate}&end_date=${endDate}&page=${page}&page_size=${pageSize}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.transactions || data;
  } catch (error) {
    console.error('Error getting Puzzle.io transactions:', error);
    throw error;
  }
}

/**
 * Sync data from Puzzle.io to financial projections
 */
export async function syncPuzzleData(userId: number, forecastId: number) {
  try {
    const integration = await getPuzzleIntegration(userId);
    
    if (!integration) {
      throw new Error('Puzzle.io integration not found');
    }
    
    // Calculate date range - for example, last 12 months
    const endDate = new Date().toISOString().split('T')[0]; // Today in YYYY-MM-DD
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // 1 year ago
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Get income statement (profit and loss)
    const incomeData = await getPuzzleFinancialReport(userId, 'income_statement', startDateStr, endDate);
    
    // Get balance sheet
    const balanceData = await getPuzzleFinancialReport(userId, 'balance_sheet', startDateStr, endDate);
    
    // Extract revenue data from income statement
    let revenueStreams = [];
    if (incomeData && incomeData.income) {
      revenueStreams = extractRevenueFromIncomeStatement(incomeData, forecastId);
    }
    
    // Extract expenses from income statement
    let expenses = [];
    if (incomeData && incomeData.expenses) {
      expenses = extractExpensesFromIncomeStatement(incomeData, forecastId);
    }
    
    // TODO: Create/update database entries for revenue streams and expenses
    // This would involve mapping the data to our database schema and creating/updating records
    
    // Update last sync timestamp
    await db.update(puzzleIntegrations)
      .set({ lastSync: new Date() })
      .where(eq(puzzleIntegrations.userId, userId));
    
    return { 
      success: true, 
      message: 'Successfully synced data from Puzzle.io',
      syncedAt: new Date(),
      summary: {
        revenueStreamsCount: revenueStreams.length,
        expensesCount: expenses.length
      }
    };
  } catch (error) {
    console.error('Error syncing data from Puzzle.io:', error);
    throw error;
  }
}

/**
 * Helper function to extract revenue information from income statement
 */
function extractRevenueFromIncomeStatement(incomeData: any, forecastId: number) {
  // This is a placeholder implementation - actual implementation will depend on the exact structure 
  // of the Puzzle.io API response and how we want to model the data in our system
  const revenueStreams = [];
  
  if (incomeData.income) {
    // Extract revenue categories and amounts
    // Map them to our revenue stream model
    // For example:
    for (const category of incomeData.income) {
      revenueStreams.push({
        forecastId: forecastId,
        name: category.name || 'Unknown Revenue',
        description: `Imported from Puzzle.io - ${category.name}`,
        startDate: new Date(),
        growthRate: 0, // Default growth rate
        initialValue: category.total || 0,
        model: 'fixed', // Default model
        // Other revenue stream attributes would be set here
      });
    }
  }
  
  return revenueStreams;
}

/**
 * Helper function to extract expense information from income statement
 */
function extractExpensesFromIncomeStatement(incomeData: any, forecastId: number) {
  // This is a placeholder implementation - actual implementation will depend on the exact structure
  // of the Puzzle.io API response and how we want to model the data in our system
  const expenses = [];
  
  if (incomeData.expenses) {
    // Extract expense categories and amounts
    // Map them to our expense model
    // For example:
    for (const category of incomeData.expenses) {
      expenses.push({
        forecastId: forecastId,
        name: category.name || 'Unknown Expense',
        description: `Imported from Puzzle.io - ${category.name}`,
        startDate: new Date(),
        growthRate: 0, // Default growth rate
        initialValue: category.total || 0,
        type: 'recurring', // Default type
        frequency: 'monthly', // Default frequency
        // Other expense attributes would be set here
      });
    }
  }
  
  return expenses;
}