import OAuthClient from 'intuit-oauth';
import QuickBooks from 'node-quickbooks';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { quickbooksIntegrations } from '@shared/schema';

// QuickBooks API configuration
const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID!;
const QB_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET!;

// Determine the base URL for the application (works in both local and Replit environments)
const getBaseUrl = () => {
  if (process.env.REPLIT_SLUG) {
    return `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_OWNER}.repl.co`;
  }
  return 'http://localhost:5000';
};

const QB_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || `${getBaseUrl()}/api/quickbooks/callback`;
const QB_ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';

// Create OAuth client
const oauthClient = new OAuthClient({
  clientId: QB_CLIENT_ID,
  clientSecret: QB_CLIENT_SECRET,
  environment: QB_ENVIRONMENT,
  redirectUri: QB_REDIRECT_URI,
});

/**
 * Get the authorization URL for QuickBooks OAuth
 */
export function getAuthorizationUrl() {
  const authUri = oauthClient.authorizeUri({
    scope: ['com.intuit.quickbooks.accounting'], // Accounting scope for QuickBooks API
    state: 'testState',
  });
  return authUri;
}

/**
 * Handle the OAuth callback and save the tokens
 */
export async function handleOAuthCallback(url: string, userId: number) {
  try {
    const authResponse = await oauthClient.createToken(url);
    const token = authResponse.getJson();

    // Save tokens to the database
    const existingIntegration = await db.select()
      .from(quickbooksIntegrations)
      .where(eq(quickbooksIntegrations.userId, userId));

    if (existingIntegration.length > 0) {
      // Update existing integration
      await db.update(quickbooksIntegrations)
        .set({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          realmId: token.realmId,
          expiresAt: new Date(Date.now() + token.expires_in * 1000),
          updatedAt: new Date(),
        })
        .where(eq(quickbooksIntegrations.userId, userId));
    } else {
      // Create new integration
      await db.insert(quickbooksIntegrations)
        .values({
          userId,
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          realmId: token.realmId,
          expiresAt: new Date(Date.now() + token.expires_in * 1000),
        });
    }

    return { 
      success: true, 
      realmId: token.realmId 
    };
  } catch (error) {
    console.error('QuickBooks OAuth error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create a QuickBooks API client with valid tokens
 */
export async function createQBClient(userId: number) {
  // Get the integration record from the database
  const [integration] = await db.select()
    .from(quickbooksIntegrations)
    .where(eq(quickbooksIntegrations.userId, userId));

  if (!integration) {
    throw new Error('QuickBooks integration not found for user');
  }

  // Check if token is expired and refresh if needed
  if (integration.expiresAt && new Date() > integration.expiresAt) {
    const refreshResult = await refreshTokens(integration.refreshToken!, userId);
    if (!refreshResult.success) {
      throw new Error('Failed to refresh QuickBooks tokens');
    }
  }

  // Get the latest integration record
  const [updatedIntegration] = await db.select()
    .from(quickbooksIntegrations)
    .where(eq(quickbooksIntegrations.userId, userId));

  // Create QuickBooks API client
  const qbo = new QuickBooks(
    QB_CLIENT_ID,
    QB_CLIENT_SECRET,
    updatedIntegration.accessToken!,
    false, // no OAuth version 1.0
    updatedIntegration.realmId!,
    QB_ENVIRONMENT === 'production' ? false : true, // sandbox?
    true, // debug
    null, // custom headers
    '2.0', // OAuth version
    updatedIntegration.refreshToken!
  );

  return qbo;
}

/**
 * Refresh QuickBooks tokens
 */
export async function refreshTokens(refreshToken: string, userId: number) {
  try {
    oauthClient.setToken({
      refresh_token: refreshToken,
    });

    const authResponse = await oauthClient.refresh();
    const token = authResponse.getJson();

    // Update tokens in the database
    await db.update(quickbooksIntegrations)
      .set({
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(Date.now() + token.expires_in * 1000),
        updatedAt: new Date(),
      })
      .where(eq(quickbooksIntegrations.userId, userId));

    return { success: true };
  } catch (error) {
    console.error('Error refreshing QuickBooks tokens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Disconnect QuickBooks integration for a user
 */
export async function disconnectQuickbooks(userId: number) {
  try {
    const [integration] = await db.select()
      .from(quickbooksIntegrations)
      .where(eq(quickbooksIntegrations.userId, userId));

    if (integration && integration.accessToken) {
      // Revoke access token
      oauthClient.setToken({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken || '',
      });
      
      try {
        await oauthClient.revoke({
          token: integration.accessToken,
        });
      } catch (revokeError) {
        console.error('Error revoking token:', revokeError);
        // Continue with deletion even if revoke fails
      }
    }

    // Remove integration from database
    await db.delete(quickbooksIntegrations)
      .where(eq(quickbooksIntegrations.userId, userId));

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting QuickBooks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get a list of accounts from QuickBooks
 */
export async function getAccounts(userId: number) {
  try {
    const qbo = await createQBClient(userId);
    
    return new Promise<any>((resolve, reject) => {
      qbo.findAccounts({}, (err: Error | null, accounts: any) => {
        if (err) {
          return reject(err);
        }
        resolve(accounts);
      });
    });
  } catch (error) {
    console.error('Error getting QuickBooks accounts:', error);
    throw error;
  }
}

/**
 * Get a list of income accounts from QuickBooks
 */
export async function getIncomeAccounts(userId: number) {
  try {
    const accounts = await getAccounts(userId);
    return accounts.QueryResponse.Account.filter(
      (account: any) => account.AccountType === 'Income'
    );
  } catch (error) {
    console.error('Error getting QuickBooks income accounts:', error);
    throw error;
  }
}

/**
 * Get a list of expense accounts from QuickBooks
 */
export async function getExpenseAccounts(userId: number) {
  try {
    const accounts = await getAccounts(userId);
    return accounts.QueryResponse.Account.filter(
      (account: any) => account.AccountType === 'Expense' || account.AccountType === 'Cost of Goods Sold'
    );
  } catch (error) {
    console.error('Error getting QuickBooks expense accounts:', error);
    throw error;
  }
}

/**
 * Get profit and loss report from QuickBooks
 */
export async function getProfitAndLoss(userId: number, startDate: string, endDate: string) {
  try {
    const qbo = await createQBClient(userId);
    
    return new Promise<any>((resolve, reject) => {
      qbo.reportProfitAndLoss({
        start_date: startDate,
        end_date: endDate,
      }, (err: Error | null, report: any) => {
        if (err) {
          return reject(err);
        }
        resolve(report);
      });
    });
  } catch (error) {
    console.error('Error getting QuickBooks profit and loss report:', error);
    throw error;
  }
}

/**
 * Get balance sheet report from QuickBooks
 */
export async function getBalanceSheet(userId: number, date: string) {
  try {
    const qbo = await createQBClient(userId);
    
    return new Promise<any>((resolve, reject) => {
      qbo.reportBalanceSheet({
        report_date: date,
      }, (err: Error | null, report: any) => {
        if (err) {
          return reject(err);
        }
        resolve(report);
      });
    });
  } catch (error) {
    console.error('Error getting QuickBooks balance sheet report:', error);
    throw error;
  }
}

/**
 * Get cash flow report from QuickBooks
 */
export async function getCashFlow(userId: number, startDate: string, endDate: string) {
  try {
    const qbo = await createQBClient(userId);
    
    return new Promise<any>((resolve, reject) => {
      qbo.reportCashFlow({
        start_date: startDate,
        end_date: endDate,
      }, (err: Error | null, report: any) => {
        if (err) {
          return reject(err);
        }
        resolve(report);
      });
    });
  } catch (error) {
    console.error('Error getting QuickBooks cash flow report:', error);
    throw error;
  }
}

/**
 * Get general ledger report from QuickBooks
 */
export async function getGeneralLedger(userId: number, startDate: string, endDate: string) {
  try {
    const qbo = await createQBClient(userId);
    
    return new Promise<any>((resolve, reject) => {
      qbo.reportGeneralLedger({
        start_date: startDate,
        end_date: endDate,
      }, (err: Error | null, report: any) => {
        if (err) {
          return reject(err);
        }
        resolve(report);
      });
    });
  } catch (error) {
    console.error('Error getting QuickBooks general ledger report:', error);
    throw error;
  }
}

/**
 * Check if a user has a valid QuickBooks integration
 */
export async function hasValidIntegration(userId: number) {
  try {
    const [integration] = await db.select()
      .from(quickbooksIntegrations)
      .where(eq(quickbooksIntegrations.userId, userId));

    return !!integration && !!integration.accessToken;
  } catch (error) {
    console.error('Error checking QuickBooks integration validity:', error);
    return false;
  }
}