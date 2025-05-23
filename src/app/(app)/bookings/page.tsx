
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import type { Booking } from "@/types";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Filter, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState, useEffect } from "react";

const dummyBookings: Booking[] = [
  { id: "B001", turfId: "1", turfName: "Greenfield Arena", userId: "U001", userName: "John Doe", startTime: new Date(2025, 4, 25, 10, 0), endTime: new Date(2025, 4, 25, 12, 0), status: 'confirmed', totalPrice: 100, bookedAt: new Date(2025, 4, 20) },
  { id: "B002", turfId: "2", turfName: "City Soccer Park", userId: "U002", userName: "Jane Smith", startTime: new Date(2025, 5, 10, 14, 0), endTime: new Date(2025, 5, 10, 15, 0), status: 'pending', totalPrice: 70, bookedAt: new Date(2025, 5, 1) },
  { id: "B003", turfId: "1", turfName: "Greenfield Arena", userId: "U003", userName: "Alice Johnson", startTime: new Date(2024, 3, 15, 16, 30), endTime: new Date(2024, 3, 15, 18, 0), status: 'completed', totalPrice: 75, bookedAt: new Date(2024, 3, 10) },
  { id: "B004", turfId: "3", turfName: "Rooftop Kickers", userId: "U001", userName: "John Doe", startTime: new Date(2025, 6, 1, 9, 0), endTime: new Date(2025, 6, 1, 10, 0), status: 'cancelled', totalPrice: 60, bookedAt: new Date(2025, 5, 28) },
];

export default function BookingsPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Initialize date on the client side
    setDate(new Date());
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <Button asChild>
          <Link href="/bookings/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Booking
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>View, filter, and manage all bookings.</CardDescription>
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Input placeholder="Search by name or turf..." className="max-w-sm w-full sm:w-auto" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Confirmed</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Cancelled</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Turf</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Total Price</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.turfName}</TableCell>
                  <TableCell>{booking.userName}</TableCell>
                  <TableCell>
                    {format(booking.startTime, "PPp")} - {format(booking.endTime, "p")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        booking.status === 'confirmed' ? 'default' :
                        booking.status === 'pending' ? 'outline' :
                        booking.status === 'completed' ? 'secondary' :
                        'destructive'
                      }
                      className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' : 
                                   booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700' : ''}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">${booking.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Confirmed</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive hover:text-destructive focus:text-destructive">Cancel Booking</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
