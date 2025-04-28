import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Subscription form component
const SubscribeForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings/subscription/success`,
        },
      });
      
      if (error) {
        toast({
          title: "Subscription Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Processing",
          description: "You will be redirected shortly.",
        });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isLoading}
      >
        {isLoading ? "Processing..." : "Subscribe Now"}
      </Button>
    </form>
  );
};

// Plan selection component
const PlanSelection = ({ onSelectPlan }: { onSelectPlan: (priceId: string) => void }) => {
  const [selectedPlan, setSelectedPlan] = useState("");
  
  // Fetch available subscription plans
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['/api/billing/subscription-plans'],
    retry: 1
  });
  
  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
  };
  
  const handleSubscribe = () => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        Error loading subscription plans. Please try again later.
      </div>
    );
  }
  
  // If no plans are available or we couldn't fetch them, show dummy plans
  const availablePlans = plans?.data || [
    { id: 'price_solo', name: 'Solo Practice', price: 149, features: ['Single provider account', 'Up to 500 patient records', 'Basic appointment scheduling'] },
    { id: 'price_group', name: 'Group Practice', price: 299, features: ['Up to 5 provider accounts', 'Up to 2,000 patient records', 'Advanced scheduling features'] },
    { id: 'price_enterprise', name: 'Enterprise', price: 499, features: ['Unlimited provider accounts', 'Unlimited patient records', 'Custom workflows'] }
  ];
  
  return (
    <div className="space-y-6">
      <RadioGroup value={selectedPlan} onValueChange={handlePlanChange}>
        {availablePlans.map((plan) => (
          <div key={plan.id} className="flex">
            <div className="flex items-center h-5 mt-1">
              <RadioGroupItem value={plan.id} id={plan.id} />
            </div>
            <div className="ml-3 text-sm w-full">
              <Label htmlFor={plan.id} className="flex justify-between font-medium">
                <span>{plan.name}</span>
                <span>${plan.price}/month</span>
              </Label>
              <ul className="mt-1 text-muted-foreground">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary mr-2">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </RadioGroup>
      
      <Button 
        onClick={handleSubscribe}
        className="w-full"
        disabled={!selectedPlan}
      >
        Continue to Payment
      </Button>
    </div>
  );
};

// Current subscription component
const CurrentSubscription = ({ onCancel, onUpgrade }) => {
  // Fetch current subscription
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['/api/billing/subscription'],
    retry: 1
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        Error loading subscription details. Please try again later.
      </div>
    );
  }
  
  // If no subscription or we couldn't fetch it, show a message
  const currentPlan = subscription?.data || {
    planName: 'Solo Practice',
    status: 'active',
    renewalDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 149
  };
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-medium">{currentPlan.planName}</h3>
            <p className="text-sm text-muted-foreground">
              Status: <span className="capitalize">{currentPlan.status}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">${currentPlan.amount}/month</p>
            <p className="text-sm text-muted-foreground">
              Next renewal: {currentPlan.renewalDate}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onUpgrade} className="flex-1">
            Upgrade Plan
          </Button>
          <Button variant="destructive" onClick={onCancel} className="flex-1">
            Cancel Subscription
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border p-4">
        <h3 className="font-medium mb-2">Payment Method</h3>
        <div className="flex items-center">
          <div className="h-8 w-12 bg-muted rounded flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">•••• •••• •••• 4242</p>
            <p className="text-xs text-muted-foreground">Expires 12/2025</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto">
            Update
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border p-4">
        <h3 className="font-medium mb-2">Billing History</h3>
        <div className="text-sm">
          <div className="flex justify-between py-2 border-b">
            <p>April 1, 2025</p>
            <p className="font-medium">${currentPlan.amount}.00</p>
          </div>
          <div className="flex justify-between py-2 border-b">
            <p>March 1, 2025</p>
            <p className="font-medium">${currentPlan.amount}.00</p>
          </div>
          <div className="flex justify-between py-2">
            <p>February 1, 2025</p>
            <p className="font-medium">${currentPlan.amount}.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SubscriptionSettings() {
  const [subscriptionState, setSubscriptionState] = useState<'current' | 'select' | 'payment'>('current');
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Check if user has an active subscription
  const { data: currentSubscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['/api/billing/subscription'],
    enabled: isAuthenticated && subscriptionState === 'current',
    retry: 1
  });
  
  const hasSubscription = currentSubscription?.data?.status === 'active';
  
  const handleSelectPlan = async (priceId: string) => {
    setIsLoading(true);
    setSelectedPriceId(priceId);
    
    try {
      const response = await apiRequest("POST", "/api/get-or-create-subscription", { priceId });
      
      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setSubscriptionState('payment');
    } catch (err) {
      setError("Failed to create subscription: " + (err.message || "Unknown error"));
      toast({
        title: "Subscription Error",
        description: "Could not create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpgrade = () => {
    setSubscriptionState('select');
  };
  
  const handleCancel = async () => {
    if (!currentSubscription?.data?.id) {
      toast({
        title: "Error",
        description: "Could not find subscription to cancel.",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", `/api/billing/subscription/${currentSubscription.data.id}/cancel`, {});
      
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled and will end at the end of your billing period.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubscriptionSuccess = () => {
    setSubscriptionState('current');
    toast({
      title: "Subscription Active",
      description: "Your subscription is now active.",
    });
  };
  
  // Show the appropriate view based on the subscription state
  const renderContent = () => {
    if (loadingSubscription) {
      return (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (subscriptionState === 'current') {
      return <CurrentSubscription onCancel={handleCancel} onUpgrade={handleUpgrade} />;
    } else if (subscriptionState === 'select') {
      return <PlanSelection onSelectPlan={handleSelectPlan} />;
    } else if (subscriptionState === 'payment' && clientSecret) {
      return (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <SubscribeForm onSuccess={handleSubscriptionSuccess} />
        </Elements>
      );
    }
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription plan and billing details
        </p>
      </div>
      
      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>
                {subscriptionState === 'current' ? 'Your Subscription' : 
                 subscriptionState === 'select' ? 'Select a Plan' : 'Complete Subscription'}
              </CardTitle>
              <CardDescription>
                {subscriptionState === 'current' ? 'Manage your current subscription' : 
                 subscriptionState === 'select' ? 'Choose the plan that works for your practice' : 
                 'Complete your subscription payment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                  {error}
                </div>
              ) : null}
              
              {renderContent()}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              {subscriptionState !== 'current' && (
                <Button 
                  variant="ghost" 
                  onClick={() => setSubscriptionState('current')}
                  disabled={isLoading}
                >
                  Go Back
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-sm">Date</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Description</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Amount</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Status</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-sm">Apr 1, 2025</td>
                      <td className="py-3 px-4 text-sm">Monthly Subscription</td>
                      <td className="py-3 px-4 text-sm">$149.00</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                          </svg>
                          PDF
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-sm">Mar 1, 2025</td>
                      <td className="py-3 px-4 text-sm">Monthly Subscription</td>
                      <td className="py-3 px-4 text-sm">$149.00</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                          </svg>
                          PDF
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm">Feb 1, 2025</td>
                      <td className="py-3 px-4 text-sm">Monthly Subscription</td>
                      <td className="py-3 px-4 text-sm">$149.00</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Button variant="ghost" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                          </svg>
                          PDF
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}