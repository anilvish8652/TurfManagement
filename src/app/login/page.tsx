
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ToyBrick } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username or email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    console.log("Attempting to login via proxy with:", { username: data.username, password: "REDACTED_FOR_LOGS" });
    // Using the Next.js proxy path
    const apiEndpoint = '/api-proxy/Auth/Login'; 
    const requestHeaders: HeadersInit = {
      'accept': 'text/plain', // Reinstating this header to match cURL
      'Content-Type': 'application/json',
    };
    console.log("API Endpoint (via proxy):", apiEndpoint);
    console.log("Request Headers:", requestHeaders);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      console.log("Proxy fetch response status:", response.status);
      console.log("Proxy fetch response ok:", response.ok);

      if (response.ok) {
        // Try to parse as JSON, but if it fails (e.g. API returns plain text token), try to read as text.
        let result;
        const responseText = await response.text(); // Read as text first
        try {
            result = JSON.parse(responseText); // Try to parse as JSON
        } catch (jsonError) {
            // If JSON parsing fails, it might be a plain text token
            console.warn("Could not parse login response as JSON. Assuming plain text token from proxy. Response text:", responseText);
            // Basic check for JWT-like string. Adjust if your token has a different format.
            if (typeof responseText === 'string' && responseText.includes('.')) { 
                 result = { token: responseText, isValidUser: true, message: "Login successful (inferred from text token via proxy)." };
            } else {
                throw new Error("Login response via proxy was successful but not valid JSON and could not be inferred as a token.");
            }
        }
        
        console.log("API Login Result (via proxy):", result);

        if (result && result.isValidUser && result.token) {
          localStorage.setItem('authToken', result.token);
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          router.push("/dashboard");
        } else {
          toast({
            title: "Login Failed",
            description: result.message || "Invalid username or password, or user not valid (via proxy).",
            variant: "destructive",
          });
        }
      } else {
        let errorBody = "Could not read error body from proxy response.";
        try {
            errorBody = await response.text(); 
            // Attempt to parse if it looks like JSON, otherwise use the text
            if (errorBody.trim().startsWith('{') && errorBody.trim().endsWith('}')) {
              try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson && errorJson.message) { 
                  errorBody = errorJson.message;
                } else if (typeof errorJson === 'object' && errorJson !== null) { 
                  // If no 'message' field, stringify the whole JSON object for more context
                  errorBody = JSON.stringify(errorJson);
                }
              } catch (jsonParseError) {
                // It wasn't JSON, use the raw text
                console.warn("Could not parse error body from proxy as JSON, using raw text:", jsonParseError);
              }
            }
        } catch (e) {
            console.error("Failed to read error body from proxy as text:", e);
        }
        console.error("Login API (via proxy) responded with an error:", response.status, errorBody);
        
        let toastDescription = `Server responded with ${response.status} (via proxy).`;
        const displayErrorBody = errorBody.length > 150 ? errorBody.substring(0, 150) + "..." : errorBody; 

        if (response.status === 500) {
          toastDescription = `An internal server error occurred on the API (500 via proxy). Please check the API server logs. (Details: ${displayErrorBody})`;
        } else if (displayErrorBody && !displayErrorBody.toLowerCase().includes("internal server error")) { 
            // Avoid duplicating "internal server error" if already in errorBody
            toastDescription += ` ${displayErrorBody}`;
        }

        toast({
          title: "Login Failed",
          description: toastDescription,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login API request (via proxy) failed. Full error object:", error);
      let userMessage = "An unexpected error occurred during login (via proxy). Please try again later.";

      if (error instanceof TypeError && (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror'))) {
        // This error message might now refer to the Next.js dev server if the proxy itself fails
        userMessage = "Network error: Failed to fetch the login API via proxy. This could be due to a network issue, the API server being unavailable, or the proxy configuration. Please check your internet connection, the Next.js server console, and the browser console for more details.";
        console.warn(
          "A 'Failed to fetch' error occurred when using the proxy. This might mean the Next.js dev server couldn't reach https://api.classic7turf.com. Check the Next.js server console for errors related to the proxy destination."
        );
      } else if (error instanceof Error) {
        userMessage = `Login error (via proxy): ${error.message}`;
      }
      
      toast({
        title: "Login Failed",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <ToyBrick className="h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-primary">Classic7</h1>
        <p className="text-muted-foreground">Welcome back! Please sign in to continue.</p>
      </div>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username or email below to login to your account.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username or Email</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="your_username or name@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                <Link href="#" className="underline text-muted-foreground hover:text-primary">
                  Forgot your password?
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
