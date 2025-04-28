import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  } else if (differenceInDays(new Date(), dateObj) < 7) {
    return format(dateObj, "EEEE, h:mm a");
  } else {
    return format(dateObj, "MMM d, yyyy");
  }
}

export function formatCurrency(amount: number): string {
  // Convert cents to dollars for display
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(dollars);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateAvatarColor(name: string): string {
  // Simple hash function to generate a consistent color based on name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Generate an HSL color with a good saturation and lightness
  const h = Math.abs(hash % 360);
  const s = 70;
  const l = 60;
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function generatePatientId(): string {
  const prefix = 'P';
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNumber}`;
}

export function calculateAge(birthDate: Date | string | null | undefined): number | null {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function calculateAppointmentDuration(start: Date, end: Date): string {
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  
  if (durationMinutes < 60) {
    return `${durationMinutes}m`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    // Appointment statuses
    scheduled: 'bg-blue-500',
    confirmed: 'bg-blue-500',
    'check-in': 'bg-green-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
    'no-show': 'bg-red-500',
    
    // Patient statuses
    active: 'bg-green-500',
    inactive: 'bg-yellow-500',
    archived: 'bg-gray-500',
    new: 'bg-blue-500',
    
    // Invoice statuses
    pending: 'bg-yellow-500',
    paid: 'bg-green-500',
    partially_paid: 'bg-blue-500',
    refunded: 'bg-purple-500',
    
    // Message priorities
    low: 'bg-gray-500',
    normal: 'bg-blue-500',
    high: 'bg-yellow-500',
    urgent: 'bg-red-500',
    
    // Virtual indicator
    virtual: 'bg-orange-500',
    telehealth: 'bg-orange-500',
    'in-person': 'bg-blue-500',
  };
  
  return statusMap[status.toLowerCase()] || 'bg-gray-500';
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - for production, use a proper sanitizer library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '');
}

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unknown error occurred';
}
