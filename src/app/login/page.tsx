
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
import Image from "next/image"; // Import Next.js Image component
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react"; // Removed ToyBrick
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
    
    // Step 1: Get pre-authentication token with static credentials
    const preAuthApiEndpoint = 'https://api.classic7turf.com/Auth/Login';
    const preAuthRequestHeaders = {
      'accept': 'text/plain',
      'Content-Type': 'application/json',
    };
    let preAuthToken: string | null = null;
    console.log("Login Step 1: Fetching pre-auth token from:", preAuthApiEndpoint);
    console.log("Pre-auth Request Headers:", preAuthRequestHeaders);

    try {
      const preAuthResponse = await fetch(preAuthApiEndpoint, {
        method: 'POST',
        headers: preAuthRequestHeaders,
        body: JSON.stringify({ username: "tech", password: "pass1234" }), // Static credentials
      });

      console.log("Pre-auth API response status:", preAuthResponse.status);
      console.log("Pre-auth API response ok:", preAuthResponse.ok);

      if (preAuthResponse.ok) {
        const preAuthResult = await preAuthResponse.json();
        console.log("Pre-auth API Result:", preAuthResult);
        if (preAuthResult.isValidUser && preAuthResult.token) {
          preAuthToken = preAuthResult.token;
          console.log("Pre-auth token obtained successfully.");
        } else {
          toast({
            title: "Pre-Auth Failed",
            description: preAuthResult.message || "Could not obtain pre-auth token.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        let errorBody = "Could not read error body from pre-auth API.";
        try {
            errorBody = await preAuthResponse.text(); 
        } catch (e) {
            console.error("Failed to read error body from pre-auth API as text:", e);
        }
        console.error("Pre-auth API responded with an error:", preAuthResponse.status, errorBody);
        toast({
          title: "Pre-Auth Failed",
          description: `Pre-auth server responded with ${preAuthResponse.status}. ${errorBody.substring(0,150)}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Pre-auth API request failed. Full error object:", error);
      let userMessage = "An unexpected error occurred during pre-authentication.";
       if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
        userMessage = "Network error: Failed to fetch pre-auth API. Check connection or CORS on API server.";
      } else if (error instanceof Error) {
        userMessage = `Pre-auth error: ${error.message}`;
      }
      toast({
        title: "Pre-Auth Failed",
        description: userMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!preAuthToken) {
        toast({ title: "Login Error", description: "Failed to obtain necessary token for verification.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    // Step 2: Verify User with the obtained pre-auth token
    console.log("Login Step 2: Verifying user credentials.");
    const verifyUserApiEndpoint = 'https://api.classic7turf.com/Login/VerifyUser?page=1&pageSize=100';
    const verifyUserRequestHeaders = {
      'accept': '*/*',
      'Authorization': `Bearer ${preAuthToken}`,
      'Content-Type': 'application/json',
    };
    console.log("Verify User API Endpoint:", verifyUserApiEndpoint);
    console.log("Verify User Request Headers:", verifyUserRequestHeaders);
    
    try {
      const verifyResponse = await fetch(verifyUserApiEndpoint, {
        method: 'POST',
        headers: verifyUserRequestHeaders,
        body: JSON.stringify({ loginID: data.username, password: data.password }), // User-entered credentials
      });

      console.log("Verify user API response status:", verifyResponse.status);
      console.log("Verify user API response ok:", verifyResponse.ok);

      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log("Verify User API Result:", verifyResult);

        if (verifyResult.success && verifyResult.data && verifyResult.data.length > 0 && verifyResult.data[0].userID) {
          localStorage.setItem('authToken', preAuthToken); // Store the pre-auth token as the session token
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          router.push("/dashboard");
        } else {
          toast({
            title: "Login Failed",
            description: verifyResult.message || "Invalid username or password.",
            variant: "destructive",
          });
        }
      } else {
        let errorBody = "Could not read error body from verify user API.";
        try {
            errorBody = await verifyResponse.text(); 
        } catch (e) {
            console.error("Failed to read error body from verify user API as text:", e);
        }
        console.error("Verify User API responded with an error:", verifyResponse.status, errorBody);
        toast({
          title: "Login Failed",
          description: `Verification server responded with ${verifyResponse.status}. ${errorBody.substring(0,150)}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verify User API request failed. Full error object:", error);
      let userMessage = "An unexpected error occurred during user verification.";
      if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
        userMessage = "Network error: Failed to fetch verify user API. Check connection or CORS on API server.";
      } else if (error instanceof Error) {
        userMessage = `Verification error: ${error.message}`;
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
        {/* Replace ToyBrick with Image component */}
        <Image src="/logo.png" alt="Classic7 Logo" width={48} height={48} className="h-12 w-12 mb-2" />
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
