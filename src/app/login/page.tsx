
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
    // Use the proxy path defined in next.config.ts
    const apiEndpoint = '/api-proxy/Auth/Login'; 
    const requestHeaders: HeadersInit = {
      'accept': 'text/plain', // Reinstated this header
      'Content-Type': 'application/json',
    };

    console.log("Attempting to login via proxy with:", { username: data.username, password: "REDACTED_FOR_LOGS" });
    console.log("Proxy API Endpoint:", apiEndpoint);
    console.log("Request Headers:", requestHeaders);
    console.log("Request Body:", JSON.stringify({ username: data.username, password: data.password }));


    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      console.log("Fetch response status:", response.status);
      console.log("Fetch response ok:", response.ok);

      if (response.ok) {
        const result = await response.json().catch(async (jsonError) => {
          // If .json() fails, try to read as text (as API might return plain text for success despite 'accept' header)
          console.warn("Failed to parse login response as JSON, trying as text. Error:", jsonError);
          const textResponse = await response.text();
          console.log("Login API Text Response:", textResponse);
          // Try to manually construct a success object if text indicates success, or handle appropriately
          // This part is tricky as the API 'accept: text/plain' suggests it might not always return JSON on success
          // For now, we assume the cURL response showing JSON is the primary success path.
          // If the API truly returns plain text for success, this logic needs adjustment.
          throw new Error("Login response was not valid JSON, and text parsing needs specific handling for success.");
        });
        
        console.log("API Login Result (parsed as JSON):", result);
        if (result.isValidUser && result.token) {
          localStorage.setItem('authToken', result.token);
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          router.push("/dashboard");
        } else {
          toast({
            title: "Login Failed",
            description: result.message || "Invalid username or password, or user not valid.",
            variant: "destructive",
          });
        }
      } else {
        // This block handles non-2xx responses, including 500
        let errorBody = "Could not read error body.";
        try {
            errorBody = await response.text(); 
            if (errorBody.trim().startsWith('{')) {
              try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson && errorJson.message) {
                  errorBody = errorJson.message;
                }
              } catch (jsonParseError) {
                console.warn("Could not parse error body as JSON, using raw text:", jsonParseError);
              }
            }
        } catch (e) {
            console.error("Failed to read error body as text:", e);
        }
        console.error("Login API responded with an error:", response.status, errorBody);
        
        let toastDescription = `Server responded with ${response.status}.`;
        const displayErrorBody = errorBody.length > 150 ? errorBody.substring(0, 150) + "..." : errorBody;

        if (response.status === 500) {
          toastDescription = `An internal server error occurred on the API (500). Please check the API server logs. (Details: ${displayErrorBody})`;
        } else if (displayErrorBody && !displayErrorBody.toLowerCase().includes("internal server error")) { // Avoid redundant message
            toastDescription += ` ${displayErrorBody}`;
        }

        toast({
          title: "Login Failed",
          description: toastDescription,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login API request failed. Full error object:", error);
      let userMessage = "An unexpected error occurred during login. Please try again later.";

      if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
        userMessage = "Network error: Could not connect to the API. This might be due to a network issue, the API server being unavailable, or a CORS policy if not using the proxy. Please check your internet connection and the browser console for more details.";
        console.warn(
          "A 'Failed to fetch' error occurred. Ensure the proxy in next.config.js is correctly configured and the target API server is running and accessible from the Next.js server environment. If the API server has CORS issues, this proxy is intended to help."
        );
      } else if (error instanceof Error) {
        userMessage = `Login error: ${error.message}`;
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
