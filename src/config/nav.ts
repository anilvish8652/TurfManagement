
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dribbble, CalendarClock, CalendarCheck2, FileText, Cog } from 'lucide-react';

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
    title: 'Reports',
    href: '/admin-users',
    icon: FileText,
  },
  // Example of a settings link, if needed later
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Cog,
  // },
];
