import { useState, useRef, useEffect } from "react";
import { Send, Plus, ArrowRight, Lightbulb, TrendingUp, CreditCard, Users, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChadAvatar } from "./ChadAvatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  metadata?: any;
  createdAt?: string;
}

interface ChatInterfaceProps {
  forecastId?: number;
  onFinancialUpdate?: (changes: any) => void;
}

export default function ChatInterface({ forecastId, onFinancialUpdate }: ChatInterfaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [processing, setProcessing] = useState(false);
  const [newConversationName, setNewConversationName] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
  
  // Template prompts for common financial changes
  const templatePrompts = {
    revenue: [
      {
        title: "Add Subscription Revenue",
        prompt: "Add a new SaaS subscription revenue stream of $4,500 per month with an expected annual growth rate of 8%.",
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        title: "Add One-time Revenue",
        prompt: "Add a one-time revenue item of $25,000 for consulting services in Q3.",
        icon: <DollarSign className="h-4 w-4" />
      },
      {
        title: "Add Service Revenue",
        prompt: "Add a new service revenue stream for web development at $150/hour with an estimated 80 hours per month.",
        icon: <TrendingUp className="h-4 w-4" />
      }
    ],
    expenses: [
      {
        title: "Add Marketing Expense",
        prompt: "Add a new marketing expense of $3,000 per month for digital ads.",
        icon: <CreditCard className="h-4 w-4" />
      },
      {
        title: "Add Software Expense",
        prompt: "Add a new software expense of $200 per month for project management tools.",
        icon: <CreditCard className="h-4 w-4" />
      },
      {
        title: "Add Office Expense",
        prompt: "Add a new office rent expense of $5,500 per month with a 3% annual increase.",
        icon: <CreditCard className="h-4 w-4" />
      }
    ],
    personnel: [
      {
        title: "Add Developer Role",
        prompt: "Add a new software developer role with an annual salary of $120,000 plus 20% benefits.",
        icon: <Users className="h-4 w-4" />
      },
      {
        title: "Add Marketing Role",
        prompt: "Add a new marketing manager role with an annual salary of $85,000 plus 18% benefits.",
        icon: <Users className="h-4 w-4" />
      },
      {
        title: "Add Sales Role",
        prompt: "Add two new sales representatives with annual salaries of $75,000 each plus 15% benefits and 5% commission.",
        icon: <Users className="h-4 w-4" />
      }
    ],
    optimization: [
      {
        title: "Request Cost Analysis",
        prompt: "Analyze my current expenses and suggest areas where I could reduce costs without impacting growth.",
        icon: <Lightbulb className="h-4 w-4" />
      },
      {
        title: "Revenue Optimization",
        prompt: "Based on my current revenue streams, what opportunities do you see for increasing revenue or improving pricing?",
        icon: <Lightbulb className="h-4 w-4" />
      },
      {
        title: "Staffing Efficiency",
        prompt: "Analyze my current personnel costs and suggest any optimizations for my staffing plan.",
        icon: <Lightbulb className="h-4 w-4" />
      }
    ]
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/chat/conversations"],
    onError: () => toast({
      title: "Error fetching conversations",
      description: "Failed to load your conversation history",
      variant: "destructive",
    }),
  });

  // Fetch messages for active conversation
  const { data: fetchedMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/chat/conversations", activeConversation, "messages"],
    queryFn: async () => {
      if (!activeConversation) return [];
      const res = await fetch(`/api/chat/conversations/${activeConversation}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!activeConversation,
  });

  // Update messages when fetched
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Create new conversation mutation
  const createConversation = useMutation({
    mutationFn: async (data: { name: string, forecastId?: number }) => {
      return apiRequest("/api/chat/conversations", "POST", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setActiveConversation(data.id);
      setIsCreatingConversation(false);
      setNewConversationName("");
      toast({
        title: "Conversation created",
        description: "You can now start chatting with Chad",
      });
    },
    onError: () => {
      toast({
        title: "Error creating conversation",
        description: "Failed to create a new conversation",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!activeConversation) throw new Error("No active conversation");
      return apiRequest(`/api/chat/conversations/${activeConversation}/messages`, "POST", {
        content: message,
        ...(forecastId ? { contextData: { forecastId } } : {}),
      });
    },
    onSuccess: (data) => {
      // Add user message and AI response
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input } as Message,
        { role: "assistant", content: data.response } as Message,
      ]);
      setInput("");
      setProcessing(false);
      
      // If there are financial changes and a handler was provided
      if (data.changes && onFinancialUpdate) {
        onFinancialUpdate(data.changes);
      }
      
      // Refetch messages to get the updated list from the server
      refetchMessages();
    },
    onError: () => {
      setProcessing(false);
      toast({
        title: "Error sending message",
        description: "Failed to communicate with Chad",
        variant: "destructive",
      });
    },
  });

  // Handle submitting a new message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || processing) return;

    setProcessing(true);
    sendMessage.mutate(input);
  };

  // Handle creating a new conversation
  const handleCreateConversation = () => {
    if (!newConversationName.trim()) {
      toast({
        title: "Conversation name required",
        description: "Please enter a name for your conversation",
        variant: "destructive",
      });
      return;
    }

    createConversation.mutate({
      name: newConversationName,
      forecastId,
    });
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Introduce Chad when no messages
  useEffect(() => {
    if (activeConversation && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello, I'm Chad, your financial advisor. How can I help with your forecasts and financial planning today?",
        },
      ]);
    }
  }, [activeConversation, messages.length]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chat with Chad, your AI CFO</h2>
        {!isCreatingConversation && (
          <Button 
            onClick={() => setIsCreatingConversation(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        )}
      </div>
      
      {isCreatingConversation ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>New Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="conversation-name" className="text-sm font-medium mb-1 block">
                  Conversation Name
                </label>
                <Input
                  id="conversation-name"
                  value={newConversationName}
                  onChange={(e) => setNewConversationName(e.target.value)}
                  placeholder="e.g., Q2 Budget Planning"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreatingConversation(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConversation}
              disabled={createConversation.isPending}
            >
              Create
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-1 overflow-auto max-h-[200px] lg:max-h-none">
            <div className="space-y-2">
              {conversations.length > 0 ? (
                conversations.map((conv: any) => (
                  <div
                    key={conv.id}
                    className={`
                      p-2 rounded-md cursor-pointer flex items-center
                      ${activeConversation === conv.id ? "bg-primary/10" : "hover:bg-muted"}
                    `}
                    onClick={() => setActiveConversation(conv.id)}
                  >
                    <div className="truncate flex-1">{conv.name}</div>
                    {activeConversation === conv.id && (
                      <ArrowRight className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  No conversations yet. Create one to get started.
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {activeConversation ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {conversations.find((c: any) => c.id === activeConversation)?.name || "Chat"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            message.role === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <ChadAvatar />
                          ) : (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            
                            {message.metadata && message.metadata.changes && (
                              <div className="mt-2 text-xs border-t pt-2">
                                <strong>Changes made:</strong>
                                <ul className="list-disc list-inside">
                                  {message.metadata.changes.map((change: any, idx: number) => (
                                    <li key={idx}>
                                      {change.action} {change.type}: {change.data.name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Chad about your finances..."
                        className="flex-1 min-h-[60px] max-h-[120px]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!input.trim() || processing}
                        className="h-[60px] w-[60px]"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <h3 className="text-lg font-semibold mb-2">
                    Select a conversation or create a new one
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Chat with Chad to get insights and help with your financial planning.
                  </p>
                  <Button onClick={() => setIsCreatingConversation(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start a conversation
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}