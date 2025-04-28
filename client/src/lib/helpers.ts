import { format, addDays, setHours, setMinutes, isAfter, isBefore } from 'date-fns';
import { Patient, Appointment } from '@shared/types';

// Format time display for appointments
export function formatAppointmentTime(date: Date): string {
  return format(date, 'h:mm a');
}

// Format date for display
export function formatFullDate(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

// Get patient full name
export function getPatientFullName(patient: Patient | undefined | null): string {
  if (!patient) return 'Unknown Patient';
  return `${patient.firstName} ${patient.lastName}`;
}

// Get age and gender display
export function getPatientAgeGender(patient: Patient | undefined | null): string {
  if (!patient) return '';
  
  let result = '';
  
  if (patient.dateOfBirth) {
    const age = calculateAge(patient.dateOfBirth);
    result += `${age}y`;
  }
  
  if (patient.gender) {
    if (result) result += ', ';
    result += patient.gender;
  }
  
  return result;
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: Date | string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Generate color for appointment status
export function getAppointmentStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500',
    confirmed: 'bg-blue-500',
    'check-in': 'bg-green-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
    'no-show': 'bg-red-500',
  };
  
  return statusColors[status.toLowerCase()] || 'bg-gray-500';
}

// Generate color for appointment type
export function getAppointmentTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    'in-person': 'bg-blue-500',
    telehealth: 'bg-orange-500',
  };
  
  return typeColors[type.toLowerCase()] || 'bg-gray-500';
}

// Generate working hours slots
export function generateTimeSlots(
  date: Date,
  startHour: number = 8,
  endHour: number = 17,
  intervalMinutes: number = 30
): { label: string; value: Date }[] {
  const slots = [];
  const now = new Date();
  
  // Start at startHour
  let current = setHours(setMinutes(new Date(date), 0), startHour);
  const end = setHours(setMinutes(new Date(date), 0), endHour);
  
  while (isBefore(current, end)) {
    // Don't add past time slots for today
    if (format(date, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd') || isAfter(current, now)) {
      slots.push({
        label: format(current, 'h:mm a'),
        value: new Date(current),
      });
    }
    
    // Add intervalMinutes to current time
    current = addDays(current, 0); // Clone date
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }
  
  return slots;
}

// Generate patient ID from firstName, lastName, and index
export function generatePatientIdFromName(firstName: string, lastName: string, index: number): string {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  const paddedIndex = String(index).padStart(4, '0');
  return `P-${firstInitial}${lastInitial}${paddedIndex}`;
}

// Check for appointment conflicts
export function hasAppointmentConflict(
  appointments: Appointment[],
  startTime: Date,
  endTime: Date,
  providerId: number,
  excludeAppointmentId?: number
): boolean {
  return appointments.some(appointment => {
    // Skip the current appointment if we're updating
    if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
      return false;
    }
    
    // Skip cancelled appointments
    if (appointment.status === 'cancelled' || appointment.status === 'no-show') {
      return false;
    }
    
    // Check if provider is the same
    if (appointment.providerId !== providerId) {
      return false;
    }
    
    // Check for time conflict
    const appointmentStart = new Date(appointment.startTime);
    const appointmentEnd = new Date(appointment.endTime);
    
    // Conflict if:
    // 1. New appointment starts during an existing appointment (start >= appointmentStart && start < appointmentEnd)
    // 2. New appointment ends during an existing appointment (end > appointmentStart && end <= appointmentEnd)
    // 3. New appointment completely contains an existing appointment (start <= appointmentStart && end >= appointmentEnd)
    
    const startsDuring = (startTime >= appointmentStart && startTime < appointmentEnd);
    const endsDuring = (endTime > appointmentStart && endTime <= appointmentEnd);
    const contains = (startTime <= appointmentStart && endTime >= appointmentEnd);
    
    return startsDuring || endsDuring || contains;
  });
}

// Format currency amount for display
export function formatAmount(amount: number): string {
  // Convert cents to dollars
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  items: { quantity: number; unitPrice: number; taxRate: number }[]
): { subtotal: number; tax: number; total: number } {
  let subtotal = 0;
  let tax = 0;
  
  items.forEach(item => {
    const itemAmount = item.quantity * item.unitPrice;
    const itemTax = Math.round(itemAmount * (item.taxRate / 100));
    
    subtotal += itemAmount;
    tax += itemTax;
  });
  
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Format phone number as (XXX) XXX-XXXX
export function formatPhoneNumber(phoneNumber: string): string {
  // Strip all non-numeric characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  return phoneNumber;
}

// Format date of birth
export function formatDateOfBirth(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy');
}

// Get appropriate status badge text
export function getStatusBadgeText(status: string): string {
  // Convert 'check-in' to 'Checked In', etc.
  const statusMap: Record<string, string> = {
    'scheduled': 'Scheduled',
    'confirmed': 'Confirmed',
    'check-in': 'Checked In',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no-show': 'No Show',
    'active': 'Active',
    'inactive': 'Inactive',
    'archived': 'Archived',
    'pending': 'Pending',
    'paid': 'Paid',
    'partially_paid': 'Partially Paid',
    'refunded': 'Refunded',
    'telehealth': 'Virtual',
    'in-person': 'In Person',
  };
  
  return statusMap[status.toLowerCase()] || status;
}

// Truncate long text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Extract file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Check if file is an image
export function isImageFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
}

// Check if file is a document
export function isDocumentFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
}

// Convert file size to human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
