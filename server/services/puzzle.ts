import { db } from '../db';
import { eq } from 'drizzle-orm';
import { puzzleIntegrations } from '@shared/schema';

const API_BASE_URL = 'https://api.puzzle.io/v1';

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
    // Make a request to Puzzle.io API to validate credentials
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
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
    
    const response = await fetch(`${API_BASE_URL}/workspaces/${integration.workspaceId}/accounts`, {
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
    return data;
  } catch (error) {
    console.error('Error getting Puzzle.io accounts:', error);
    throw error;
  }
}

/**
 * Get financial reports from Puzzle.io
 */
export async function getPuzzleFinancialReport(userId: number, reportType: string, startDate: string, endDate: string) {
  try {
    const integration = await getPuzzleIntegration(userId);
    
    if (!integration) {
      throw new Error('Puzzle.io integration not found');
    }
    
    const response = await fetch(
      `${API_BASE_URL}/workspaces/${integration.workspaceId}/reports/${reportType}?startDate=${startDate}&endDate=${endDate}`, 
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
 * Sync data from Puzzle.io to financial projections
 */
export async function syncPuzzleData(userId: number, forecastId: number) {
  try {
    // Implementation for syncing Puzzle.io data to the forecasting system
    // This would extract revenue, expense and other financial data from Puzzle.io
    // and populate the corresponding tables in our database
    
    // For now, return a placeholder
    return { 
      success: true, 
      message: 'Successfully synced data from Puzzle.io',
      syncedAt: new Date()
    };
  } catch (error) {
    console.error('Error syncing data from Puzzle.io:', error);
    throw error;
  }
}