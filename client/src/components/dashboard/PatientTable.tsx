import { useState } from 'react';
import { Link } from 'wouter';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Patient } from '@shared/types';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getInitials, 
  getStatusBadgeText, 
  getStatusColor, 
  formatDate, 
  calculateAge,
  generateAvatarColor
} from '@/lib/utils';
import { MessageSquare, Calendar, FileEdit } from 'lucide-react';

interface PatientTableProps {
  patients: Patient[];
  loading?: boolean;
  onMessage?: (patientId: number) => void;
  onSchedule?: (patientId: number) => void;
  onEdit?: (patientId: number) => void;
}

const PatientTable = ({ 
  patients, 
  loading = false,
  onMessage,
  onSchedule,
  onEdit
}: PatientTableProps) => {

  // Render loading skeleton
  if (loading) {
    return (
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Next Appointment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(4).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // If no patients
  if (patients.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead>Next Appointment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const avatarColor = generateAvatarColor(`${patient.firstName} ${patient.lastName}`);
            const initials = getInitials(patient.firstName, patient.lastName);
            
            return (
              <TableRow key={patient.id} className="hover:bg-muted/50">
                <TableCell className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback style={{ backgroundColor: avatarColor, color: 'white' }}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/patients/${patient.id}`}>
                        <a className="font-medium hover:underline">
                          {patient.firstName} {patient.lastName}
                        </a>
                      </Link>
                      <div className="text-xs text-muted-foreground">ID: {patient.patientId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusColor(patient.status).replace('bg-', 'bg-opacity-20 text-')}`}>
                    {getStatusBadgeText(patient.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {patient.lastVisitDate ? formatDate(patient.lastVisitDate) : 'N/A'}
                </TableCell>
                <TableCell>
                  <span className="text-primary font-medium">
                    {/* This would be populated from appointments data */}
                    {patient.id % 3 === 0 ? 'Today, 2:30 PM' : patient.id % 3 === 1 ? 'Tomorrow, 10:00 AM' : 'No upcoming'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onMessage && (
                      <Button size="icon" variant="outline" onClick={() => onMessage(patient.id)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                    {onSchedule && (
                      <Button size="icon" variant="outline" onClick={() => onSchedule(patient.id)}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button size="icon" variant="outline" onClick={() => onEdit(patient.id)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientTable;
