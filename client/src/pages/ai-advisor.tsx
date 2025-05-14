import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrainCircuit } from "lucide-react";
import FinancialAdvisor from "@/components/chat/FinancialAdvisor";

const AIAdvisorPage = () => {
  const [selectedForecastId, setSelectedForecastId] = useState<number | null>(null);

  // Get the user ID
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // Fetch forecasts
  const { data: forecasts = [] } = useQuery({
    queryKey: ["/api/forecasts"],
    queryFn: async () => {
      const res = await fetch("/api/forecasts");
      if (!res.ok) throw new Error("Failed to fetch forecasts");
      return res.json();
    },
  });

  return (
    <>
      <Helmet>
        <title>AI Financial Advisor | FinanceForge</title>
        <meta
          name="description"
          content="Get AI-powered financial insights and recommendations for your business"
        />
      </Helmet>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Meet Chad - Your AI Financial Advisor
            </h1>
            <p className="text-muted-foreground">
              Get AI-powered insights, recommendations, and help with your financial planning
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BrainCircuit className="text-primary h-5 w-5" />
            <span className="text-sm font-medium">Powered by GPT-4</span>
          </div>
        </div>

        {forecasts.length > 0 ? (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
              <div className="w-full sm:w-64">
                <Select
                  value={selectedForecastId?.toString() || ""}
                  onValueChange={(value) => setSelectedForecastId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a forecast" />
                  </SelectTrigger>
                  <SelectContent>
                    {forecasts.map((forecast: any) => (
                      <SelectItem key={forecast.id} value={forecast.id.toString()}>
                        {forecast.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Select a forecast to get personalized financial insights
              </p>
            </div>

            {selectedForecastId && user ? (
              <FinancialAdvisor forecastId={selectedForecastId} userId={user.id} />
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Ready to chat with Chad?</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="mb-4">
                    <BrainCircuit className="mx-auto h-12 w-12 text-primary/60" />
                  </div>
                  <p className="mb-4">
                    Please select a forecast to start getting AI-powered financial insights and
                    advice.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>No Forecasts Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <p className="mb-4">
                Create a forecast to start using Chad, your AI financial advisor.
              </p>
              <Button>Create Your First Forecast</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default AIAdvisorPage;