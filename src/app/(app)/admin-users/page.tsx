
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { ApiBookingReportItem, ApiBookingReportResponse, Turf, ApiTurfListItem, ApiTurfListResponse } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Loader2, CalendarIcon, FileSearch } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ReportType = 'active' | 'cancelled';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('active');
  const [selectedTurfId, setSelectedTurfId] = useState<string | undefined>(undefined);
  const [turfsForSelect, setTurfsForSelect] = useState<Pick<Turf, 'id' | 'name'>[]>([]);
  const [isLoadingTurfs, setIsLoadingTurfs] = useState(true);
  const [turfListError, setTurfListError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Default to first day of current month
  });
  const [toDate, setToDate] = useState<Date | undefined>(new Date()); // Default to today

  const [reportData, setReportData] = useState<ApiBookingReportItem[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchTurfsForSelect = useCallback(async () => {
    setIsLoadingTurfs(true);
    setTurfListError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setTurfListError("Authentication token not found.");
      setIsLoadingTurfs(false);
      toast({ title: "Authentication Error", description: "Token not found for fetching turfs.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api-proxy/Turf/GetTurfList?page=1&pageSize=100', { // Assuming proxy is set up
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`API Error fetching turfs: ${response.statusText}`);
      const result: ApiTurfListResponse = await response.json();

      if (result.success && result.data) {
        const transformedTurfs = result.data.map(apiTurf => ({ id: apiTurf.turfID, name: apiTurf.turfName }));
        setTurfsForSelect(transformedTurfs);
        if (transformedTurfs.length > 0 && !selectedTurfId) {
          setSelectedTurfId(transformedTurfs[0].id); // Auto-select first turf
        }
      } else {
        throw new Error(result.message || "Failed to fetch turfs for selection.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error fetching turfs.";
      setTurfListError(msg);
      toast({ title: "Failed to load turfs", description: msg, variant: "destructive" });
    } finally {
      setIsLoadingTurfs(false);
    }
  }, [selectedTurfId]);

  useEffect(() => {
    fetchTurfsForSelect();
  }, [fetchTurfsForSelect]);

  const fetchReportData = useCallback(async () => {
    if (!selectedTurfId || !fromDate || !toDate) {
      toast({ title: "Missing Filters", description: "Please select a turf and date range.", variant: "destructive" });
      setReportData([]);
      return;
    }

    setIsLoadingReport(true);
    setReportError(null);
    setReportData([]);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setReportError("Authentication token not found.");
      setIsLoadingReport(false);
      toast({ title: "Authentication Error", description: "Token not found for fetching report.", variant: "destructive" });
      return;
    }

    const endpoint = reportType === 'active'
      ? '/api-proxy/Reports/GetActiveReports?page=1&pageSize=100'
      : '/api-proxy/Reports/GetCancelledReports?page=1&pageSize=100';

    const payload = {
      turfID: selectedTurfId,
      fromDate: format(fromDate, "yyyy-MM-dd"),
      toDate: format(toDate, "yyyy-MM-dd"),
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`API Error fetching report: ${response.status} - ${errorText || response.statusText}`);
      }
      const result: ApiBookingReportResponse = await response.json();

      if (result.success && result.data) {
        setReportData(result.data);
        if (result.data.length === 0) {
            toast({ title: "No Data", description: "No report data found for the selected criteria."});
        }
      } else {
        throw new Error(result.message || "Failed to fetch report data.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error fetching report.";
      setReportError(msg);
      toast({ title: "Failed to load report", description: msg, variant: "destructive" });
    } finally {
      setIsLoadingReport(false);
    }
  }, [reportType, selectedTurfId, fromDate, toDate]);
  
  const today = new Date();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select filters to generate a booking report.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-muted-foreground mb-1">Report Type</label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active Bookings</SelectItem>
                <SelectItem value="cancelled">Cancelled Bookings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="turfFilter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Turf</label>
            {isLoadingTurfs ? <Loader2 className="h-5 w-5 animate-spin" /> : turfListError ? <p className="text-destructive text-xs">{turfListError}</p> : (
              <Select value={selectedTurfId} onValueChange={setSelectedTurfId} disabled={turfsForSelect.length === 0}>
                <SelectTrigger id="turfFilter">
                  <SelectValue placeholder="Select a turf" />
                </SelectTrigger>
                <SelectContent>
                  {turfsForSelect.map((turf) => (
                    <SelectItem key={turf.id} value={turf.id}>{turf.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-muted-foreground mb-1">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="fromDate" variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} disabled={(date) => date > (toDate || today) || date > today} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-muted-foreground mb-1">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="toDate" variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={toDate} onSelect={setToDate} disabled={(date) => date < (fromDate || new Date(0)) || date > today} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardContent className="flex justify-end pt-0">
            <Button onClick={fetchReportData} disabled={isLoadingReport || !selectedTurfId || !fromDate || !toDate}>
            {isLoadingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
            Fetch Report
          </Button>
        </CardContent>
      </Card>

      {reportError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{reportError}</p>
            <Button variant="outline" onClick={fetchReportData} className="mt-2">Try Again</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Report Results</CardTitle>
          <CardDescription>
            Displaying {reportType === 'active' ? 'active' : 'cancelled'} bookings for {turfsForSelect.find(t => t.id === selectedTurfId)?.name || 'selected turf'}
            {fromDate && toDate && ` from ${format(fromDate, "PPP")} to ${format(toDate, "PPP")}`}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReport ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading report data...</p>
            </div>
          ) : !reportError && reportData.length === 0 && !isLoadingReport ? (
            <p className="text-muted-foreground text-center py-10">No data to display. Please fetch a report using the filters above.</p>
          ) : reportData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Turf Booked</TableHead>
                  <TableHead>Booked By</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item) => (
                  <TableRow key={item.bookingID}>
                    <TableCell className="font-medium">{item.bookingID}</TableCell>
                    <TableCell>{item.turfBooked}</TableCell>
                    <TableCell>{item.bookingPersonName}</TableCell>
                    <TableCell>{item.bookingDate}</TableCell> {/* Displaying raw date string */}
                    <TableCell>{item.bookingSlots}</TableCell>
                    <TableCell>₹{parseFloat(item.amount).toFixed(2)}</TableCell>
                    <TableCell>₹{parseFloat(item.balanceAmount).toFixed(2)}</TableCell>
                    <TableCell>₹{parseFloat(item.discountAmount || "0").toFixed(2)}</TableCell>
                    <TableCell>{item.paymentStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
