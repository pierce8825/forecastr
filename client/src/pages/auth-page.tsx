import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Define form schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  companyName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Login form handling
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form handling
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
    },
  });
  
  // Redirect if user is already logged in - moved after hook definitions
  // to ensure hooks are always called in the same order
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Early return after all hooks have been called
  if (user) {
    return null;
  }

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
          variant: "default",
        });
        navigate("/");
      },
    });
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword before submitting
    const { confirmPassword, ...registerData } = values;

    registerMutation.mutate(
      {
        username: values.email, // Use email as username
        email: values.email,
        password: values.password,
        companyName: values.companyName || null,
      },
      {
        onSuccess: () => {
          toast({
            title: "Registration successful",
            description: "Your account has been created successfully.",
            variant: "default",
          });
          navigate("/");
        },
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Login or Register | FinanceForge</title>
        <meta name="description" content="Login or register for a new account" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left column: Auth forms */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Welcome to FinanceForge</CardTitle>
              <CardDescription className="text-center">
                {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters with uppercase letter and a number.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-gray-500">
              {activeTab === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <Button variant="link" onClick={() => setActiveTab("register")} className="p-0">
                    Register
                  </Button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Button variant="link" onClick={() => setActiveTab("login")} className="p-0">
                    Login
                  </Button>
                </p>
              )}
            </CardFooter>
          </Card>

          {/* Right column: Hero section */}
          <div className="hidden md:flex flex-col space-y-6">
            <h1 className="text-3xl font-bold text-primary">Comprehensive Financial Forecasting</h1>
            <p className="text-lg text-gray-700">
              Plan, track, and optimize your business finances with powerful modeling and intelligent insights.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium">Multiple Subaccounts</h3>
                  <p className="text-sm text-gray-500">Manage different companies or projects separately.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium">Revenue & Expense Tracking</h3>
                  <p className="text-sm text-gray-500">Detailed budgeting and comprehensive financial management.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium">Payroll Processing</h3>
                  <p className="text-sm text-gray-500">Handle employee onboarding and compensation management.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}