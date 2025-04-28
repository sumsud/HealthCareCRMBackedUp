import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header/Navigation */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <h1 className="text-2xl font-bold">HealthcareCRM</h1>
        </div>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-20 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              HIPAA-Compliant Healthcare Management Solution
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              Streamline your practice workflows, enhance patient care, and ensure regulatory compliance with our comprehensive healthcare CRM solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Schedule Demo
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-48 w-48 text-primary/30"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Designed for Healthcare Providers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Patient Management"
            description="Comprehensive patient profiles with medical history, insurance information, and treatment plans."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <FeatureCard
            title="Appointment Scheduling"
            description="Intuitive calendar interface for managing appointments with automated reminders and telehealth integration."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
            }
          />
          <FeatureCard
            title="Secure Messaging"
            description="HIPAA-compliant communication between providers and patients with attachment support."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            }
          />
          <FeatureCard
            title="Billing & Insurance"
            description="Streamlined billing workflow with insurance verification, claim submission, and payment processing."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            }
          />
          <FeatureCard
            title="Clinical Documentation"
            description="Customizable templates for notes, prescriptions, and referrals with AI-assisted documentation."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <line x1="10" x2="8" y1="9" y2="9" />
              </svg>
            }
          />
          <FeatureCard
            title="Analytics & Reporting"
            description="Powerful reporting tools for tracking practice performance, patient outcomes, and financial metrics."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" x2="18" y1="20" y2="10" />
                <line x1="12" x2="12" y1="20" y2="4" />
                <line x1="6" x2="6" y1="20" y2="14" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto py-20 px-4 bg-muted/30 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">
          Plans That Scale With Your Practice
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Solo Practice"
            price="149"
            description="Perfect for individual practitioners"
            features={[
              "Single provider account",
              "Up to 500 patient records",
              "Basic appointment scheduling",
              "Patient portal",
              "Standard reports",
              "Email support"
            ]}
            buttonLabel="Start Free Trial"
            buttonVariant="outline"
          />
          <PricingCard
            title="Group Practice"
            price="299"
            description="Ideal for small group practices"
            features={[
              "Up to 5 provider accounts",
              "Up to 2,000 patient records",
              "Advanced scheduling features",
              "Patient portal with messaging",
              "Custom reports",
              "Priority email & phone support"
            ]}
            buttonLabel="Start Free Trial"
            buttonVariant="default"
            highlighted={true}
          />
          <PricingCard
            title="Enterprise"
            price="Custom"
            description="For larger medical organizations"
            features={[
              "Unlimited provider accounts",
              "Unlimited patient records",
              "Custom workflows",
              "Advanced analytics",
              "API access",
              "Dedicated account manager"
            ]}
            buttonLabel="Contact Sales"
            buttonVariant="outline"
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Trusted by Healthcare Providers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="This CRM has transformed our practice. Patient management is seamless, and the billing integration has reduced our administrative work by 40%."
            author="Dr. Sarah Johnson"
            role="Family Medicine"
          />
          <TestimonialCard
            quote="The HIPAA compliance features give us peace of mind, and the telehealth integration has been a game-changer for our rural patients."
            author="Dr. Michael Chen"
            role="Internal Medicine"
          />
          <TestimonialCard
            quote="Implementation was smooth, and the support team has been incredibly responsive. Our staff picked up the system within days."
            author="Lisa Rodriguez"
            role="Practice Manager"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-20 px-4">
        <div className="bg-primary/10 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare providers who have streamlined their practices with our HIPAA-compliant CRM solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
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
                <h3 className="text-lg font-bold">HealthcareCRM</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                HIPAA-compliant CRM designed specifically for healthcare providers.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Security</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Support</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Training</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HealthcareCRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <Card className="border-0 shadow-none bg-background/50">
      <CardContent className="p-6">
        <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
          {icon}
        </div>
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({ title, price, description, features, buttonLabel, buttonVariant, highlighted = false }) {
  return (
    <Card className={`overflow-hidden ${highlighted ? 'border-primary shadow-lg' : ''}`}>
      <CardContent className="p-0">
        {highlighted && (
          <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
            Most Popular
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-bold">{title}</h3>
          <div className="mt-4 mb-4">
            <span className="text-4xl font-bold">${price}</span>
            {price !== "Custom" && <span className="text-muted-foreground">/month</span>}
          </div>
          <p className="text-muted-foreground mb-6">{description}</p>
          <Button className="w-full mb-6" variant={buttonVariant}>
            {buttonLabel}
          </Button>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardContent className="p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary/50 mb-4"
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
        <p className="mb-4 italic">{quote}</p>
        <p className="font-bold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </CardContent>
    </Card>
  );
}