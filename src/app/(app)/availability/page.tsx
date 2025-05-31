

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Turf, TimeSlot, ApiAvailableSlotsResponse, CreateBookingPayload, ApiTurfListItem, ApiTurfListResponse } from "@/types";
import { format, parse } from "date-fns";
import { Clock, Loader2, BookMarked } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BookingFormDialog } from "@/components/booking/BookingFormDialog";


export default function AvailabilityPage() {
  const [turfsForSelect, setTurfsForSelect] = useState<Pick<Turf, 'id' | 'name'>[]>([]);
  const [isLoadingTurfs, setIsLoadingTurfs] = useState(true);
  const [turfListError, setTurfListError] = useState<string | null>(null);
  
  const [selectedTurfId, setSelectedTurfId] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]); 
  
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const [selectedSlotIdsForBooking, setSelectedSlotIdsForBooking] = useState<string[]>([]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const selectedTurf = turfsForSelect.find(t => t.id === selectedTurfId);

  useEffect(() => {
    setSelectedDate(new Date()); 
  }, []);

  const fetchTurfsForSelect = useCallback(async () => {
    setIsLoadingTurfs(true);
    setTurfListError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setTurfListError("Authentication token not found. Please login again.");
      setIsLoadingTurfs(false);
      toast({ title: "Authentication Error", description: "Token not found for fetching turfs.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('https://api.classic7turf.com/Turf/GetTurfList?page=1&pageSize=100', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error fetching turfs: ${response.status} - ${errorData || response.statusText}`);
      }

      const result: ApiTurfListResponse = await response.json();

      if (result.success && result.data) {
        const transformedTurfs: Pick<Turf, 'id' | 'name'>[] = result.data.map(apiTurf => ({
          id: apiTurf.turfID,
          name: apiTurf.turfName,
        }));
        setTurfsForSelect(transformedTurfs);
        if (transformedTurfs.length > 0 && !selectedTurfId) {
          setSelectedTurfId(transformedTurfs[0].id); 
        }
      } else {
        throw new Error(result.message || "Failed to fetch turfs for selection.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching turfs.";
      setTurfListError(errorMessage);
      toast({
        title: "Failed to load turfs",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Fetch turfs for select error:", err);
    } finally {
      setIsLoadingTurfs(false);
    }
  }, [selectedTurfId]); 

  useEffect(() => {
    fetchTurfsForSelect();
  }, [fetchTurfsForSelect]);


  const fetchAvailableSlots = useCallback(async (turfId: string, date: Date) => {
    setIsLoadingSlots(true);
    setSlotError(null);
    setTimeSlots([]);
    setSelectedSlotIdsForBooking([]); 

    const token = localStorage.getItem('authToken');
    if (!token) {
      setSlotError("Authentication token not found. Please login again.");
      setIsLoadingSlots(false);
      toast({ title: "Authentication Error", description: "Token not found for fetching slots.", variant: "destructive" });
      return;
    }

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await fetch('https://api.classic7turf.com/Turf/GetAvailableSlots?page=1&pageSize=100', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ turfID: turfId, bookingDate: formattedDate }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error fetching slots: ${response.status} - ${errorData || response.statusText}`);
      }

      const result: ApiAvailableSlotsResponse = await response.json();

      if (result.success && result.data) {
        const transformedSlots: TimeSlot[] = result.data.map(apiSlot => {
          let status: TimeSlot['status'];
          if (apiSlot.slotStatus.toLowerCase() === 'available') {
            status = 'available';
          } else {
            status = 'booked'; 
          }
          
          const parsedStartTime = parse(apiSlot.startTime, "hh:mm aa", new Date());
          const parsedEndTime = parse(apiSlot.endTime, "hh:mm aa", new Date());

          return {
            id: apiSlot.slotID,
            turfId: apiSlot.turfID, 
            date: date, 
            startTime: format(parsedStartTime, "hh:mm aa"), // Store in 12-hour AM/PM format
            endTime: format(parsedEndTime, "hh:mm aa"),   // Store in 12-hour AM/PM format
            status: status, 
            price: apiSlot.price,
            dayOfWeek: apiSlot.dayOfWeek,
          };
        });
        setTimeSlots(transformedSlots);
      } else if (!result.success && result.message.toLowerCase().includes("no slots available")) {
        setTimeSlots([]);
         toast({
          title: "No Slots",
          description: `No available slots for ${selectedTurf?.name} on ${format(date, "PPP")}.`,
        });
      }
      else {
        throw new Error(result.message || "Failed to fetch available slots.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching slots.";
      setSlotError(errorMessage);
      toast({
        title: "Failed to load slots",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Fetch available slots error:", err);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedTurf?.name]);

  useEffect(() => {
    if (selectedTurfId && selectedDate) {
      fetchAvailableSlots(selectedTurfId, selectedDate);
    } else {
      setTimeSlots([]);
      setSelectedSlotIdsForBooking([]);
    }
  }, [selectedTurfId, selectedDate, fetchAvailableSlots]);

  const toggleSlotSelectionForBooking = (slotId: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (slot && slot.status === 'available') {
      setSelectedSlotIdsForBooking(prevSelected =>
        prevSelected.includes(slotId)
          ? prevSelected.filter(id => id !== slotId)
          : [...prevSelected, slotId]
      );
    }
  };
  
  const handleCreateBooking = async (payload: CreateBookingPayload) => {
    setIsSubmittingBooking(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Token not found.", variant: "destructive" });
      setIsSubmittingBooking(false);
      return;
    }
    try {
      const response = await fetch('https://api.classic7turf.com/Turf/CreateBooking', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      toast({
        title: "Booking Created!",
        description: result.data || "Booking has been successfully created.",
      });
      setIsBookingDialogOpen(false);
      setSelectedSlotIdsForBooking([]);
      if (selectedTurfId && selectedDate) {
        fetchAvailableSlots(selectedTurfId, selectedDate);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during booking.";
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Create booking error:", error);
    } finally {
      setIsSubmittingBooking(false);
    }
  };
  
  const slotsForBookingDialog = useMemo(() => {
    return timeSlots.filter(slot => selectedSlotIdsForBooking.includes(slot.id));
  }, [timeSlots, selectedSlotIdsForBooking]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Turf Availability Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Turf and Date</CardTitle>
          <CardDescription>Choose a turf and date to view and manage its availability.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            {isLoadingTurfs ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading turfs...
              </div>
            ) : turfListError ? (
              <div className="text-destructive">Error: {turfListError}</div>
            ) : turfsForSelect.length === 0 ? (
                <p className="text-muted-foreground">No turfs available for selection.</p>
            ) : (
              <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a turf" />
                </SelectTrigger>
                <SelectContent>
                  {turfsForSelect.map((turf) => (
                    <SelectItem key={turf.id} value={turf.id}>
                      {turf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="md:col-span-2">
            {selectedDate ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < today}
              />
            ) : (
              <div className="rounded-md border p-3 h-[290px] flex items-center justify-center text-muted-foreground">Loading calendar...</div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTurf && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Time Slots for {selectedTurf.name} on {format(selectedDate, "PPP")}
            </CardTitle>
            <CardDescription>
              Green (Outline) = Available, Blue (Primary) = Selected for Booking, Red (Destructive) = Booked.
              Click available slots to select them for booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading available slots...</p>
              </div>
            ) : slotError ? (
               <div className="text-center py-10 text-destructive">
                  <p>{slotError}</p>
                  <Button variant="outline" onClick={() => selectedTurfId && selectedDate && fetchAvailableSlots(selectedTurfId, selectedDate)} className="mt-4">Try Again</Button>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map((slot) => {
                  const isApiBooked = slot.status === 'booked';
                  const isSelectedForBooking = selectedSlotIdsForBooking.includes(slot.id);
                  
                  let variant: "default" | "secondary" | "outline" | "destructive" = 'outline';
                  let isDisabled = false;
                  let labelText = 'Available';

                  if (isApiBooked) {
                    variant = 'destructive'; 
                    isDisabled = true;
                    labelText = 'Booked'; 
                  } else if (isSelectedForBooking) { 
                    variant = 'default';
                    labelText = 'Selected';
                  }

                  return (
                    <Button
                      key={slot.id}
                      variant={variant}
                      className="flex flex-col h-auto p-3 text-left"
                      onClick={() => {
                        if (!isApiBooked) {
                           toggleSlotSelectionForBooking(slot.id);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Clock className="h-3 w-3" /> {slot.startTime} - {slot.endTime}
                      </div>
                      <span className="text-xs capitalize mt-1">
                        {labelText}
                      </span>
                      {slot.price && <span className="text-xs text-muted-foreground mt-0.5">₹{slot.price}</span>}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No time slots found for this turf on the selected date.</p>
            )}
          </CardContent>
          {timeSlots.length > 0 && !isLoadingSlots && !slotError &&(
            <CardFooter className="border-t px-6 py-4 flex flex-col sm:flex-row gap-2 justify-end items-center">
                <Button 
                    onClick={() => setIsBookingDialogOpen(true)} 
                    disabled={selectedSlotIdsForBooking.length === 0}
                    variant="default"
                >
                    <BookMarked className="mr-2 h-4 w-4" /> Book Selected Slot(s) ({selectedSlotIdsForBooking.length})
                </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {selectedTurfId && selectedDate && (
        <BookingFormDialog
            isOpen={isBookingDialogOpen}
            onOpenChange={setIsBookingDialogOpen}
            turfId={selectedTurfId}
            bookingDate={format(selectedDate, "yyyy-MM-dd")}
            selectedSlots={slotsForBookingDialog}
            onSubmitApi={handleCreateBooking}
            isLoading={isSubmittingBooking}
        />
      )}
    </div>
  );
}
