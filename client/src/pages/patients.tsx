import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Example data - would normally come from API
  const patients = [
    { id: 1, name: "Sarah Johnson", dob: "05/12/1985", contact: "(555) 123-4567", lastVisit: "Apr 23, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
    { id: 2, name: "Michael Chen", dob: "11/04/1972", contact: "(555) 234-5678", lastVisit: "Apr 22, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
    { id: 3, name: "Emily Rodriguez", dob: "08/19/1990", contact: "(555) 345-6789", lastVisit: "Apr 21, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
    { id: 4, name: "David Kim", dob: "03/28/1968", contact: "(555) 456-7890", lastVisit: "Apr 20, 2025", status: "Follow-up", statusColor: "bg-yellow-100 text-yellow-800" },
    { id: 5, name: "Jessica Brown", dob: "12/05/1980", contact: "(555) 567-8901", lastVisit: "Apr 19, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
    { id: 6, name: "Robert Smith", dob: "06/15/1965", contact: "(555) 678-9012", lastVisit: "Apr 18, 2025", status: "Inactive", statusColor: "bg-gray-100 text-gray-800" },
    { id: 7, name: "Maria Garcia", dob: "09/22/1992", contact: "(555) 789-0123", lastVisit: "Apr 17, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
    { id: 8, name: "James Wilson", dob: "02/10/1975", contact: "(555) 890-1234", lastVisit: "Apr 16, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
    { id: 9, name: "Patricia Moore", dob: "07/30/1988", contact: "(555) 901-2345", lastVisit: "Apr 15, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" },
    { id: 10, name: "Thomas Lee", dob: "04/05/1970", contact: "(555) 012-3456", lastVisit: "Apr 14, 2025", status: "Active", statusColor: "bg-green-100 text-green-800" }
  ];
  
  // Filter patients based on search query and active tab
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        patient.contact.includes(searchQuery);
    
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "active") {
      return matchesSearch && patient.status === "Active";
    } else if (activeTab === "followUp") {
      return matchesSearch && patient.status === "Follow-up";
    } else if (activeTab === "inactive") {
      return matchesSearch && patient.status === "Inactive";
    }
    
    return matchesSearch;
  });
  
  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your patient records
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="16" x2="22" y1="11" y2="11" />
            </svg>
            Add New Patient
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Patient List</CardTitle>
          <CardDescription>
            View and manage all of your patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="md:min-w-[300px]"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="followUp">Follow-up</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.dob}</TableCell>
                      <TableCell>{patient.contact}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${patient.statusColor}`}>
                          {patient.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/patients/${patient.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}