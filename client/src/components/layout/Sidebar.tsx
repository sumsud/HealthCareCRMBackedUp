import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { LucideIcon, LayoutDashboard, Users, Calendar, MessageSquare, CreditCard, BarChart3, FileSpreadsheet, Play, ChevronRight } from 'lucide-react';
import { RootState } from '@/store';

type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  active?: boolean;
};

const Sidebar = () => {
  const [location] = useLocation();
  const [sidebarLinks, setSidebarLinks] = useState<SidebarLink[]>([]);
  const unreadMessages = useSelector((state: RootState) => state.messages.unreadCount);
  
  useEffect(() => {
    const links: SidebarLink[] = [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        active: location === '/dashboard'
      },
      {
        href: '/patients',
        label: 'Patients',
        icon: Users,
        active: location.startsWith('/patients')
      },
      {
        href: '/appointments',
        label: 'Appointments',
        icon: Calendar,
        active: location.startsWith('/appointments')
      },
      {
        href: '/messages',
        label: 'Messages',
        icon: MessageSquare,
        badge: unreadMessages,
        active: location.startsWith('/messages')
      },
      {
        href: '/billing',
        label: 'Billing',
        icon: CreditCard,
        active: location.startsWith('/billing')
      },
      {
        href: '/reports',
        label: 'Reports',
        icon: FileSpreadsheet,
        active: location.startsWith('/reports')
      },
      {
        href: '/ai-assistant',
        label: 'AI Assistant',
        icon: Play,
        active: location.startsWith('/ai-assistant')
      }
    ];
    
    setSidebarLinks(links);
  }, [location, unreadMessages]);

  return (
    <aside className="fixed left-0 top-14 z-30 w-14 md:w-64 h-[calc(100vh-3.5rem)] border-r transition-all duration-300 bg-sidebar">
      <div className="flex h-full flex-col gap-2 py-4">
        <nav className="grid gap-1 px-2">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all",
                link.active && "bg-sidebar-accent/50 text-sidebar-accent-foreground"
              )}>
                <link.icon className="h-4 w-4" />
                <span className="hidden md:inline-block">{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs hidden md:flex">
                    {link.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-3 hidden md:block">
            <div className="flex flex-col space-y-1.5 pb-3">
              <h3 className="text-sm font-semibold">Your Plan</h3>
            </div>
            <div className="text-xs">
              <p>Multi-Provider Plan</p>
              <div className="my-2 h-2 w-full rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary"></div>
              </div>
              <p>3 of 5 providers activated</p>
              <Link href="/settings/subscription">
                <a className="mt-3 w-full rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground inline-block text-center">
                  Manage Subscription
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
