
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';


// Dummy theme toggle for now
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    // Check for saved theme or system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light'); // Save initial preference
    }
    
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

  }, [isDark]); // Rerun effect if isDark changes due to external factors (though unlikely here)


  const toggleTheme = () => {
    const newThemeIsDark = !isDark;
    if (newThemeIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDark(newThemeIsDark);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};


export function AppSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { state: sidebarState, setOpenMobile } = useSidebar(); // Added setOpenMobile

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/login');
    if (setOpenMobile) { // Close mobile sidebar on logout if it's open
        setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ToyBrick className="h-8 w-8 text-primary" />
          {sidebarState === 'expanded' && (
            <h1 className="text-xl font-semibold">Classic7</h1>
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
                  onClick={() => { // Close mobile sidebar on navigation
                    if (sidebarState === 'collapsed' && setOpenMobile) { // Check if mobile and sidebar is programmatically controlled
                         setOpenMobile(false);
                    } else if (window.innerWidth < 768 && setOpenMobile) { // General check for mobile screen width
                        setOpenMobile(false);
                    }
                  }}
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
          <Button 
            variant="ghost" 
            size={sidebarState === 'expanded' ? "default" : "icon"} 
            className="w-full justify-start"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
            {sidebarState === 'expanded' && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
