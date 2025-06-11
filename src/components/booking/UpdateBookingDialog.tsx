
'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Booking, UpdateBookingPayload } from '@/types';
import { toast } from '@/hooks/use-toast';

const updateBookingFormSchema = z.object({
  newPaymentAmount: z.string()
    .min(1, { message: "Amount is required." }) // Check for non-empty string
    .regex(/^\d*\.?\d*$/, { message: "Invalid amount format. Must be a number (e.g., 500 or 500.50)." })
    .refine(val => parseFloat(val) >= 0, { message: "Amount cannot be negative." }),
  discountAmount: z.string()
    .regex(/^\d*\.?\d*$/, { message: "Invalid amount format. Must be a number (e.g., 100 or 100.50)." })
    .default("0")
    .refine(val => parseFloat(val) >= 0, { message: "Discount cannot be negative." }),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  transactionID: z.string().min(1, 'Transaction ID or reference is required'),
});

type UpdateBookingFormValues = z.infer<typeof updateBookingFormSchema>;

interface UpdateBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSubmitApi: (payload: UpdateBookingPayload) => Promise<void>;
  isLoading: boolean;
}

export function UpdateBookingDialog({
  isOpen,
  onOpenChange,
  booking,
  onSubmitApi,
  isLoading,
}: UpdateBookingDialogProps) {
  const form = useForm<UpdateBookingFormValues>({
    resolver: zodResolver(updateBookingFormSchema),
    defaultValues: {
      newPaymentAmount: '0',
      discountAmount: '0',
      paymentMode: 'Cash',
      transactionID: 'N/A',
    },
  });

  useEffect(() => {
    if (isOpen && booking) {
      form.reset({
        newPaymentAmount: '0', // User will enter the new amount they are paying now
        discountAmount: (booking.discountAmount ?? 0).toString(), // Pre-fill with existing discount
        paymentMode: 'Cash', // Default, can be changed
        transactionID: 'N/A', // Default, can be changed
      });
    }
  }, [isOpen, booking, form]);

  async function onSubmit(values: UpdateBookingFormValues) {
    if (!booking) {
      toast({ title: "Error", description: "No booking selected for update.", variant: "destructive" });
      return;
    }

    const payload: UpdateBookingPayload = {
      bookingID: booking.id,
      paymentMode: values.paymentMode,
      transactionID: values.transactionID,
      advanceAmount: parseFloat(values.newPaymentAmount).toFixed(2),
      discountAmount: parseFloat(values.discountAmount).toFixed(2), // discountAmount is already defaulted to "0" or user-provided
      finalAmount: booking.totalPrice.toFixed(2), // Original total price
    };
    await onSubmitApi(payload);
  }

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Booking: {booking.id}</DialogTitle>
          <DialogDescription>
            Update payment details for this booking. Original Total Price: ₹{booking.totalPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPaymentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Being Paid Now (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Discount Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online (UPI/Card/etc)</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID / Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="Cash payment or TXN123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Booking'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
