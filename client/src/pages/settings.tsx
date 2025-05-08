import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import { useQuickbooks } from "@/hooks/use-quickbooks";
import { Badge } from "@/components/ui/badge";
import { QuickbooksAccountsList } from "@/components/quickbooks/accounts-list";
import { QuickbooksFinancialReport } from "@/components/quickbooks/financial-report";
import { useLocation } from "wouter";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Parse search params from location
  const getSearchParams = () => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    return searchParams;
  };
  
  // Demo user ID for MVP
  const userId = 1;
  
  // Get QuickBooks integration status
  const {
    integration,
    isConnected,
    connectQuickbooks,
    disconnectQuickbooks,
    isPending,
    isLoading
  } = useQuickbooks(userId);
  
  // Format date for last connected
  const formatDate = (date: string | Date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  // Handle QuickBooks connection
  const handleConnectQuickbooks = async () => {
    try {
      await connectQuickbooks();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect to QuickBooks Online",
        variant: "destructive",
      });
    }
  };
  
  // Handle QuickBooks disconnection
  const handleDisconnectQuickbooks = async () => {
    try {
      await disconnectQuickbooks();
      toast({
        title: "Successfully disconnected",
        description: "QuickBooks Online integration has been removed",
      });
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: "Could not disconnect from QuickBooks Online",
        variant: "destructive",
      });
    }
  };

  // Check for OAuth callback status
  useEffect(() => {
    const searchParams = getSearchParams();
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    const tab = searchParams.get("tab");
    
    if (tab === "integrations") {
      setActiveTab("integrations");
    }
    
    if (status === "success") {
      toast({
        title: "Connection successful",
        description: "Successfully connected to QuickBooks Online",
      });
    } else if (status === "error") {
      toast({
        title: "Connection failed",
        description: message || "Could not connect to QuickBooks Online",
        variant: "destructive",
      });
    }
  }, [location, toast]);
  
  return (
    <>
      <Helmet>
        <title>Settings | FinanceForge</title>
        <meta name="description" content="Configure your account settings, manage integrations, and customize your financial dashboard." />
      </Helmet>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and integrations</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">User Details</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Username</p>
                        <p>demo</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>demo@example.com</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Company</p>
                        <p>Demo Company</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                        <p>Business</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline">Edit Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Accounting Integrations</CardTitle>
                <CardDescription>Connect your financial data for real-time comparisons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="28" height="28">
                          <path fill="#2CA01C" d="M159.4 0H32.2v313.9h127.1V0z"/>
                          <path fill="#57BA47" d="M307.1 0H159.4v313.9h147.7V0z"/>
                          <path fill="#38AB21" d="M479.8 0H307.1v313.9h172.7V0z"/>
                          <path fill="#89DF8F" d="M32.2 354.2H97V512H32.2z"/>
                          <path fill="#57BA47" d="M97 354.2h85.2V512H97z"/>
                          <path fill="#2CA01C" d="M182.2 354.2h85.2V512h-85.2z"/>
                          <path fill="#89DF8F" d="M267.4 354.2h104.2V512H267.4z"/>
                          <path fill="#57BA47" d="M371.6 354.2h108.2V512H371.6z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">QuickBooks Online</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect to your QuickBooks Online account to import transactions, expenses, and revenue.
                        </p>
                        <div className="mt-2 space-x-2 flex">
                          {isConnected ? (
                            <Badge variant="outline" className="flex items-center bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center bg-amber-50 text-amber-700 border-amber-200">
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              Not Connected
                            </Badge>
                          )}
                          
                          {integration && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Last updated: {formatDate(integration.updatedAt)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {isConnected ? (
                        <Button 
                          variant="outline" 
                          onClick={handleDisconnectQuickbooks}
                          disabled={isPending || isLoading}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleConnectQuickbooks}
                          disabled={isPending || isLoading}
                        >
                          Connect <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {isConnected && (
                    <div className="space-y-6">
                      <div className="p-4 border rounded-lg bg-muted/40">
                        <h4 className="font-medium mb-2">Connected Account Details</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Company ID:</span>
                            <span className="font-mono">{integration?.realmId || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Connected on:</span>
                            <span>{formatDate(integration?.createdAt || new Date())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Token expires:</span>
                            <span>{formatDate(integration?.expiresAt || new Date())}</span>
                          </div>
                          <div className="mt-3 text-right">
                            <a 
                              href={`https://app.qbo.intuit.com/app/homepage`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary inline-flex items-center text-sm hover:underline"
                            >
                              Open QuickBooks Online <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <QuickbooksAccountsList userId={userId} />
                      <QuickbooksFinancialReport userId={userId} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">General Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure general application preferences</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-muted-foreground text-sm">Preference settings will be implemented in a future update.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Settings;