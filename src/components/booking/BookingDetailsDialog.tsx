
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { ApiBookingDetailItem, PaymentDetail } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';

interface BookingDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetails: ApiBookingDetailItem | null;
  isLoading: boolean;
  error: string | null;
}

export function BookingDetailsDialog({
  isOpen,
  onOpenChange,
  bookingDetails,
  isLoading,
  error,
}: BookingDetailsDialogProps) {
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading booking details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-destructive">
          <AlertTriangle className="h-12 w-12" />
          <p className="mt-4 font-semibold">Error loading details</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      );
    }

    if (!bookingDetails) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground">No details available for this booking.</p>
        </div>
      );
    }

    const totalAmount = parseFloat(bookingDetails.amount);
    const balanceAmount = parseFloat(bookingDetails.balanceAmount);
    const advanceAmount = totalAmount - balanceAmount;

    return (
      <div className="space-y-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-base mb-1">User Information</h3>
            <p><strong>Name:</strong> {bookingDetails.username}</p>
            <p><strong>Email:</strong> {bookingDetails.email}</p>
            <p><strong>Mobile:</strong> {bookingDetails.mobileNo}</p>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">Booking Information</h3>
            <p><strong>Booking ID:</strong> <Badge variant="outline">{bookingDetails.bookingID}</Badge></p>
            <p><strong>Turf:</strong> {bookingDetails.turfBooked}</p>
            <p><strong>Address:</strong> {bookingDetails.turfAddress}</p>
            <p><strong>Day:</strong> {bookingDetails.dayBooked}</p>
            <p><strong>Slots:</strong> {bookingDetails.bookingSlots}</p>
            <p><strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}</p>
            <p><strong>Advance Amount:</strong> ₹{advanceAmount.toFixed(2)}</p>
            <p><strong>Balance:</strong> ₹{balanceAmount.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-2">Payment History</h3>
          {bookingDetails.parsedPaymentDetails && bookingDetails.parsedPaymentDetails.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingDetails.parsedPaymentDetails.map((payment) => (
                  <TableRow key={payment.PaymentID}>
                    <TableCell><Badge variant="secondary" className="text-xs">{payment.PaymentID}</Badge></TableCell>
                    <TableCell>{payment.PaymentMode}</TableCell>
                    <TableCell>{payment.TransactionID}</TableCell>
                    <TableCell>₹{payment.PaidAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{payment.DiscountAmount.toFixed(2)}</TableCell>
                    <TableCell>{format(parseISO(payment.PaymentDate), 'PPpp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No payment history found for this booking.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Detailed information for booking ID: {bookingDetails?.bookingID || 'N/A'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
         {renderContent()}
        </div>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Basic custom scrollbar styling (can be in globals.css too)
const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: hsl(var(--muted) / 0.5);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--border)); 
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary) / 0.7); 
  }
`;
if (typeof window !== 'undefined') {
  document.head.appendChild(style);
}
