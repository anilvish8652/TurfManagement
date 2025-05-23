
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
  id: string;
  turfId: string;
  turfName: string; 
  userId: string;
  userName: string; 
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalPrice: number;
  bookedAt: Date;
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
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  status: 'available' | 'booked' | 'blocked_by_admin' | 'unavailable'; // 'unavailable' if not in API response or outside known hours
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
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
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
  // ... other fields from GetTurfList if needed
}

// Interface for the overall API response for GetTurfList
export interface ApiTurfListResponse {
  success: boolean;
  message: string;
  data: ApiTurfListItem[];
  // ... other fields from GetTurfList response
}
