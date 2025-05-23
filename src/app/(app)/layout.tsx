import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarNav } from '@/components/layout/sidebar-nav';
import { AppHeader } from '@/components/layout/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        {/* AppSidebarNav content is rendered within the Sidebar component via its children. 
            But we have custom logic within AppSidebarNav that needs the sidebar context, 
            so we place it directly. The ui/sidebar component itself handles its structure.
            Here, AppSidebarNav will render its header, content, footer.
         */}
        <AppSidebarNav />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 pt-6 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
