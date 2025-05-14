import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { storage } from "../storage";
import { type InsertChatMessage, type ChatMessage } from "../../shared/schema";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt that defines Chad's personality and capabilities
const SYSTEM_PROMPT = `
You are Chad, an expert AI financial advisor and CFO assistant. 
Your primary role is to help users manage their financial forecasts, budgets, and projections.

Key responsibilities:
1. Analyze financial data and provide insights
2. Help create and modify revenue streams, expenses, and personnel planning
3. Make recommendations for improving financial performance
4. Answer questions about financial concepts and best practices
5. Assist with budgeting and expense management

When modifying financial data:
- Always confirm important changes before implementing them
- Provide clear explanations for your recommendations
- Be precise with numbers and calculations
- Consider both short-term impacts and long-term sustainability

Personality traits:
- Professional but approachable
- Detail-oriented
- Forward-thinking
- Clear communicator
- Data-driven

Remember that you are an assistant named Chad, and you should refer to yourself as such.
`;

/**
 * Generate a response from the AI assistant
 * @param userId The user's ID
 * @param conversationId The conversation ID
 * @param userMessage The user's message
 * @param contextData Additional context data (e.g., current financial data)
 * @returns The assistant's response
 */
export async function generateChadResponse(
  userId: number,
  conversationId: number,
  userMessage: string,
  contextData?: any
): Promise<string> {
  try {
    // Fetch conversation history (last 10 messages for context)
    const messageHistory = await storage.getChatMessagesByConversationId(
      conversationId,
      10
    );

    // Build messages array for OpenAI API
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add message history
    messageHistory.forEach((message) => {
      messages.push({
        role: message.role as "user" | "assistant",
        content: message.content,
      });
    });

    // Add any context data as system message
    if (contextData) {
      let contextMessage = "Current financial context:\n";
      
      if (contextData.forecast) {
        contextMessage += `\nForecast: ${contextData.forecast.name}\n`;
      }
      
      if (contextData.revenues) {
        contextMessage += "\nRevenue Streams:\n";
        contextData.revenues.forEach((revenue: any) => {
          contextMessage += `- ${revenue.name}: $${revenue.amount} (${revenue.frequency})\n`;
        });
      }
      
      if (contextData.expenses) {
        contextMessage += "\nExpenses:\n";
        contextData.expenses.forEach((expense: any) => {
          contextMessage += `- ${expense.name}: $${expense.amount} (${expense.frequency})\n`;
        });
      }
      
      if (contextData.personnel) {
        contextMessage += "\nPersonnel:\n";
        contextData.personnel.forEach((role: any) => {
          contextMessage += `- ${role.title}: ${role.count} positions, $${role.annualSalary}/year\n`;
        });
      }
      
      messages.push({ role: "system", content: contextMessage });
    }

    // Add the current user message
    messages.push({ role: "user", content: userMessage });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract and return the assistant's response
    const assistantResponse = response.choices[0].message.content || "";

    // Save the user message and assistant response to the database
    const userChatMessage: InsertChatMessage = {
      conversationId,
      role: "user",
      content: userMessage,
    };
    await storage.createChatMessage(userChatMessage);

    const assistantChatMessage: InsertChatMessage = {
      conversationId,
      role: "assistant",
      content: assistantResponse,
    };
    await storage.createChatMessage(assistantChatMessage);

    return assistantResponse;
  } catch (error) {
    console.error("Error generating Chad response:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Process a financial recommendation and apply suggested changes
 * @param userId The user's ID
 * @param conversationId The conversation ID
 * @param userMessage The user's message requesting changes
 * @param forecastId The forecast ID to modify
 * @returns Details of the changes made and the assistant's response
 */
export async function processChadRecommendation(
  userId: number,
  conversationId: number,
  userMessage: string,
  forecastId: number
): Promise<{
  response: string;
  changes: any;
}> {
  try {
    // First, gather context about the forecast
    const forecast = await storage.getForecast(forecastId);
    if (!forecast) {
      throw new Error("Forecast not found");
    }

    // Get current financial data
    const revenues = await storage.getRevenueStreamsByForecastId(forecastId);
    const expenses = await storage.getExpensesByForecastId(forecastId);
    const personnel = await storage.getPersonnelRolesByForecastId(forecastId);

    // Build a specialized prompt for making changes
    const actionPrompt = `
    You are Chad, an AI financial advisor. You need to interpret the user's request and provide instructions for updating their financial model.
    
    Current financial data:
    - Forecast: ${forecast.name}
    - Revenue Streams: ${JSON.stringify(revenues)}
    - Expenses: ${JSON.stringify(expenses)}
    - Personnel: ${JSON.stringify(personnel)}
    
    Based on the user's request, determine what changes need to be made. Return your response as a JSON object with these fields:
    1. "explanation" - A clear explanation for the user about what you're changing and why
    2. "changes" - An array of objects, each representing a change to make with these properties:
       - "action": "add", "update", or "delete"
       - "type": "revenue", "expense", or "personnel"
       - "data": The data to use for the change
    
    Only include changes that are specifically requested or clearly implied by the user's message.
    `;

    // Call OpenAI API with the action prompt
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        { role: "system", content: actionPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2, // Lower temperature for more deterministic, structured results
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    // Extract the response and parse the JSON
    const responseContent = response.choices[0].message.content || "";
    const parsedResponse = JSON.parse(responseContent);

    // Process the changes (in a real implementation, you would apply these changes to the database)
    const changes = processChanges(parsedResponse.changes, forecastId);

    // Save the user message and assistant response to the database
    const userChatMessage: InsertChatMessage = {
      conversationId,
      role: "user",
      content: userMessage,
    };
    await storage.createChatMessage(userChatMessage);

    const assistantChatMessage: InsertChatMessage = {
      conversationId,
      role: "assistant",
      content: parsedResponse.explanation,
      metadata: { changes: parsedResponse.changes },
    };
    await storage.createChatMessage(assistantChatMessage);

    return {
      response: parsedResponse.explanation,
      changes: parsedResponse.changes,
    };
  } catch (error) {
    console.error("Error processing recommendation:", error);
    throw new Error(`Failed to process recommendation: ${error.message}`);
  }
}

/**
 * Process and apply changes to the database
 * @param changes Array of changes to apply
 * @param forecastId The forecast ID
 * @returns Summary of changes applied
 */
async function processChanges(changes: any[], forecastId: number): Promise<any> {
  const results = {
    added: [],
    updated: [],
    deleted: [],
  };

  for (const change of changes) {
    try {
      switch (change.action) {
        case "add":
          if (change.type === "revenue") {
            const revenue = await storage.createRevenueStream({
              ...change.data,
              forecastId,
            });
            results.added.push({ type: "revenue", id: revenue.id });
          } else if (change.type === "expense") {
            const expense = await storage.createExpense({
              ...change.data,
              forecastId,
            });
            results.added.push({ type: "expense", id: expense.id });
          } else if (change.type === "personnel") {
            const personnel = await storage.createPersonnelRole({
              ...change.data,
              forecastId,
            });
            results.added.push({ type: "personnel", id: personnel.id });
          }
          break;

        case "update":
          if (change.type === "revenue" && change.data.id) {
            const revenue = await storage.updateRevenueStream(
              change.data.id,
              change.data
            );
            results.updated.push({ type: "revenue", id: revenue?.id });
          } else if (change.type === "expense" && change.data.id) {
            const expense = await storage.updateExpense(
              change.data.id,
              change.data
            );
            results.updated.push({ type: "expense", id: expense?.id });
          } else if (change.type === "personnel" && change.data.id) {
            const personnel = await storage.updatePersonnelRole(
              change.data.id,
              change.data
            );
            results.updated.push({ type: "personnel", id: personnel?.id });
          }
          break;

        case "delete":
          if (change.type === "revenue" && change.data.id) {
            await storage.deleteRevenueStream(change.data.id);
            results.deleted.push({ type: "revenue", id: change.data.id });
          } else if (change.type === "expense" && change.data.id) {
            await storage.deleteExpense(change.data.id);
            results.deleted.push({ type: "expense", id: change.data.id });
          } else if (change.type === "personnel" && change.data.id) {
            await storage.deletePersonnelRole(change.data.id);
            results.deleted.push({ type: "personnel", id: change.data.id });
          }
          break;
      }
    } catch (error) {
      console.error(`Error processing change: ${JSON.stringify(change)}`, error);
    }
  }

  return results;
}