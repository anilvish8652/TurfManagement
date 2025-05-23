

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import type { Booking, ApiBookingReportItem, ApiBookingReportResponse } from "@/types";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Filter, CalendarIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";


const parseBookingDateTime = (apiBookingDate: string, apiBookingSlots: string): { startTime: Date, endTime: Date, bookedAt: Date } => {
  // bookingDate format: "M/d/yyyy hh:mm:ss tt" e.g. "5/1/2025 12:00:00 AM"
  // bookingSlots format: "HH:mm-HH:mm" e.g. "07:00-08:30"
  
  const datePart = parse(apiBookingDate, 'M/d/yyyy hh:mm:ss aa', new Date());
  const dateStringForSlots = format(datePart, 'M/d/yyyy'); // e.g. "5/1/2025"

  const [slotStartStr, slotEndStr] = apiBookingSlots.split('-');

  const startTime = parse(`${dateStringForSlots} ${slotStartStr}`, 'M/d/yyyy HH:mm', new Date());
  const endTime = parse(`${dateStringForSlots} ${slotEndStr}`, 'M/d/yyyy HH:mm', new Date());
  
  return { startTime, endTime, bookedAt: datePart };
};

const transformApiReportItemToBooking = (item: ApiBookingReportItem, type: 'active' | 'cancelled', turfIdUsedForFilter: string): Booking => {
  const { startTime, endTime, bookedAt } = parseBookingDateTime(item.bookingDate, item.bookingSlots);
  
  let status: Booking['status'] = 'unknown';
  if (type === 'cancelled') {
    status = 'cancelled';
  } else if (type === 'active') {
    // Assuming "Done" means confirmed/completed. Other statuses might need more specific mapping.
    if (item.paymentStatus.toLowerCase() === 'done' || item.paymentStatus.toLowerCase() === 'paid') {
      status = new Date() > endTime ? 'completed' : 'confirmed';
    } else if (item.paymentStatus.toLowerCase() === 'pending') {
      status = 'pending_payment';
    } else {
      status = 'confirmed'; // Default for active if not clearly pending or done
    }
  }

  return {
    id: item.bookingID,
    turfId: turfIdUsedForFilter, // The turfId used to make the API call
    turfName: item.turfBooked,
    userName: item.bookingPersonName,
    startTime,
    endTime,
    status,
    totalPrice: parseFloat(item.amount),
    bookedAt,
    paymentStatusApi: item.paymentStatus,
  };
};


export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterTurfId, setFilterTurfId] = useState<string>("1"); 
  const [filterFromDate, setFilterFromDate] = useState<Date | undefined>(undefined); 
  const [filterToDate, setFilterToDate] = useState<Date | undefined>(undefined); 

  const [statusFilter, setStatusFilter] = useState<Booking['status'][]>(['confirmed', 'pending_payment', 'completed', 'cancelled', 'unknown']);


  const fetchBookingReports = useCallback(async (turfID: string, fromDate: Date, toDate: Date) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
      toast({ title: "Authentication Error", description: "Token not found.", variant: "destructive" });
      return;
    }

    const formattedFromDate = format(fromDate, "yyyy-MM-dd");
    const formattedToDate = format(toDate, "yyyy-MM-dd");

    const requestBody = {
      turfID,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    };

    const headers = {
      'accept': '*/*',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const [activeResponse, cancelledResponse] = await Promise.all([
        fetch('https://api.classic7turf.com/Reports/GetActiveReports?page=1&pageSize=100', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        }),
        fetch('https://api.classic7turf.com/Reports/GetCancelledReports?page=1&pageSize=100', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        }),
      ]);

      if (!activeResponse.ok && !cancelledResponse.ok) {
         throw new Error(`Both API calls failed. Active: ${activeResponse.statusText}, Cancelled: ${cancelledResponse.statusText}`);
      }
      
      let fetchedBookings: Booking[] = [];

      if (activeResponse.ok) {
        const activeResult: ApiBookingReportResponse = await activeResponse.json();
        if (activeResult.success && activeResult.data) {
          fetchedBookings.push(...activeResult.data.map(item => transformApiReportItemToBooking(item, 'active', turfID)));
        } else {
           console.warn("Failed to fetch active reports or no data:", activeResult.message);
        }
      } else {
        console.warn("Active reports API call failed:", activeResponse.status, await activeResponse.text());
      }
      
      if (cancelledResponse.ok) {
        const cancelledResult: ApiBookingReportResponse = await cancelledResponse.json();
         if (cancelledResult.success && cancelledResult.data) {
          fetchedBookings.push(...cancelledResult.data.map(item => transformApiReportItemToBooking(item, 'cancelled', turfID)));
        } else {
          console.warn("Failed to fetch cancelled reports or no data:", cancelledResult.message);
        }
      } else {
         console.warn("Cancelled reports API call failed:", cancelledResponse.status, await cancelledResponse.text());
      }
      
      setBookings(fetchedBookings);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Failed to load bookings",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Fetch bookings error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (!filterFromDate) setFilterFromDate(firstDayOfMonth);
    if (!filterToDate) setFilterToDate(today);

    if (filterTurfId && filterFromDate && filterToDate) {
      fetchBookingReports(filterTurfId, filterFromDate, filterToDate);
    }
  }, [fetchBookingReports, filterTurfId, filterFromDate, filterToDate]);

  const handleStatusFilterChange = (status: Booking['status']) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };
  
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => statusFilter.includes(booking.status));
  }, [bookings, statusFilter]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <Button asChild>
          <Link href="/availability">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Booking
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>View, filter, and manage all bookings. (Filters for Turf ID are not yet active)</CardDescription>
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Input placeholder="Search by name or turf..." className="max-w-sm w-full sm:w-auto" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterFromDate ? format(filterFromDate, "PPP") : <span>From Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filterFromDate}
                  onSelect={setFilterFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterToDate ? format(filterToDate, "PPP") : <span>To Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filterToDate}
                  onSelect={setFilterToDate}
                  initialFocus
                  disabled={(date) => filterFromDate ? date < filterFromDate : false}
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['confirmed', 'pending_payment', 'completed', 'cancelled', 'unknown'] as Booking['status'][]).map(s => (
                    <DropdownMenuCheckboxItem 
                        key={s}
                        checked={statusFilter.includes(s)}
                        onCheckedChange={() => handleStatusFilterChange(s)}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <p>Error loading bookings: {error}</p>
              <Button variant="outline" onClick={() => filterTurfId && filterFromDate && filterToDate && fetchBookingReports(filterTurfId, filterFromDate, filterToDate)} className="mt-4">Try Again</Button>
            </div>
          ) : filteredBookings.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
              <p>No bookings found for the selected criteria.</p>
            </div>
          ) : (
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
                {filteredBookings.map((booking) => (
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
                          booking.status === 'pending_payment' ? 'outline' :
                          booking.status === 'completed' ? 'secondary' :
                          booking.status === 'cancelled' ? 'destructive' :
                          'outline' // for 'unknown'
                        }
                        className={
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' : 
                            booking.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700' : ''
                        }
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">₹{booking.totalPrice.toFixed(2)}</TableCell>
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
                          {booking.status === 'pending_payment' && <DropdownMenuItem>Mark as Confirmed</DropdownMenuItem>}
                          {booking.status === 'confirmed' && <DropdownMenuItem>Mark as Completed</DropdownMenuItem>}
                          {(booking.status === 'confirmed' || booking.status === 'pending_payment') && 
                            <DropdownMenuItem className="text-destructive hover:text-destructive focus:text-destructive">Cancel Booking</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

