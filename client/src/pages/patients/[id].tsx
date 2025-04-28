import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { RootState } from "@/store";

interface PatientDetailProps {
  id: string;
}

export default function PatientDetail({ id }: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Example data - would normally come from API
  const patient = {
    id: parseInt(id),
    firstName: "Sarah",
    lastName: "Johnson",
    dateOfBirth: "May 12, 1985",
    gender: "Female",
    email: "sarah.johnson@example.com",
    phoneNumber: "(555) 123-4567",
    address: "123 Main St, San Francisco, CA 94105",
    insurance: "Blue Cross Blue Shield",
    insuranceMemberId: "BCB123456789",
    insuranceGroupId: "GRP987654",
    primaryCarePhysician: "Dr. Michael Chen",
    allergies: "Penicillin, Peanuts",
    medicalConditions: "Asthma, Hypertension",
    medications: "Albuterol, Lisinopril",
    emergencyContactName: "John Johnson",
    emergencyContactPhone: "(555) 987-6543",
    lastVisitDate: "April 23, 2025",
    nextAppointment: "May 15, 2025",
    status: "Active",
    registrationDate: "January 10, 2023",
    consentToTreat: true,
    consentToShare: true,
    preferredLanguage: "English"
  };
  
  const appointments = [
    { id: 101, date: "April 23, 2025", time: "9:00 AM", provider: "Dr. Smith", type: "Annual Physical", status: "Completed" },
    { id: 89, date: "March 10, 2025", time: "2:30 PM", provider: "Dr. Smith", type: "Follow-up", status: "Completed" },
    { id: 76, date: "January 15, 2025", time: "11:00 AM", provider: "Dr. Wilson", type: "Consultation", status: "Completed" },
    { id: 55, date: "October 8, 2024", time: "3:45 PM", provider: "Dr. Smith", type: "Urgent Care", status: "Completed" }
  ];
  
  const clinicalNotes = [
    { id: 201, date: "April 23, 2025", provider: "Dr. Smith", type: "Progress Note", title: "Annual Physical Examination" },
    { id: 189, date: "March 10, 2025", provider: "Dr. Smith", type: "Progress Note", title: "Follow-up for Hypertension" },
    { id: 176, date: "January 15, 2025", provider: "Dr. Wilson", type: "Consultation", title: "Cardiology Consultation" },
    { id: 155, date: "October 8, 2024", provider: "Dr. Smith", type: "Progress Note", title: "Urgent Care - Respiratory Infection" }
  ];
  
  const invoices = [
    { id: 301, date: "April 23, 2025", amount: "$250.00", description: "Annual Physical", status: "Paid" },
    { id: 289, date: "March 10, 2025", amount: "$125.00", description: "Follow-up Visit", status: "Paid" },
    { id: 276, date: "January 15, 2025", amount: "$350.00", description: "Cardiology Consultation", status: "Paid" },
    { id: 255, date: "October 8, 2024", amount: "$175.00", description: "Urgent Care Visit", status: "Paid" }
  ];
  
  const patientTimeline = [
    { date: "April 23, 2025", event: "Annual Physical", description: "Completed annual physical examination" },
    { date: "March 10, 2025", event: "Follow-up Visit", description: "Blood pressure check, medication adjustment" },
    { date: "February 5, 2025", event: "Lab Results", description: "Received and reviewed complete blood count results" },
    { date: "January 15, 2025", event: "Specialist Consultation", description: "Cardiology consultation with Dr. Wilson" },
    { date: "December 8, 2024", event: "Prescription Refill", description: "Refilled Lisinopril prescription" },
    { date: "October 8, 2024", event: "Urgent Care Visit", description: "Treated for upper respiratory infection" }
  ];
  
  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/patients">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{patient.firstName} {patient.lastName}</h1>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {patient.status}
            </span>
          </div>
          <p className="text-muted-foreground">
            Patient #{patient.id} • DOB: {patient.dateOfBirth} • Last Visit: {patient.lastVisitDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
            New Note
          </Button>
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            Billing
          </Button>
          <Button size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Edit Patient
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>Personal and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p>{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p>{patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p>{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferred Language</p>
                    <p>{patient.preferredLanguage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{patient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{patient.phoneNumber}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{patient.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                    <p>{patient.emergencyContactName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emergency Phone</p>
                    <p>{patient.emergencyContactPhone}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-medium mb-3">Insurance Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Insurance Provider</p>
                      <p>{patient.insurance}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member ID</p>
                      <p>{patient.insuranceMemberId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Group ID</p>
                      <p>{patient.insuranceGroupId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Primary Care Physician</p>
                      <p>{patient.primaryCarePhysician}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-medium mb-3">Medical Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                      <p>{patient.allergies}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Medical Conditions</p>
                      <p>{patient.medicalConditions}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Current Medications</p>
                      <p>{patient.medications}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-medium mb-3">Consent Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Consent to Treat</p>
                      <p>{patient.consentToTreat ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Consent to Share Information</p>
                      <p>{patient.consentToShare ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                      <p>{patient.registrationDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Next Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">{patient.nextAppointment}</p>
                      <p className="text-sm text-muted-foreground">10:30 AM with Dr. Smith</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button variant="ghost" size="sm" className="w-[48%]">
                      Cancel
                    </Button>
                    <Button size="sm" className="w-[48%]">
                      Check In
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Patient Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="relative border-l border-muted-foreground/20 space-y-6">
                    {patientTimeline.slice(0, 3).map((item, index) => (
                      <li key={index} className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3 ring-8 ring-background">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </span>
                        <h3 className="font-medium">{item.event}</h3>
                        <time className="block text-xs text-muted-foreground">{item.date}</time>
                        <p className="text-sm mt-1">{item.description}</p>
                      </li>
                    ))}
                  </ol>
                  <Button variant="link" size="sm" className="mt-2 px-0">
                    View Full Timeline
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>
                Past and scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium text-sm">Date & Time</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Provider</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Type</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Status</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="py-3 px-4">
                          <div className="font-medium">{appointment.date}</div>
                          <div className="text-sm text-muted-foreground">{appointment.time}</div>
                        </td>
                        <td className="py-3 px-4">{appointment.provider}</td>
                        <td className="py-3 px-4">{appointment.type}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {appointment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
              <CardDescription>
                Medical documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium text-sm">Date</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Provider</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Note Type</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Title</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clinicalNotes.map((note) => (
                      <tr key={note.id}>
                        <td className="py-3 px-4">
                          <div className="font-medium">{note.date}</div>
                        </td>
                        <td className="py-3 px-4">{note.provider}</td>
                        <td className="py-3 px-4">{note.type}</td>
                        <td className="py-3 px-4">{note.title}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            View Note
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Invoices</CardTitle>
              <CardDescription>
                Payment history and outstanding balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">$0.00</div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">$900.00</div>
                    <p className="text-sm text-muted-foreground">Total Billed YTD</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold mb-1">$650.00</div>
                    <p className="text-sm text-muted-foreground">Insurance Paid YTD</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium text-sm">Date</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Description</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Amount</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Status</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="py-3 px-4">
                          <div className="font-medium">{invoice.date}</div>
                        </td>
                        <td className="py-3 px-4">{invoice.description}</td>
                        <td className="py-3 px-4">{invoice.amount}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            View Invoice
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Uploaded and generated documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-6">
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  Upload Document
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div>
                        <p className="font-medium">Insurance Card</p>
                        <p className="text-xs text-muted-foreground">Uploaded Apr 23, 2025</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="ghost" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
                          <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
                        </svg>
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div>
                        <p className="font-medium">Medical History Form</p>
                        <p className="text-xs text-muted-foreground">Uploaded Jan 10, 2023</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="ghost" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
                          <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
                        </svg>
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div>
                        <p className="font-medium">Lab Results</p>
                        <p className="text-xs text-muted-foreground">Uploaded Feb 5, 2025</p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="ghost" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
                          <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
                        </svg>
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}