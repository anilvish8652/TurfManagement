
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/nav';
import Link from 'next/link';
import { Input } from '../ui/input';
import { AppSidebarNav } from './sidebar-nav'; // For mobile drawer

const getPageTitle = (pathname: string): string => {
  const currentNavItem = navItems.find(item => pathname.startsWith(item.href));
  return currentNavItem?.title || 'Classic7';
};

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
             {/* Using the full sidebar nav component here for mobile */}
            <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
               <AppSidebarNav />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="hidden md:block">
         <SidebarTrigger />
      </div>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* <h1 className="text-lg font-semibold">{pageTitle}</h1> */}
        </div>
        {/* Optional search bar */}
        {/* <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form> */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserCircle className="h-6 w-6" />
          <span className="sr-only">User Profile</span>
        </Button>
      </div>
    </header>
  );
}
