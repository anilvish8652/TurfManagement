'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems, type NavItem } from '@/config/nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun, ToyBrick } from 'lucide-react'; // ToyBrick as a generic logo
import { Separator } from '../ui/separator';

// Dummy theme toggle for now
const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    // Check for saved theme or system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(document.documentElement.classList.contains('dark') || (!('theme' in localStorage) && prefersDark));
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};


export function AppSidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ToyBrick className="h-8 w-8 text-primary" />
          {sidebarState === 'expanded' && (
            <h1 className="text-xl font-semibold">TurfAdmin</h1>
          )}
        </Link>
      </SidebarHeader>
      <Separator className="mb-2" />
      <SidebarContent className="flex-1 px-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild={false} // Ensure it's a button for proper styling/ARIA if not using asChild with <a>
                  isActive={item.matchExact ? pathname === item.href : pathname.startsWith(item.href)}
                  className="w-full justify-start"
                  tooltip={sidebarState === 'collapsed' ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {sidebarState === 'expanded' && <span>{item.title}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="mt-2" />
      <SidebarFooter className="p-2">
        <div className="flex items-center justify-between">
          {sidebarState === 'expanded' && <ThemeToggle />}
          <Button variant="ghost" size={sidebarState === 'expanded' ? "default" : "icon"} className="w-full justify-start">
            <LogOut className="h-5 w-5" />
            {sidebarState === 'expanded' && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
