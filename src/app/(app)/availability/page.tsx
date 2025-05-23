
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useCallback } from "react";
import type { Turf, TimeSlot, ApiAvailableSlotsResponse } from "@/types";
import { format, parse } from "date-fns";
import { Clock, Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Interface for the API response structure for a single turf item in the GetTurfList data array
interface ApiTurfListItem {
  turfID: string;
  turfName: string;
  // ... other fields from GetTurfList if needed, but only turfID and turfName are used for select
}

// Interface for the overall API response for GetTurfList
interface ApiTurfListResponse {
  success: boolean;
  message: string;
  data: ApiTurfListItem[];
  // ... other fields from GetTurfList response
}


export default function AvailabilityPage() {
  const [turfsForSelect, setTurfsForSelect] = useState<Pick<Turf, 'id' | 'name'>[]>([]);
  const [isLoadingTurfs, setIsLoadingTurfs] = useState(true);
  const [turfListError, setTurfListError] = useState<string | null>(null);
  
  const [selectedTurfId, setSelectedTurfId] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [initialTimeSlots, setInitialTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const selectedTurf = turfsForSelect.find(t => t.id === selectedTurfId);

  useEffect(() => {
    setSelectedDate(new Date()); // Initialize selectedDate on client
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
          setSelectedTurfId(transformedTurfs[0].id); // Select the first turf by default
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
  }, [selectedTurfId]); // Added selectedTurfId to ensure default selection logic runs correctly if it was undefined

  useEffect(() => {
    fetchTurfsForSelect();
  }, [fetchTurfsForSelect]);


  const fetchAvailableSlots = useCallback(async (turfId: string, date: Date) => {
    setIsLoadingSlots(true);
    setSlotError(null);
    setTimeSlots([]);
    setInitialTimeSlots([]);

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
          
          const parsedStartTime = parse(apiSlot.startTime, "HH:mm:ss", new Date());
          const parsedEndTime = parse(apiSlot.endTime, "HH:mm:ss", new Date());

          return {
            id: apiSlot.slotID,
            turfId: apiSlot.turfID,
            date: date, 
            startTime: format(parsedStartTime, "HH:mm"),
            endTime: format(parsedEndTime, "HH:mm"),
            status: status,
            price: apiSlot.price,
            dayOfWeek: apiSlot.dayOfWeek,
          };
        });
        setTimeSlots(transformedSlots);
        setInitialTimeSlots(JSON.parse(JSON.stringify(transformedSlots)));
      } else if (!result.success && result.message.toLowerCase().includes("no slots available")) {
        setTimeSlots([]);
        setInitialTimeSlots([]);
        // No need to throw an error, just show no slots
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
      setInitialTimeSlots([]);
    }
  }, [selectedTurfId, selectedDate, fetchAvailableSlots]);

  const handleSlotStatusChange = (slotId: string, newStatus: TimeSlot['status']) => {
    setTimeSlots(prevSlots =>
      prevSlots.map(slot => slot.id === slotId ? { ...slot, status: newStatus } : slot)
    );
  };

  const handleSaveChanges = () => {
    console.log("Saving changes (simulated):", timeSlots.filter((s, i) => JSON.stringify(s) !== JSON.stringify(initialTimeSlots[i])));
    toast({
      title: "Changes Saved (Simulated)",
      description: `Availability for ${selectedTurf?.name} on ${selectedDate ? format(selectedDate, "PPP") : ''} has been updated locally.`,
    });
    setInitialTimeSlots(JSON.parse(JSON.stringify(timeSlots)));
  };

  const hasChanges = JSON.stringify(timeSlots) !== JSON.stringify(initialTimeSlots);
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
              Click to toggle slot status between 'Available' and 'Blocked by Admin' (if not booked by API).
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
                  <Button variant="outline" onClick={() => fetchAvailableSlots(selectedTurfId!, selectedDate!)} className="mt-4">Try Again</Button>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={
                      slot.status === 'available' ? 'outline' :
                      slot.status === 'booked' ? 'secondary' : 
                      'destructive' // 'blocked_by_admin'
                    }
                    className="flex flex-col h-auto p-3 text-left"
                    onClick={() => {
                      const initialSlot = initialTimeSlots.find(is => is.id === slot.id);
                      // Only allow toggling if the API did not mark it as 'booked'.
                      if (initialSlot?.status !== 'booked') {
                         if (slot.status === 'available') {
                            handleSlotStatusChange(slot.id, 'blocked_by_admin');
                         } else if (slot.status === 'blocked_by_admin') {
                            handleSlotStatusChange(slot.id, 'available');
                         }
                      }
                    }}
                    disabled={initialTimeSlots.find(is => is.id === slot.id)?.status === 'booked'}
                  >
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-3 w-3" /> {slot.startTime} - {slot.endTime}
                    </div>
                    <span className="text-xs capitalize mt-1">
                      {slot.status.replace(/_/g, ' ')}
                    </span>
                     {slot.price && <span className="text-xs text-muted-foreground mt-0.5">₹{slot.price}</span>}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No time slots found for this turf on the selected date. This could be due to no availability or an issue fetching data.</p>
            )}
          </CardContent>
          {timeSlots.length > 0 && !isLoadingSlots && !slotError &&(
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveChanges} disabled={!hasChanges}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}


    