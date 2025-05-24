
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dribbble, CalendarClock, CalendarCheck2, FileText, ShieldCheck, Cog } from 'lucide-react'; // Changed ShieldCheck to FileText for Reports

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  children?: NavItem[];
  matchExact?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    title: 'Turf Management',
    href: '/turfs',
    icon: Dribbble,
  },
  {
    title: 'Availability',
    href: '/availability',
    icon: CalendarClock,
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: CalendarCheck2,
  },
  {
    title: 'Reports', // Renamed from Admin Management
    href: '/admin-users', // Route remains the same, content changes
    icon: FileText, // Icon changed
  },
  // Example of a settings link, if needed later
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Cog,
  // },
];
