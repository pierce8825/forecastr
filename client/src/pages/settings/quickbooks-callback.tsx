import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useQuickbooks } from "@/hooks/use-quickbooks";

const QuickbooksCallback = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ realmId?: string }>(
    "/settings/quickbooks-callback"
  );
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Demo user ID for MVP
  const userId = 1;
  
  // Get QuickBooks integration handlers
  const { handleOAuthCallback } = useQuickbooks(userId);
  
  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get query parameters from URL
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        const realmId = searchParams.get("realmId");
        const error = searchParams.get("error");
        
        // Handle errors
        if (error) {
          setStatus("error");
          setErrorMessage(`Authorization denied: ${error}`);
          return;
        }
        
        // Validate required parameters
        if (!code || !realmId) {
          setStatus("error");
          setErrorMessage("Missing required parameters for QuickBooks authentication");
          return;
        }
        
        // Process the authorization code
        await handleOAuthCallback(code, realmId);
        setStatus("success");
        
        // Show success toast
        toast({
          title: "QuickBooks Connected",
          description: "Your QuickBooks Online account has been successfully connected.",
        });
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to process QuickBooks authentication");
        
        // Show error toast
        toast({
          title: "Connection Failed",
          description: "Could not connect to QuickBooks Online. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    processAuth();
  }, [handleOAuthCallback, toast]);
  
  const goToSettings = () => {
    setLocation("/settings");
  };
  
  return (
    <>
      <Helmet>
        <title>QuickBooks Connection | FinanceForge</title>
        <meta name="description" content="Complete your QuickBooks Online integration setup" />
      </Helmet>
      
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">QuickBooks Integration</CardTitle>
            <CardDescription>
              {status === "loading" && "Processing your QuickBooks connection..."}
              {status === "success" && "Your QuickBooks account has been successfully connected!"}
              {status === "error" && "There was a problem connecting to QuickBooks"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-6">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <p className="text-center text-muted-foreground">
                  Please wait while we complete the connection process...
                </p>
              </div>
            )}
            
            {status === "success" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Connection Successful</p>
                  <p className="text-sm text-muted-foreground">
                    Your QuickBooks Online account is now connected to FinanceForge.
                    You can now view QuickBooks data in your financial forecasts.
                  </p>
                </div>
              </div>
            )}
            
            {status === "error" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <XCircle className="h-12 w-12 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Connection Failed</p>
                  <p className="text-sm text-muted-foreground">
                    {errorMessage || "We couldn't connect to your QuickBooks account. Please try again."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button onClick={goToSettings}>
              {status === "success" ? "Go to Settings" : "Back to Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default QuickbooksCallback;