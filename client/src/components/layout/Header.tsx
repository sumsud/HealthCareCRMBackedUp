import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Sun, Moon, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { getInitials } from '@/lib/utils';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const unreadMessages = useSelector((state: RootState) => state.messages.unreadCount);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any);
      setLocation('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
  const userFullName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.username || '';
  const userInitials = user?.profile ? getInitials(user.profile.firstName, user.profile.lastName) : user?.username?.charAt(0) || '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center mr-4">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
              <span className="font-semibold text-lg hidden sm:inline-block">CareFlow CRM</span>
            </a>
          </Link>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-md">
            {theme === 'dark' ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="rounded-md relative">
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 py-2 px-4">
                <span className="hidden sm:inline-block">{userFullName}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile?.avatarUrl || ''} alt={userFullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setLocation('/settings/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings/subscription')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Subscription</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
