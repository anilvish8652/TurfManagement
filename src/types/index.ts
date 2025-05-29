
export interface Turf {
  id: string; // Mapped from turfID
  name: string; // Mapped from turfName
  
  // Detailed location from API
  turfAddress?: string;
  turfCity?: string;
  turfState?: string;
  turfPinCode?: string;
  
  // Combined location for display
  location: string; 

  turfType?: string;
  turfContactNo?: string;
  turfEmail?: string;
  
  // Kept for compatibility, 'images' will be primary for display
  rawImage?: string; // Stores the original turfImage string from API

  // Original fields, some will be populated from API or defaulted
  description?: string;
  pricing?: number; // Not in list API, will be undefined or default for the turf itself
  images: string[]; // Will use rawImage or placeholder
  amenities?: string[]; // Not in list API
  status?: 'available' | 'maintenance' | 'closed'; // Defaulted if not in API
  operatingHours?: { start: string; end: string }; // This might be deprecated if API drives all slot availability
}

export interface Booking {
  id: string; // bookingID from API
  turfId: string; // The turfID used for filtering the report
  turfName: string; // turfBooked from API
  userId?: string; // Not directly available from report API
  userName: string; // bookingPersonName from API
  startTime: Date; // Parsed from bookingDate & bookingSlots
  endTime: Date; // Parsed from bookingDate & bookingSlots
  status: 'confirmed' | 'pending_payment' | 'cancelled' | 'completed' | 'unknown'; // Derived
  totalPrice: number; // amount from API
  bookedAt: Date; // Parsed from bookingDate (date part only)
  paymentStatusApi?: string; // Raw paymentStatus from API
  discountAmount?: number; // Optional, for update payload
}

export interface User {
  id:string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'blocked';
  registrationDate: Date;
  lastLogin?: Date;
}

// Updated TimeSlot interface
export interface TimeSlot {
  id: string; // Mapped from slotID
  turfId: string; // Mapped from turfID in API response
  date: Date; // The specific date for this slot
  startTime: string; // "HH:mm" (24-hour format for display and internal use)
  endTime: string; // "HH:mm" (24-hour format for display and internal use)
  status: 'available' | 'booked' | 'unavailable'; 
  price?: string; // From API
  dayOfWeek?: string; // From API, optional
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'Turf Manager';
  lastLogin?: Date;
  status: 'active' | 'disabled';
}

// API Response types for GetAvailableSlots
interface ApiSlotItem {
  turfID: string;
  slotID: string;
  dayOfWeek: string;
  startTime: string; // Expected format from API: "hh:mm aa" (e.g., "07:00 AM")
  endTime: string;   // Expected format from API: "hh:mm aa" (e.g., "07:30 AM")
  price: string;
  slotStatus: string; // e.g., "Available", "Booked"
}

export interface ApiAvailableSlotsResponse {
  requestid: string;
  success: boolean;
  message: string;
  statuscode: number | null;
  errors: any | null;
  currentpage: number;
  pagesize: number;
  totalpages: number;
  totalitems: number;
  orderby: string;
  orderbydesc: boolean;
  data: ApiSlotItem[];
}

// Payload for CreateBooking API
export interface CreateBookingPayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  altMobileNumber?: string;
  turfID: string;
  slotID: string[]; // API expects an array with a single comma-separated string: ["id1,id2,id3"]
  bookingDate: string; // "YYYY-MM-DD"
  advanceAmount: string; 
  discountAmount: string; 
  finalAmount: string; 
  paymentMode: string;
  transactionID: string;
  paymentStatus: string;
}

// Interface for the API response structure for a single turf item in the GetTurfList data array
export interface ApiTurfListItem {
  turfID: string;
  turfName: string;
  turfAddress: string | null;
  turfCity: string | null;
  turfState: string | null;
  turfPinCode: string | null;
  turfType: string | null;
  turfContactNo: string | null;
  turfAltContactNo: string | null;
  turfEmail: string | null;
  turfImage: string | null;
}

// Interface for the overall API response for GetTurfList
export interface ApiTurfListResponse {
  requestid: string;
  success: boolean;
  message: string;
  statuscode: number | null;
  errors: any | null;
  currentpage: number;
  pagesize: number;
  totalpages: number;
  totalitems: number;
  orderby: string;
  orderbydesc: boolean;
  data: ApiTurfListItem[];
}


// API response types for Booking Reports
export interface ApiBookingReportItem {
  bookingID: string;
  turfBooked: string;
  bookingPersonName: string;
  bookingDate: string; // "M/d/yyyy hh:mm:ss tt" e.g. "5/1/2025 12:00:00 AM"
  bookingSlots: string; // "HH:mm-HH:mm" e.g. "07:00-08:30"
  amount: string; // "1800.00"
  balanceAmount: string;
  discountAmount: string | null; // Can be null from API
  paymentStatus: string; // e.g. "Done"
}

export interface ApiBookingReportResponse {
  requestid: string;
  success: boolean;
  message: string;
  statuscode: number | null;
  errors: any | null;
  currentpage: number;
  pagesize: number;
  totalpages: number;
  totalitems: number;
  orderby: string;
  orderbydesc: boolean;
  data: ApiBookingReportItem[];
}

// API response types for GetBookingDetails
export interface PaymentDetail {
  BookingID: string;
  PaymentID: string;
  PaymentMode: string;
  TransactionID: string;
  PaidAmount: number;
  PaymentDate: string; // "YYYY-MM-DDTHH:mm:ss.sss"
  DiscountAmount: number;
}

export interface ApiBookingDetailItem {
  userID: string;
  username: string;
  email: string;
  mobileNo: string;
  bookingID: string;
  turfBooked: string;
  turfAddress: string;
  dayBooked: string;
  bookingSlots: string; // "HH:mm-HH:mm"
  amount: string; // "1950.00"
  balanceAmount: string; // "0.00"
  paymentDetails: string; // This is a JSON string that needs to be parsed
  parsedPaymentDetails?: PaymentDetail[]; // Optional: to store the parsed version
}

export interface ApiBookingDetailsResponse {
  requestid: string;
  success: boolean;
  message: string;
  statuscode: number | null;
  errors: any | null;
  currentpage: number;
  pagesize: number;
  totalpages: number;
  totalitems: number;
  orderby: string;
  orderbydesc: boolean;
  data: ApiBookingDetailItem[]; // Expecting an array with one item
}

// Payload for UpdateBooking API
export interface UpdateBookingPayload {
  bookingID: string;
  paymentMode: string;
  transactionID: string;
  advanceAmount: string; // Amount being paid now
  discountAmount: string; // Total discount
  finalAmount: string; // Original total price
}

    
