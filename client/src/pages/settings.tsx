import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AccountsList } from '@/components/puzzle/accounts-list';
import { FinancialReport, ReportType } from '@/components/puzzle/financial-report';
import { usePuzzle, PuzzleIntegrationResponse } from '@/hooks/use-puzzle';
import { debugFormulas } from '@/lib/formula-debugger';
import { validateAllFormulas } from '@/lib/navigation-validator';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const { isAuthorized, isConnecting, isLoading, integration, connectPuzzle, disconnectPuzzle } = usePuzzle();
  const { toast } = useToast();
  // Explicitly define the type for the integration data
  const puzzleIntegration: {
    id?: number;
    userId?: number;
    workspaceId?: string;
    lastSync?: string;
    createdAt?: string;
    updatedAt?: string;
    success?: boolean;
  } = integration || {};

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
              <CardTitle>Puzzle.io Integration</CardTitle>
              <CardDescription>
                Connect your Puzzle.io account to import transactions, accounts, and financial data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthorized ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Connected to Puzzle.io</p>
                      <p className="text-xs text-muted-foreground">
                        {puzzleIntegration?.lastSync ? 
                          `Last synced: ${new Date(puzzleIntegration.lastSync).toLocaleString()}` : 
                          'Not synced yet'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={disconnectPuzzle}
                      size="sm"
                    >
                      Disconnect
                    </Button>
                  </div>

                  <AccountsList workspaceId={puzzleIntegration?.workspaceId || ''} />
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Connect to Puzzle.io</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Connect your Puzzle.io account to automatically import your financial data, including accounts, transactions, and reports.
                  </p>
                  
                  <div className="mt-6 w-full max-w-md space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input 
                        id="api-key" 
                        placeholder="Enter your Puzzle.io API key" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workspace-id">Workspace ID</Label>
                      <Input 
                        id="workspace-id" 
                        placeholder="Enter your Puzzle.io workspace ID" 
                        value={workspaceId}
                        onChange={(e) => setWorkspaceId(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      onClick={() => connectPuzzle(apiKey, workspaceId)}
                      className="w-full"
                      disabled={isConnecting || !apiKey || !workspaceId}
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Puzzle.io'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isAuthorized && (
            <>
              <FinancialReport 
                workspaceId={puzzleIntegration?.workspaceId || ''}
                reportType={ReportType.PROFIT_AND_LOSS}
              />
              
              <FinancialReport 
                workspaceId={puzzleIntegration?.workspaceId || ''}
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

          <Card>
            <CardHeader>
              <CardTitle>Formula Validation</CardTitle>
              <CardDescription>
                Validate all formulas in your financial models to prevent calculation errors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use these tools to check your formulas for errors, circular references, or invalid entities.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    const result = debugFormulas();
                    setDebugResult(result);
                    toast({
                      title: "Formula Debugging Complete",
                      description: `Found ${result.invalidFormulas.length} invalid formulas out of ${result.entitiesWithFormulas} total formulas.`,
                    });
                  }}
                >
                  Debug All Formulas
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => {
                    const isValid = validateAllFormulas();
                    toast({
                      title: isValid ? "All Formulas Valid" : "Invalid Formulas Found",
                      description: isValid 
                        ? "All formulas passed validation checks." 
                        : "Some formulas have errors or circular references. Check the console for details.",
                      variant: isValid ? "default" : "destructive",
                    });
                  }}
                >
                  Validate All Formulas
                </Button>
              </div>
              
              {debugResult && (
                <div className="mt-4 p-4 border rounded-md bg-slate-50">
                  <h3 className="text-sm font-medium mb-2">Debug Results</h3>
                  <div className="space-y-2 text-sm">
                    <p>Total entities: {debugResult.totalEntities}</p>
                    <p>Entities with formulas: {debugResult.entitiesWithFormulas}</p>
                    <p>Circular dependencies: {debugResult.hasCircularDependencies ? 'Yes' : 'No'}</p>
                    <p>Invalid formulas: {debugResult.invalidFormulas.length}</p>
                  </div>
                  {debugResult.invalidFormulas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-red-600 mb-1">Invalid Formulas:</p>
                      <ul className="text-xs space-y-1">
                        {debugResult.invalidFormulas.map((entity: any, index: number) => (
                          <li key={index} className="text-red-600">
                            {entity.type} {entity.id} ({entity.name}): {entity.formula}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}