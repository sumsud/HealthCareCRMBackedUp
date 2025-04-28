import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      console.log('Reset password for:', values.email);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      
      toast({
        title: "Reset link sent",
        description: "Please check your email for password reset instructions",
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "Please try again later or contact support."
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 sm:p-8">
      <div className="w-full max-w-md mb-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <h1 className="text-xl font-bold">HealthcareCRM</h1>
          </div>
          <h1 className="text-2xl font-bold mt-6">Forgot password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {isSubmitted ? (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 7.99a.998.998 0 0 0-.687-.857L12 4 2.687 7.143a1 1 0 0 0 0 1.714L12 12l9.313-3.143a1 1 0 0 0 .687-.857Z"></path>
                      <path d="M2 17.5v-5.07l.5.17"></path>
                      <path d="M22 12v5.5a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2v-5.5"></path>
                      <path d="M18 16v-7.5"></path>
                      <path d="M18 12v-7.5"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">Check your email</h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to your email address. Please check your inbox.
                </p>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>
              </Form>
            )}
            
            {!isSubmitted && (
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
                    Back to login
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}