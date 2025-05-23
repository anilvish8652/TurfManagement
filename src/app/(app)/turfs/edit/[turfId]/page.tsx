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
import { ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import type { Turf } from "@/types";
import { toast } from "@/hooks/use-toast";

const turfFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  location: z.string().min(3, "Location is required"),
  description: z.string().optional(),
  pricing: z.coerce.number().positive("Pricing must be a positive number"),
  operatingHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  operatingHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  amenities: z.string().optional(),
});

type TurfFormValues = z.infer<typeof turfFormSchema>;

// Dummy data for pre-filling
const dummyTurf: Turf = { 
  id: "1", 
  name: "Greenfield Arena", 
  location: "Downtown", 
  description: "Premium 5-a-side turf with latest generation artificial grass.", 
  pricing: 50, 
  images: ["https://placehold.co/600x400.png"], 
  amenities: ["Floodlights", "Changing Rooms", "Cafe"], 
  status: 'available', 
  operatingHours: { start: "08:00", end: "22:00" } 
};


export default function EditTurfPage() {
  const params = useParams();
  const turfId = params.turfId as string;

  const form = useForm<TurfFormValues>({
    resolver: zodResolver(turfFormSchema),
    // Default values will be set by useEffect
  });

  useEffect(() => {
    // In a real app, fetch turf data by turfId here
    if (turfId === dummyTurf.id) { // Simulate fetching
      form.reset({
        name: dummyTurf.name,
        location: dummyTurf.location,
        description: dummyTurf.description,
        pricing: dummyTurf.pricing,
        operatingHoursStart: dummyTurf.operatingHours.start,
        operatingHoursEnd: dummyTurf.operatingHours.end,
        amenities: dummyTurf.amenities.join(", "),
      });
    }
  }, [turfId, form]);

  function onSubmit(data: TurfFormValues) {
    console.log(data);
     toast({
      title: "Turf Updated",
      description: `${data.name} has been successfully updated.`,
    });
    // router.push('/turfs');
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
        <h1 className="text-3xl font-bold tracking-tight">Edit Turf: {form.getValues('name') || 'Loading...'}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Turf Details</CardTitle>
              <CardDescription>Update the information for the turf.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turf Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Textarea {...field} />
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
                      <Input type="number" {...field} />
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
                      <Input placeholder="E.g., Floodlights, Parking (comma-separated)" {...field} />
                    </FormControl>
                     <FormDescription>Enter amenities separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Label htmlFor="turf-image">Turf Image</Label>
                {/* Placeholder for image upload/preview */}
                <div className="mt-1 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  <UploadCloud className="mx-auto h-10 w-10" />
                  <p>Current image: {dummyTurf.images[0].split('/').pop()}</p>
                  <Button variant="outline" size="sm" className="mt-2">Change image</Button>
                </div>
                 <FormDescription>Update the primary image for the turf.</FormDescription>
              </div>
            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button variant="outline" type="button" asChild>
                <Link href="/turfs">Cancel</Link>
              </Button>
              <Button type="submit">Save Changes</Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
