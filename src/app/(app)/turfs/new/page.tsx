'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

const turfFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  location: z.string().min(3, "Location is required"),
  description: z.string().optional(),
  pricing: z.coerce.number().positive("Pricing must be a positive number"),
  operatingHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  operatingHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  amenities: z.string().optional(), // Simple string for now, can be array later
  // image: z.any().optional(), // For file upload
});

type TurfFormValues = z.infer<typeof turfFormSchema>;

export default function NewTurfPage() {
  const form = useForm<TurfFormValues>({
    resolver: zodResolver(turfFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      pricing: 0,
      operatingHoursStart: "08:00",
      operatingHoursEnd: "22:00",
    },
  });

  function onSubmit(data: TurfFormValues) {
    console.log(data);
    toast({
      title: "Turf Created",
      description: `${data.name} has been successfully created.`,
    });
    // router.push('/turfs'); // Redirect after successful submission
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/turfs">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Turfs</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Turf</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Turf Details</CardTitle>
              <CardDescription>Fill in the information for the new turf.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turf Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Greenfield Arena" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., 123 Main St, Downtown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the turf, its features, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing (per hour)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="E.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="operatingHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opens At</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="operatingHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closes At</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Floodlights, Parking, Cafe (comma-separated)" {...field} />
                    </FormControl>
                    <FormDescription>Enter amenities separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Label htmlFor="turf-image">Turf Image</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <Label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-background font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                      >
                        <span>Upload a file</span>
                        <Input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </Label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                 <FormDescription>Upload one primary image for the turf.</FormDescription>
              </div>
            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button variant="outline" type="button" asChild>
                <Link href="/turfs">Cancel</Link>
              </Button>
              <Button type="submit">Create Turf</Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
