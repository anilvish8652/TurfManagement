
'use client';

import { useEffect, useMemo } from 'react';
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
import type { CreateBookingPayload, TimeSlot } from '@/types';
import { toast } from '@/hooks/use-toast';

const bookingFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string()
    .refine(value => value === "" || z.string().email().safeParse(value).success, {
      message: "Invalid email format (or leave empty)",
    })
    .optional()
    .default(""),
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits').regex(/^\d+$/, "Mobile number must contain only digits"),
  altMobileNumber: z.string().optional().or(z.literal('')),
  advanceAmount: z.string().regex(/^\d*\.?\d*$/, "Invalid amount").min(1, "Advance amount is required"),
  discountAmount: z.string().regex(/^\d*\.?\d*$/, "Invalid amount").default("0"),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  transactionID: z.string().min(1, 'Transaction ID or reference is required'),
  paymentStatus: z.string().min(1, 'Payment status is required'),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  turfId: string;
  bookingDate: string; // YYYY-MM-DD
  selectedSlots: TimeSlot[]; // To calculate total price
  onSubmitApi: (payload: CreateBookingPayload) => Promise<void>;
  isLoading: boolean;
}

export function BookingFormDialog({
  isOpen,
  onOpenChange,
  turfId,
  bookingDate,
  selectedSlots,
  onSubmitApi,
  isLoading,
}: BookingFormDialogProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: '',
      altMobileNumber: '',
      advanceAmount: '0',
      discountAmount: '0',
      paymentMode: 'Cash',
      transactionID: 'N/A',
      paymentStatus: 'Pending',
    },
  });

  const totalSelectedSlotsPrice = useMemo(() => {
    return selectedSlots.reduce((acc, slot) => acc + (parseFloat(slot.price || '0')), 0);
  }, [selectedSlots]);

  const discount = parseFloat(form.watch('discountAmount') || '0');
  const finalAmount = useMemo(() => {
     const calculated = totalSelectedSlotsPrice - discount;
     return calculated > 0 ? calculated : 0;
  }, [totalSelectedSlotsPrice, discount]);
  

  useEffect(() => {
    if (isOpen) {
      form.reset({ 
        fullName: '',
        email: '',
        mobileNumber: '',
        altMobileNumber: '',
        advanceAmount: '0',
        discountAmount: '0',
        paymentMode: 'Cash',
        transactionID: 'N/A',
        paymentStatus: 'Pending',
      }); 
    }
  }, [isOpen, form]);

  async function onSubmit(values: BookingFormValues) {
    if (selectedSlots.length === 0) {
      toast({ title: "No slots selected", description: "Please select at least one time slot.", variant: "destructive" });
      return;
    }

    const payload: CreateBookingPayload = {
      ...values,
      email: values.email || "", // Ensure email is a string, even if empty
      turfID: turfId,
      slotID: [selectedSlots.map(s => s.id).join(',')], 
      bookingDate: bookingDate, 
      finalAmount: finalAmount.toFixed(2),
      advanceAmount: parseFloat(values.advanceAmount).toFixed(2),
      discountAmount: parseFloat(values.discountAmount || '0').toFixed(2),
    };
    await onSubmitApi(payload);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Enter user and payment details for the selected slots.
            Total price for {selectedSlots.length} slot(s): ₹{totalSelectedSlotsPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                        <Input type="tel" placeholder="9999988888" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="altMobileNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Alternate Mobile (Optional)</FormLabel>
                    <FormControl>
                        <Input type="tel" placeholder="9999988887" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="advanceAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Advance Amount (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 500" {...field} onChange={e => {
                                field.onChange(e.target.value);
                            }}/>
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
                        <FormLabel>Discount Amount (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 100" {...field} onChange={e => {
                                field.onChange(e.target.value);
                            }} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormItem>
                    <FormLabel>Final Amount (₹)</FormLabel>
                    <Input value={finalAmount.toFixed(2)} readOnly disabled className="font-semibold bg-muted/50" />
                </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <FormLabel>Transaction ID / Ref</FormLabel>
                        <FormControl>
                            <Input placeholder="Cash payment or TXN123" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Partial">Partial</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
            
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading || finalAmount < 0 || selectedSlots.length === 0}>
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

