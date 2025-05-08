import { QueryClient, QueryKey, QueryFunction } from "@tanstack/react-query";

// Define a default query function that will automatically handle
// errors and send along appropriate headers
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  // Get the endpoint to fetch
  const endpoint = queryKey[0];
  
  // Construct options for fetch
  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  
  // Make the request
  const response = await fetch(endpoint as string, options);
  
  // Throw an error if the request failed
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  // Return the data
  return response.json();
};

// Function for making API requests (POST, PATCH, DELETE)
export async function apiRequest(
  endpoint: string,
  method: "POST" | "PATCH" | "DELETE" | "PUT",
  data?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  };
  
  const response = await fetch(endpoint, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  // If the response is 204 No Content, return null
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});