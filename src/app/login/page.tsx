
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
    console.log("Attempting to login with:", { username: data.username, password: "REDACTED_FOR_LOGS" });
    const apiEndpoint = 'https://api.classic7turf.com/Auth/Login';
    const requestHeaders: HeadersInit = { // Added HeadersInit type for clarity
      'accept': 'text/plain',
      'Content-Type': 'application/json',
    };
    console.log("API Endpoint:", apiEndpoint);
    console.log("Request Headers:", requestHeaders);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      console.log("Fetch response status:", response.status);
      console.log("Fetch response ok:", response.ok);

      if (response.ok) {
        // Try to parse as JSON, but if it fails (e.g. API returns plain text token), try to read as text.
        let result;
        const responseText = await response.text(); // Read as text first
        try {
            result = JSON.parse(responseText); // Try to parse as JSON
        } catch (jsonError) {
            // If JSON parsing fails, it might be a plain text token
            console.warn("Could not parse login response as JSON. Assuming plain text token. Response text:", responseText);
            // Basic check for JWT-like string (contains dots, is a string)
            if (typeof responseText === 'string' && responseText.includes('.')) {
                 result = { token: responseText, isValidUser: true, message: "Login successful (inferred from text token)." };
            } else {
                // If it's not JSON and doesn't look like a token, but response was ok, it's an unexpected success format
                throw new Error("Login response was successful but not valid JSON and could not be inferred as a token.");
            }
        }
        
        console.log("API Login Result (parsed):", result);

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
            description: result.message || "Invalid username or password, or user not valid.",
            variant: "destructive",
          });
        }
      } else {
        let errorBody = "Could not read error body.";
        try {
            errorBody = await response.text(); 
            // Attempt to parse if it looks like JSON, otherwise use the text
            if (errorBody.trim().startsWith('{') && errorBody.trim().endsWith('}')) {
              try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson && errorJson.message) { 
                  errorBody = errorJson.message;
                } else if (typeof errorJson === 'object' && errorJson !== null) { 
                  // If it's an object but no message field, stringify it
                  errorBody = JSON.stringify(errorJson);
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
        // Ensure errorBody is concise for the toast
        const displayErrorBody = errorBody.length > 150 ? errorBody.substring(0, 150) + "..." : errorBody; 

        if (response.status === 500) {
          toastDescription = `An internal server error occurred on the API (500). Please check the API server logs. (Details: ${displayErrorBody})`;
        } else if (displayErrorBody && !displayErrorBody.toLowerCase().includes("internal server error")) { 
            // Avoid duplicating "internal server error" if it's already in a generic errorBody
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

      if (error instanceof TypeError && (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror'))) {
        userMessage = "Network error: Failed to fetch the login API. This could be due to a network issue, the API server being unavailable, or a CORS (Cross-Origin Resource Sharing) policy. Please check your internet connection and the browser console for more details. If this is a CORS issue, it must be resolved on the API server.";
        console.warn(
          "A 'Failed to fetch' error occurred. This often indicates a CORS misconfiguration on the API server (https://api.classic7turf.com). Ensure the server is configured to accept requests from this frontend's origin (e.g., http://localhost:xxxx) or use a proxy for development."
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
