
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
    const apiEndpoint = 'https://api.classic7turf.com/Auth/Login';
    const requestHeaders = {
      'accept': 'text/plain',
      'Content-Type': 'application/json',
    };

    console.log("Attempting to login with:", { username: data.username, password: "REDACTED_FOR_LOGS" });
    console.log("API Endpoint:", apiEndpoint);
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
        const result = await response.json();
        console.log("API Login Result:", result);
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
        let errorBody = "Could not read error body.";
        try {
            errorBody = await response.text(); 
        } catch (e) {
            console.error("Failed to read error body as text:", e);
        }
        console.error("Login API responded with an error:", response.status, errorBody);
        toast({
          title: "Login Failed",
          description: `Server responded with ${response.status}. ${errorBody}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login API request failed. Full error object:", error);
      let userMessage = "An unexpected error occurred during login. Please try again later.";

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        userMessage = "Network error: Failed to fetch the login API. This could be due to a network issue, the API server being unavailable, or a CORS (Cross-Origin Resource Sharing) policy. Please check your internet connection and the browser console for more details. CORS issues must be resolved on the API server.";
        console.warn(
          "A 'Failed to fetch' error occurred. This often indicates a CORS misconfiguration on the API server (https://api.classic7turf.com). Ensure the server is configured to accept requests from this frontend's origin (e.g., your development URL like http://localhost:xxxx)."
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
