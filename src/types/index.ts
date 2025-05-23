export interface Turf {
  id: string;
  name: string;
  location: string;
  description: string;
  pricing: number; // per hour or slot
  images: string[]; // URLs to images
  amenities: string[];
  status: 'available' | 'maintenance' | 'closed';
  operatingHours: { start: string; end: string }; // e.g., "08:00", "22:00"
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
