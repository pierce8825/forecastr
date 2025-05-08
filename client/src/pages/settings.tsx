import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AccountsList } from '@/components/quickbooks/accounts-list';
import { FinancialReport, ReportType } from '@/components/quickbooks/financial-report';
import { useQuickbooks } from '@/hooks/use-quickbooks';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { isAuthorized, isAuthorizing, integration, authorizeQuickbooks, disconnectQuickbooks } = useQuickbooks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and how we can reach you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Personal information settings will be added here.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Display & Accessibility</CardTitle>
              <CardDescription>
                Customize how FinancialForecast looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Display settings will be added here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>QuickBooks Online</CardTitle>
              <CardDescription>
                Connect your QuickBooks Online account to import transactions, accounts, and financial data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthorized ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Connected to QuickBooks Online</p>
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(integration?.updatedAt || '').toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={disconnectQuickbooks}
                      size="sm"
                    >
                      Disconnect
                    </Button>
                  </div>

                  <AccountsList realmId={integration?.realmId || ''} />
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Connect to QuickBooks Online</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Connect your QuickBooks Online account to automatically import your financial data, including accounts, transactions, and reports.
                  </p>
                  <Button 
                    onClick={authorizeQuickbooks} 
                    className="mt-4"
                    disabled={isAuthorizing}
                  >
                    {isAuthorizing ? 'Connecting...' : 'Connect QuickBooks'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isAuthorized && (
            <>
              <FinancialReport 
                realmId={integration?.realmId || ''}
                reportType={ReportType.PROFIT_AND_LOSS}
              />
              
              <FinancialReport 
                realmId={integration?.realmId || ''}
                reportType={ReportType.BALANCE_SHEET}
              />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you receive and how.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notification settings will be added here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Security settings will be added here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}