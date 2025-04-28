import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Appointments() {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your appointments and schedule
          </p>
        </div>
        <Button>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <line x1="10" x2="14" y1="14" y2="14" />
            <line x1="12" x2="12" y1="12" y2="16" />
          </svg>
          New Appointment
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>View and manage your appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex items-center justify-center border rounded-md">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <h3 className="text-xl font-medium mb-2">Appointment calendar would be displayed here</h3>
              <p className="text-muted-foreground">
                View, schedule, and manage appointments with advanced calendar features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}