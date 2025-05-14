import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertChatConversationSchema, insertChatMessageSchema } from "../../shared/schema";
import { generateChadResponse, processChadRecommendation } from "../services/openai";
import { ZodError } from "zod";

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

// Get all conversations for the current user
router.get("/conversations", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const conversations = await storage.getChatConversationsByUserId(userId);
    return res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

// Create a new conversation
router.post("/conversations", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const conversationData = {
      ...req.body,
      userId,
    };
    
    const validatedData = insertChatConversationSchema.parse(conversationData);
    const conversation = await storage.createChatConversation(validatedData);
    
    return res.status(201).json(conversation);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Invalid conversation data", errors: error.errors });
    }
    
    console.error("Error creating conversation:", error);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
});

// Get a specific conversation
router.get("/conversations/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const conversation = await storage.getChatConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if the conversation belongs to the current user
    const userId = (req.user as any).id;
    if (conversation.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to access this conversation" });
    }
    
    return res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ message: "Failed to fetch conversation" });
  }
});

// Update a conversation
router.put("/conversations/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const conversation = await storage.getChatConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if the conversation belongs to the current user
    const userId = (req.user as any).id;
    if (conversation.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this conversation" });
    }
    
    const updateData = req.body;
    const updatedConversation = await storage.updateChatConversation(conversationId, updateData);
    
    return res.json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return res.status(500).json({ message: "Failed to update conversation" });
  }
});

// Delete a conversation
router.delete("/conversations/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const conversation = await storage.getChatConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if the conversation belongs to the current user
    const userId = (req.user as any).id;
    if (conversation.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this conversation" });
    }
    
    await storage.deleteChatConversation(conversationId);
    
    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ message: "Failed to delete conversation" });
  }
});

// Get messages for a conversation
router.get("/conversations/:id/messages", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const conversation = await storage.getChatConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if the conversation belongs to the current user
    const userId = (req.user as any).id;
    if (conversation.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to access this conversation" });
    }
    
    const messages = await storage.getChatMessagesByConversationId(conversationId);
    
    return res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Send a message to Chad (the AI assistant)
router.post("/conversations/:id/messages", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const conversation = await storage.getChatConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if the conversation belongs to the current user
    const userId = (req.user as any).id;
    if (conversation.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to message in this conversation" });
    }
    
    // Validate the message data
    const messageData = {
      ...req.body,
      conversationId,
      role: "user"
    };
    
    // Get the user's message content
    const userMessage = req.body.content;
    if (!userMessage) {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    // Generate the AI response
    const assistantResponse = await generateChadResponse(
      userId,
      conversationId,
      userMessage,
      req.body.contextData
    );
    
    // Return the AI response
    return res.json({ response: assistantResponse });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Failed to process message" });
  }
});

// Process a financial recommendation from Chad
router.post("/conversations/:id/recommend", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }
    
    const { forecastId, message } = req.body;
    if (!forecastId || !message) {
      return res.status(400).json({ message: "Forecast ID and message are required" });
    }
    
    const userId = (req.user as any).id;
    
    // Process the recommendation
    const result = await processChadRecommendation(
      userId,
      conversationId,
      message,
      forecastId
    );
    
    return res.json(result);
  } catch (error) {
    console.error("Error processing recommendation:", error);
    return res.status(500).json({ message: "Failed to process recommendation" });
  }
});

export default router;