import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("chat");
  const [activeSession, setActiveSession] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [message, setMessage] = useState("");
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Example data - would normally come from API
  const chatSessions = [
    { id: 1, title: "Clinical Query Discussion", lastMessage: "2 hours ago", type: "clinical" },
    { id: 2, title: "Coding Assistance", lastMessage: "1 day ago", type: "coding" },
    { id: 3, title: "Documentation Help", lastMessage: "2 days ago", type: "documentation" }
  ];
  
  const patients = [
    { id: 1, name: "Sarah Johnson" },
    { id: 2, name: "Michael Chen" },
    { id: 3, name: "Emily Rodriguez" },
    { id: 4, name: "David Kim" }
  ];
  
  const chatMessages = [
    { id: 1, isUser: true, content: "What are the latest treatment guidelines for type 2 diabetes?", timestamp: "10:30 AM" },
    { id: 2, isUser: false, content: "The American Diabetes Association (ADA) 2025 guidelines recommend a patient-centered approach with metformin typically as first-line therapy. Recent updates emphasize early combination therapy for patients with HbA1c >9%, considerations for GLP-1 receptor agonists or SGLT-2 inhibitors with proven cardiovascular or renal benefits, and individualized treatment goals based on patient characteristics.\n\nKey recommendations include:\n1. Lifestyle modifications (diet, exercise, weight management)\n2. Metformin as first-line pharmacologic therapy\n3. Early combination therapy for those not meeting glycemic targets\n4. Consideration of GLP-1 agonists or SGLT2 inhibitors for patients with cardiovascular disease\n5. Regular screening for complications\n\nWould you like more specific information about any particular aspect of these guidelines?", timestamp: "10:32 AM" }
  ];
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setGeneratingResponse(true);
    
    // In a real application, we would call the API and append the response to the messages
    setTimeout(() => {
      setGeneratingResponse(false);
      // Clear message input
      setMessage("");
      toast({
        title: "Message sent",
        description: "AI is generating a response...",
      });
    }, 1000);
  };
  
  const handleCreateSession = () => {
    toast({
      title: "New session created",
      description: "You can now start asking questions",
    });
  };
  
  const handleGenerateNote = () => {
    toast({
      title: "Generating clinical note",
      description: "The AI is generating a clinical note based on your input",
    });
  };
  
  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered clinical assistant
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList>
          <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Query</TabsTrigger>
          <TabsTrigger value="coding">Coding Assistant</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Chat Sessions</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleCreateSession}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="sr-only">New</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col gap-1 p-2">
                  {chatSessions.map((session) => (
                    <Button
                      key={session.id}
                      variant={activeSession === session.id ? "secondary" : "ghost"}
                      className="justify-start px-3 py-4 h-auto"
                      onClick={() => setActiveSession(session.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{session.title}</span>
                        <span className="text-xs text-muted-foreground">{session.lastMessage}</span>
                      </div>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle>AI Chat Assistant</CardTitle>
                <CardDescription>
                  Ask healthcare-related questions and get evidence-based answers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-y h-[400px] overflow-y-auto p-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-full bg-primary/10 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold">No messages yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start a conversation with the AI assistant
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="mb-1 text-xs opacity-70">{msg.isUser ? 'You' : 'AI Assistant'} • {msg.timestamp}</div>
                            <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                          </div>
                        </div>
                      ))}
                      {generatingResponse && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={generatingResponse}
                  />
                  <Button type="submit" size="icon" onClick={handleSendMessage} disabled={generatingResponse}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="clinical">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Query</CardTitle>
              <CardDescription>
                Ask medical questions and get evidence-based answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Patient Context (Optional)</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Query Type</label>
                  <Select defaultValue="treatment">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treatment">Treatment Guidelines</SelectItem>
                      <SelectItem value="diagnosis">Differential Diagnosis</SelectItem>
                      <SelectItem value="medication">Medication Information</SelectItem>
                      <SelectItem value="research">Latest Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Your Clinical Query</label>
                <Textarea
                  placeholder="Enter your clinical question here..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Submit Query
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Response</h3>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-muted-foreground text-center py-8">
                    Clinical response will appear here after you submit a query
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="coding">
          <Card>
            <CardHeader>
              <CardTitle>Medical Coding Assistant</CardTitle>
              <CardDescription>
                Get help with medical coding and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Code System</label>
                  <Select defaultValue="icd10">
                    <SelectTrigger>
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="icd10">ICD-10</SelectItem>
                      <SelectItem value="cpt">CPT</SelectItem>
                      <SelectItem value="hcpcs">HCPCS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Patient (Optional)</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Service Date</label>
                  <Input type="date" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Describe the Diagnosis/Procedure</label>
                <Textarea
                  placeholder="Describe the diagnosis or procedure in detail..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    <path d="M3 5c0 1.66 4 3 9 3s9-1.34 9-3" />
                    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                  </svg>
                  Find Codes
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Suggested Codes</h3>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-muted-foreground text-center py-8">
                    Coding suggestions will appear here after you submit a query
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Documentation Assistant</CardTitle>
              <CardDescription>
                Generate clinical notes based on your input
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Patient</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Note Type</label>
                  <Select defaultValue="soap">
                    <SelectTrigger>
                      <SelectValue placeholder="Select note type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soap">SOAP Note</SelectItem>
                      <SelectItem value="progress">Progress Note</SelectItem>
                      <SelectItem value="consult">Consultation</SelectItem>
                      <SelectItem value="discharge">Discharge Summary</SelectItem>
                      <SelectItem value="procedure">Procedure Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Visit Details</label>
                <Textarea
                  placeholder="Enter the details of the visit, patient's complaints, findings, and planned treatment..."
                  rows={8}
                  className="resize-none"
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleGenerateNote}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <line x1="10" x2="8" y1="9" y2="9" />
                  </svg>
                  Generate Note
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Generated Note</h3>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-muted-foreground text-center py-8">
                    Generated clinical note will appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}