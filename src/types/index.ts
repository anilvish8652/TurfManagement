
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
  pricing?: number; // Not in list API, will be undefined or default
  images: string[]; // Will use rawImage or placeholder
  amenities?: string[]; // Not in list API
  status?: 'available' | 'maintenance' | 'closed'; // Defaulted if not in API
  operatingHours?: { start: string; end: string }; // Not in list API
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

export interface TimeSlot {
  id: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  date: Date; // The specific date for this slot
  status: 'available' | 'booked' | 'blocked_by_admin' | 'unavailable'; // unavailable for outside operating hours
  turfId: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'Super Admin' | 'Turf Manager';
  lastLogin?: Date;
  status: 'active' | 'disabled';
}
