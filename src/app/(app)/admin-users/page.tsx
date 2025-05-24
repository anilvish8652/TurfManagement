
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { ApiBookingReportItem, ApiBookingReportResponse, ApiTurfListItem, ApiTurfListResponse } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Loader2, CalendarIcon, FileSearch } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type ReportType = 'active' | 'cancelled';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('active');
  const [selectedTurfId, setSelectedTurfId] = useState<string | undefined>(undefined);
  const [turfsForSelect, setTurfsForSelect] = useState<Pick<ApiTurfListItem, 'turfID' | 'turfName'>[]>([]);
  const [isLoadingTurfs, setIsLoadingTurfs] = useState(true);
  const [turfListError, setTurfListError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const [reportData, setReportData] = useState<ApiBookingReportItem[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Initialize dates on client side to avoid hydration issues
  useEffect(() => {
    const today = new Date();
    setFromDate(new Date(today.getFullYear(), today.getMonth(), 1)); // Default to first day of current month
    setToDate(new Date()); // Default to today
  }, []);


  const fetchTurfsForSelect = useCallback(async () => {
    setIsLoadingTurfs(true);
    setTurfListError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      const msg = "Authentication token not found. Please login.";
      setTurfListError(msg);
      setIsLoadingTurfs(false);
      toast({ title: "Authentication Error", description: msg, variant: "destructive" });
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
        let errorBodyText = `API Error: ${response.status}`;
        try {
          const text = await response.text();
          errorBodyText += ` - ${text || response.statusText}`;
        } catch (e) {
          // ignore if reading text fails
        }
        console.error("Failed to fetch turfs API Error:", errorBodyText);
        setTurfListError(`Server Error: ${response.status}. Check console for details.`);
        toast({ title: "Failed to load turfs", description: `The server responded with status ${response.status}. Please check console for more details.`, variant: "destructive" });
        setIsLoadingTurfs(false);
        return;
      }
      const result: ApiTurfListResponse = await response.json();

      if (result.success && result.data) {
        const transformedTurfs = result.data.map(apiTurf => ({ turfID: apiTurf.turfID, turfName: apiTurf.turfName }));
        setTurfsForSelect(transformedTurfs);
        if (transformedTurfs.length > 0 && !selectedTurfId) {
          setSelectedTurfId(transformedTurfs[0].turfID);
        }
      } else {
        const msg = result.message || "Failed to process turfs data from API.";
        setTurfListError(msg);
        toast({ title: "Failed to load turfs", description: msg, variant: "destructive" });
      }
    } catch (err) {
      let msg = "Unknown network error fetching turfs. Check console for details.";
      if (err instanceof Error) {
          msg = err.message;
          if (err.message.toLowerCase().includes('failed to fetch')) {
              msg = "Network error fetching turfs. This could be a CORS issue or the API server being down. Please check the console.";
          }
      }
      console.error("Network or unexpected error fetching turfs:", err);
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
      const msg = "Authentication token not found. Please login.";
      setReportError(msg);
      setIsLoadingReport(false);
      toast({ title: "Authentication Error", description: msg, variant: "destructive" });
      return;
    }

    const formattedFromDate = format(fromDate, "yyyy-MM-dd");
    const formattedToDate = format(toDate, "yyyy-MM-dd");

    const requestBody = {
      turfID: selectedTurfId,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    };

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
    };
    
    // Using /api-proxy/ for these calls as a workaround for potential CORS issues
    const endpoint = reportType === 'active'
      ? '/api-proxy/Reports/GetActiveReports?page=1&pageSize=100'
      : '/api-proxy/Reports/GetCancelledReports?page=1&pageSize=100';

    try {
      console.log(`Fetching ${reportType} report from: ${endpoint} with body:`, JSON.stringify(requestBody));
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorBodyText = `API Error: ${response.status}`;
        try {
          const text = await response.text();
          errorBodyText += ` - ${text || response.statusText}`;
        } catch (e) {
          // ignore if reading text fails
        }
        console.error(`Failed to fetch ${reportType} report:`, errorBodyText);
        setReportError(`Server Error: ${response.status}. Check console for details.`);
        toast({ title: `Failed to load ${reportType} report`, description: `Server responded with status ${response.status}. Please check console for more details. Error: ${errorBodyText.substring(0, 100)}...`, variant: "destructive" });
        setIsLoadingReport(false);
        return;
      }
      const result: ApiBookingReportResponse = await response.json();

      if (result.success && result.data) {
        setReportData(result.data);
        if (result.data.length === 0) {
          toast({ title: "No Data", description: "No report data found for the selected criteria." });
        }
      } else {
        const msg = result.message || `Failed to process ${reportType} report data from API.`;
        setReportError(msg);
        toast({ title: `Failed to load ${reportType} report`, description: msg, variant: "destructive" });
      }
    } catch (err) {
      let msg = `Unknown network error fetching ${reportType} report. Check console for details.`;
       if (err instanceof Error) {
          msg = err.message;
          if (err.message.toLowerCase().includes('failed to fetch')) {
              msg = `Network error fetching ${reportType} report. This could be a CORS issue, the API server being down, or the proxy not working. Please check the console.`;
          }
      }
      console.error(`Network or unexpected error fetching ${reportType} report:`, err);
      setReportError(msg);
      toast({ title: `Failed to load ${reportType} report`, description: msg, variant: "destructive" });
    } finally {
      setIsLoadingReport(false);
    }
  }, [reportType, selectedTurfId, fromDate, toDate]);

  const todayForCalendar = new Date();

  const getBookingStatus = (item: ApiBookingReportItem): { text: string, variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (reportType === 'cancelled') {
      return { text: "Cancelled", variant: "destructive" };
    }
    if (item.paymentStatus?.toLowerCase() === 'done') {
      return { text: "Active", variant: "default" };
    }
    return { text: "Pending", variant: "outline" };
  };

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
            {isLoadingTurfs ? <div className="flex items-center h-10"><Loader2 className="h-5 w-5 animate-spin" /> <span className="ml-2 text-sm">Loading turfs...</span></div> : turfListError ? <p className="text-destructive text-xs pt-2">{turfListError}</p> : (
              <Select value={selectedTurfId} onValueChange={setSelectedTurfId} disabled={turfsForSelect.length === 0}>
                <SelectTrigger id="turfFilter">
                  <SelectValue placeholder="Select a turf" />
                </SelectTrigger>
                <SelectContent>
                  {turfsForSelect.map((turf) => (
                    <SelectItem key={turf.turfID} value={turf.turfID}>{turf.turfName}</SelectItem>
                  ))}
                   {turfsForSelect.length === 0 && <p className="p-2 text-sm text-muted-foreground">No turfs found.</p>}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-muted-foreground mb-1">From Date</label>
            {fromDate === undefined ? <div className="h-10 flex items-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="fromDate" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} disabled={(date) => date > (toDate || todayForCalendar) || date > todayForCalendar} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-muted-foreground mb-1">To Date</label>
             {toDate === undefined ? <div className="h-10 flex items-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="toDate" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} disabled={(date) => date < (fromDate || new Date(0)) || date > todayForCalendar} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </CardContent>
        <CardContent className="flex justify-end pt-0">
          <Button onClick={fetchReportData} disabled={isLoadingReport || !selectedTurfId || !fromDate || !toDate || isLoadingTurfs}>
            {isLoadingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
            Fetch Report
          </Button>
        </CardContent>
      </Card>

      {reportError && !isLoadingReport && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{reportError}</p>
            <Button variant="outline" onClick={fetchReportData} className="mt-2"  disabled={isLoadingReport || !selectedTurfId || !fromDate || !toDate || isLoadingTurfs}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Report Results</CardTitle>
          <CardDescription>
            Displaying {reportType === 'active' ? 'active' : 'cancelled'} bookings for {turfsForSelect.find(t => t.turfID === selectedTurfId)?.turfName || 'selected turf'}
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
                  <TableHead>Booking Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item) => {
                  const bookingStatus = getBookingStatus(item);
                  return (
                    <TableRow key={item.bookingID}>
                      <TableCell className="font-medium">{item.bookingID}</TableCell>
                      <TableCell>{item.turfBooked}</TableCell>
                      <TableCell>{item.bookingPersonName}</TableCell>
                      <TableCell>{item.bookingDate}</TableCell>
                      <TableCell>{item.bookingSlots}</TableCell>
                      <TableCell>₹{parseFloat(item.amount).toFixed(2)}</TableCell>
                      <TableCell>₹{parseFloat(item.balanceAmount).toFixed(2)}</TableCell>
                      <TableCell>₹{parseFloat(item.discountAmount || "0").toFixed(2)}</TableCell>
                      <TableCell>{item.paymentStatus}</TableCell>
                      <TableCell>
                        <Badge variant={bookingStatus.variant} 
                          className={
                            bookingStatus.variant === 'default' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' :
                            bookingStatus.variant === 'outline' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700' : ''
                          }
                        >
                          {bookingStatus.text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

