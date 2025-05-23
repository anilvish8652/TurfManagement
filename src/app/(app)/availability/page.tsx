'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import type { Turf, TimeSlot } from "@/types";
import { format } from "date-fns";
import { Clock } from "lucide-react";

// Dummy data
const dummyTurfs: Pick<Turf, 'id' | 'name' | 'operatingHours'>[] = [
  { id: "1", name: "Greenfield Arena", operatingHours: { start: "08:00", end: "22:00" } },
  { id: "2", name: "City Soccer Park", operatingHours: { start: "09:00", end: "23:00" } },
  { id: "3", name: "Rooftop Kickers", operatingHours: { start: "10:00", end: "20:00" } },
];

// Function to generate time slots based on operating hours
const generateTimeSlots = (turf: Pick<Turf, 'id' | 'name' | 'operatingHours'> | undefined, date: Date): TimeSlot[] => {
  if (!turf) return [];

  const slots: TimeSlot[] = [];
  const { start, end } = turf.operatingHours;
  let currentTime = new Date(date);
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  currentTime.setHours(startHour, startMinute, 0, 0);
  
  const endTimeToday = new Date(date);
  endTimeToday.setHours(endHour, endMinute, 0, 0);

  let idCounter = 0;
  while (currentTime < endTimeToday) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + 60 * 60 * 1000); // 1-hour slots

    if (slotEnd > endTimeToday) break; // Do not create slots past operating end time

    slots.push({
      id: `${turf.id}-${date.toISOString().split('T')[0]}-${idCounter++}`,
      turfId: turf.id,
      date: date,
      startTime: format(slotStart, "HH:mm"),
      endTime: format(slotEnd, "HH:mm"),
      // Dummy status, in real app this would come from DB
      status: Math.random() > 0.7 ? 'booked' : (Math.random() > 0.9 ? 'blocked_by_admin' : 'available'),
    });
    currentTime = slotEnd;
  }
  return slots;
};


export default function AvailabilityPage() {
  const [selectedTurfId, setSelectedTurfId] = useState<string | undefined>(dummyTurfs[0]?.id);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const selectedTurf = dummyTurfs.find(t => t.id === selectedTurfId);

  useEffect(() => {
    if (selectedTurf && selectedDate) {
      setTimeSlots(generateTimeSlots(selectedTurf, selectedDate));
    } else {
      setTimeSlots([]);
    }
  }, [selectedTurf, selectedDate]);

  const handleSlotStatusChange = (slotId: string, newStatus: TimeSlot['status']) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => slot.id === slotId ? { ...slot, status: newStatus } : slot)
    );
    // In a real app, you would call an API to update the slot status here.
    console.log(`Slot ${slotId} status changed to ${newStatus}`);
  };

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
            <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a turf" />
              </SelectTrigger>
              <SelectContent>
                {dummyTurfs.map((turf) => (
                  <SelectItem key={turf.id} value={turf.id}>
                    {turf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
            />
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
              Operating Hours: {selectedTurf.operatingHours.start} - {selectedTurf.operatingHours.end}. Click to toggle slot status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={
                      slot.status === 'available' ? 'outline' : 
                      slot.status === 'booked' ? 'secondary' : 
                      'destructive'
                    }
                    className="flex flex-col h-auto p-3 text-left"
                    onClick={() => {
                      if (slot.status !== 'booked') { // Prevent changing status of booked slots for simplicity
                        handleSlotStatusChange(slot.id, slot.status === 'available' ? 'blocked_by_admin' : 'available')
                      }
                    }}
                    disabled={slot.status === 'booked'} // Example: disable changing booked slots
                  >
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-3 w-3"/> {slot.startTime} - {slot.endTime}
                    </div>
                    <span className="text-xs capitalize mt-1">
                      {slot.status.replace('_', ' ')}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">No time slots available for this turf on the selected date, or outside operating hours.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
