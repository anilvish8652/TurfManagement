'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CalendarIcon, UserPlus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import type { Turf, User } from "@/types";
import { toast } from "@/hooks/use-toast";

const bookingFormSchema = z.object({
  turfId: z.string().min(1, "Turf selection is required"),
  userId: z.string().min(1, "User selection is required"),
  bookingDate: z.date({ required_error: "Booking date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  // totalPrice: z.coerce.number().positive("Total price must be positive"), // This could be calculated
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

// Dummy data
const dummyTurfs: Pick<Turf, 'id' | 'name' | 'pricing'>[] = [
  { id: "1", name: "Greenfield Arena", pricing: 50 },
  { id: "2", name: "City Soccer Park", pricing: 70 },
];
const dummyUsers: Pick<User, 'id' | 'name' | 'email'>[] = [
  { id: "U001", name: "John Doe", email: "john@example.com" },
  { id: "U002", name: "Jane Smith", email: "jane@example.com" },
];


export default function NewBookingPage() {
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      bookingDate: new Date(),
      startTime: "10:00",
      endTime: "11:00",
    },
  });

  // Effect to calculate price
  const { watch } = form;
  const turfId = watch("turfId");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    if (turfId && startTime && endTime) {
      const selectedTurf = dummyTurfs.find(t => t.id === turfId);
      if (selectedTurf) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const durationHours = (endH + endM / 60) - (startH + startM / 60);
        if (durationHours > 0) {
          setCalculatedPrice(durationHours * selectedTurf.pricing);
        } else {
          setCalculatedPrice(null);
        }
      }
    } else {
      setCalculatedPrice(null);
    }
  }, [turfId, startTime, endTime]);


  function onSubmit(data: BookingFormValues) {
    const finalData = { ...data, totalPrice: calculatedPrice };
    console.log(finalData);
    toast({
      title: "Booking Created",
      description: `Booking for ${dummyUsers.find(u=>u.id === data.userId)?.name} at ${dummyTurfs.find(t=>t.id === data.turfId)?.name} has been made.`,
    });
    // router.push('/bookings');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/bookings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Bookings</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Fill in the information for the new booking.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="turfId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Turf</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a turf" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dummyTurfs.map(turf => (
                          <SelectItem key={turf.id} value={turf.id}>{turf.name} (${turf.pricing}/hr)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select User</FormLabel>
                     <div className="flex gap-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an existing user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dummyUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" type="button" className="shrink-0">
                        <UserPlus className="mr-2 h-4 w-4"/> New User
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bookingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Booking Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold">Booking Summary</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Selected Turf: <span className="font-medium">{dummyTurfs.find(t => t.id === turfId)?.name || 'N/A'}</span></p>
                  <p>Selected User: <span className="font-medium">{dummyUsers.find(u => u.id === form.getValues("userId"))?.name || 'N/A'}</span></p>
                  <p>Date: <span className="font-medium">{form.getValues("bookingDate") ? format(form.getValues("bookingDate"), "PPP") : 'N/A'}</span></p>
                  <p>Time: <span className="font-medium">{startTime} - {endTime}</span></p>
                  <p className="text-base font-bold">Estimated Price: <span className="text-primary">{calculatedPrice !== null ? `$${calculatedPrice.toFixed(2)}` : 'N/A'}</span></p>
                </div>
              </div>

            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button variant="outline" type="button" asChild>
                <Link href="/bookings">Cancel</Link>
              </Button>
              <Button type="submit" disabled={!calculatedPrice || calculatedPrice <= 0}>Create Booking</Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
