import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Dashboard components
const StatsCard = ({ title, value, description, icon, trend = null, color = "blue" }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                <span className="mr-1">
                  {trend.positive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </span>
                {trend.value}
              </div>
            )}
            {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 text-${color}-500`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AppointmentList = ({ appointments, title, emptyMessage }) => {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 py-6 px-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-muted-foreground">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${appointment.statusColor}`}></div>
                  <div>
                    <p className="font-medium">{appointment.patientName}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time} - {appointment.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/appointments/${appointment.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/appointments">View All Appointments</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityFeed = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest activities in your practice</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-muted-foreground">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`p-2 rounded-full bg-${activity.color}-100 text-${activity.color}-500 mt-0.5`}>
                  {activity.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FinancialOverview = ({ data }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
        <CardDescription>Summary of your financial performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</p>
            <div className={`flex items-center text-xs ${data.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span className="mr-1">
                {data.revenueChange >= 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </span>
              {data.revenueChange}% vs. last month
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold">${data.outstanding.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{data.outstandingInvoices} unpaid invoices</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Avg. Revenue / Patient</p>
            <p className="text-2xl font-bold">${data.avgRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Based on {data.patientCount} patients</p>
          </div>
        </div>
        
        <div className="h-[200px] flex items-center justify-center border-t pt-4">
          <div className="text-muted-foreground text-center">
            <p>Financial chart visualization would appear here</p>
            <p className="text-xs">Showing revenue trends over time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientTable = ({ patients }) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Patients</CardTitle>
        <CardDescription>Most recently updated patient records</CardDescription>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-muted-foreground">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-muted-foreground">No patients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm">
                  <th className="font-medium text-left py-3 px-4">Name</th>
                  <th className="font-medium text-left py-3 px-4">Date of Birth</th>
                  <th className="font-medium text-left py-3 px-4">Last Visit</th>
                  <th className="font-medium text-left py-3 px-4">Status</th>
                  <th className="font-medium text-right py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="font-medium">{patient.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{patient.dob}</td>
                    <td className="py-3 px-4 text-sm">{patient.lastVisit}</td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${patient.statusColor}`}>
                        {patient.status}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/patients">View All Patients</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ComplianceStatus = ({ complianceData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>HIPAA Compliance Status</CardTitle>
        <CardDescription>Security and compliance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complianceData.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                {item.status === 'compliant' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : item.status === 'warning' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 mr-2">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" x2="12" y1="9" y2="13" />
                    <line x1="12" x2="12.01" y1="17" y2="17" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" x2="9" y1="9" y2="15" />
                    <line x1="9" x2="15" y1="9" y2="15" />
                  </svg>
                )}
                <span className="text-sm">{item.name}</span>
              </div>
              {item.status !== 'compliant' && (
                <Button variant="ghost" size="sm">Fix</Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Overall Compliance</div>
            <div className="text-sm font-medium">{complianceData.overallPercentage}%</div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`rounded-full h-2 ${complianceData.overallPercentage >= 90 ? 'bg-green-500' : complianceData.overallPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${complianceData.overallPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last audit: {complianceData.lastAudit}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Example data - this would normally come from API calls
  const dashboardData = {
    stats: [
      { 
        title: "Total Patients", 
        value: "156", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        trend: { value: "12%", positive: true },
        color: "blue"
      },
      { 
        title: "Appointments Today", 
        value: "8", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        ),
        description: "2 remaining",
        color: "green"
      },
      { 
        title: "New Messages", 
        value: "12", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
        description: "4 unread patient messages",
        color: "orange"
      },
      { 
        title: "Revenue This Month", 
        value: "$24,580", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
        trend: { value: "8%", positive: true },
        color: "green"
      }
    ],
    appointments: [
      { id: 1, patientName: "Sarah Johnson", time: "9:00 AM", type: "Annual Physical", status: "Confirmed", statusColor: "bg-green-500" },
      { id: 2, patientName: "Michael Chen", time: "10:30 AM", type: "Follow-up", status: "Checked In", statusColor: "bg-blue-500" },
      { id: 3, patientName: "Emily Rodriguez", time: "1:15 PM", type: "Consultation", status: "Confirmed", statusColor: "bg-green-500" },
      { id: 4, patientName: "David Kim", time: "3:00 PM", type: "Telehealth", status: "Confirmed", statusColor: "bg-green-500" }
    ],
    activities: [
      { 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        ), 
        title: "New patient registered", 
        description: "Robert Anderson completed registration", 
        time: "10 minutes ago",
        color: "blue"
      },
      { 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        ), 
        title: "Appointment rescheduled", 
        description: "James Wilson moved to April 30", 
        time: "1 hour ago",
        color: "orange"
      },
      { 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
          </svg>
        ), 
        title: "Clinical note created", 
        description: "Dr. Carter created note for Maria Lopez", 
        time: "2 hours ago",
        color: "green"
      },
      { 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        ), 
        title: "Payment received", 
        description: "Received $185 from insurance for James Wilson", 
        time: "4 hours ago",
        color: "green"
      }
    ],
    financial: {
      totalRevenue: 24580,
      revenueChange: 8.5,
      outstanding: 4215,
      outstandingInvoices: 6,
      avgRevenue: 280,
      patientCount: 156
    },
    patients: [
      { id: 1, name: "Sarah Johnson", dob: "05/12/1985", lastVisit: "Apr 23, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
      { id: 2, name: "Michael Chen", dob: "11/04/1972", lastVisit: "Apr 22, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
      { id: 3, name: "Emily Rodriguez", dob: "08/19/1990", lastVisit: "Apr 21, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
      { id: 4, name: "David Kim", dob: "03/28/1968", lastVisit: "Apr 20, 2025", status: "Follow-up", statusColor: "bg-yellow-100 text-yellow-800" },
      { id: 5, name: "Jessica Brown", dob: "12/05/1980", lastVisit: "Apr 19, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" }
    ],
    compliance: {
      items: [
        { name: "Data Encryption", status: "compliant" },
        { name: "Access Controls", status: "compliant" },
        { name: "Audit Logs", status: "compliant" },
        { name: "Backup & Recovery", status: "warning", action: "Update" },
        { name: "Security Risk Assessment", status: "non-compliant", action: "Required" }
      ],
      overallPercentage: 85,
      lastAudit: "Apr 15, 2025"
    }
  };

  // Query stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: false // Disabled for this demo
  });

  // Query appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/today'],
    enabled: false // Disabled for this demo
  });

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Good morning, {user?.firstName || "Doctor"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your practice today
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardData.stats.map((stat, index) => (
              <StatsCard 
                key={index}
                title={stat.title} 
                value={stat.value} 
                description={stat.description}
                icon={stat.icon}
                trend={stat.trend}
                color={stat.color}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AppointmentList 
              appointments={dashboardData.appointments} 
              title="Today's Appointments"
              emptyMessage="No appointments scheduled for today"
            />
            <ActivityFeed activities={dashboardData.activities} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FinancialOverview data={dashboardData.financial} />
            <ComplianceStatus complianceData={dashboardData.compliance} />
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <PatientTable patients={dashboardData.patients} />
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>Manage your upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <div className="text-muted-foreground text-center">
                  <p>Calendar view would appear here</p>
                  <p className="text-xs">Showing appointments for the current week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances">
          <Card>
            <CardHeader>
              <CardTitle>Financial Dashboard</CardTitle>
              <CardDescription>Track your practice's financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <div className="text-muted-foreground text-center">
                  <p>Financial dashboard would appear here</p>
                  <p className="text-xs">Showing revenue, expenses, and outstanding balances</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}