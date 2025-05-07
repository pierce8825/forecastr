import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RefreshCw, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuickbooks } from "@/hooks/use-quickbooks";
import { useLocation } from "wouter";

const QuickbooksWidget = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Demo user ID for MVP
  const userId = 1;
  
  // Use QuickBooks hook to get connection status
  const {
    integration,
    isConnected,
    connectQuickbooks,
    isPending,
    isLoading
  } = useQuickbooks(userId);
  
  // Format date
  const formatDate = (date: string | Date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  // Handle refreshing QuickBooks data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // In a real implementation, this would refresh the data from QuickBooks
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Data Refreshed",
        description: "Your QuickBooks data has been refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh QuickBooks data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle connecting to QuickBooks
  const handleConnect = async () => {
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
  
  // Go to settings page
  const goToSettings = () => {
    setLocation("/settings");
  };
  
  // Sample QuickBooks data for the widget
  const quickbooksData = {
    comparisons: [
      {
        label: "Revenue",
        actual: 124000,
        forecasted: 120000,
        variance: 3.33,
        positive: true
      },
      {
        label: "Expenses",
        actual: 78500,
        forecasted: 85000,
        variance: 7.65,
        positive: true
      },
      {
        label: "Net Profit",
        actual: 45500,
        forecasted: 35000,
        variance: 30.0,
        positive: true
      }
    ],
    lastUpdated: integration?.updatedAt || new Date()
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">QuickBooks Integration</CardTitle>
            <CardDescription>
              Compare forecasts with actuals
            </CardDescription>
          </div>
          {isConnected && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
            >
              <RefreshCw 
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {quickbooksData.comparisons.map((comparison, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <span className="font-medium">{comparison.label}</span>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-muted-foreground mr-2">
                        Actual: {formatCurrency(comparison.actual)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Forecast: {formatCurrency(comparison.forecasted)}
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={comparison.positive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                  >
                    {comparison.positive ? '+' : '-'}{comparison.variance.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>Last updated: {formatDate(quickbooksData.lastUpdated)}</span>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs" 
                onClick={goToSettings}
              >
                Settings <Settings className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
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
            
            <div className="text-center space-y-2">
              <h3 className="font-medium">Connect QuickBooks Online</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Link your QuickBooks Online account to compare your financial forecast with your actual accounting data.
              </p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isPending || isLoading}
              className="mt-2"
            >
              Connect Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickbooksWidget;