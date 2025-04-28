import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatAppointmentTime, calculateAppointmentDuration, getPatientFullName } from '@/lib/helpers';
import { getStatusColor, getStatusBadgeText } from '@/lib/helpers';
import { Edit, FileEdit, ArrowUpRight, CheckCircle, XCircle, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Appointment } from '@shared/types';
import { Link } from 'wouter';

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  onCheckIn?: (appointmentId: number) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointmentId: number) => void;
  onComplete?: (appointmentId: number) => void;
  onStartVideo?: (appointmentId: number) => void;
  onEditNotes?: (appointmentId: number) => void;
}

const AppointmentList = ({ 
  appointments, 
  loading = false,
  onCheckIn,
  onReschedule,
  onCancel,
  onComplete,
  onStartVideo,
  onEditNotes
}: AppointmentListProps) => {
  
  // Render loading skeleton
  if (loading) {
    return (
      <div className="p-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b last:border-0 py-3">
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[60px]">
                <Skeleton className="h-4 w-10 mb-1" />
                <Skeleton className="h-3 w-6 mx-auto" />
              </div>
              <Skeleton className="h-10 w-2 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If no appointments
  if (appointments.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No appointments scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-0">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="border-b last:border-0 py-3">
          <div className="flex items-center gap-4">
            <div className="text-center min-w-[60px]">
              <div className="text-sm font-medium">{formatAppointmentTime(new Date(appointment.startTime))}</div>
              <div className="text-xs text-muted-foreground">
                {calculateAppointmentDuration(new Date(appointment.startTime), new Date(appointment.endTime))}
              </div>
            </div>
            <div className={`w-2 h-10 ${getStatusColor(appointment.status)} rounded-full`}></div>
            <div className="flex-1">
              <Link href={`/patients/${appointment.patientId}`}>
                <a className="font-medium hover:underline">
                  {appointment.patient ? getPatientFullName(appointment.patient) : 'Unknown Patient'}
                </a>
              </Link>
              <div className="text-sm text-muted-foreground">
                {appointment.title}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${appointment.status === 'virtual' || appointment.appointmentType === 'telehealth' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                {appointment.status === 'virtual' || appointment.appointmentType === 'telehealth' ? 'Virtual' : getStatusBadgeText(appointment.status)}
              </Badge>
              
              <div className="flex gap-1">
                {appointment.status === 'scheduled' && onCheckIn && (
                  <Button size="icon" variant="outline" onClick={() => onCheckIn(appointment.id)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                {appointment.status === 'check-in' && onComplete && (
                  <Button size="icon" variant="outline" onClick={() => onComplete(appointment.id)}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                {appointment.appointmentType === 'telehealth' && appointment.status !== 'cancelled' && appointment.status !== 'completed' && onStartVideo && (
                  <Button size="icon" variant="outline" onClick={() => onStartVideo(appointment.id)}>
                    <PhoneCall className="h-4 w-4" />
                  </Button>
                )}
                
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && onReschedule && (
                  <Button size="icon" variant="outline" onClick={() => onReschedule(appointment)}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                )}
                
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && onCancel && (
                  <Button size="icon" variant="outline" onClick={() => onCancel(appointment.id)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
                
                {onEditNotes && (
                  <Button size="icon" variant="outline" onClick={() => onEditNotes(appointment.id)}>
                    <FileEdit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;
