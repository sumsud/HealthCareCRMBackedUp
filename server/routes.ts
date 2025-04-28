import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil" as any, // Using type assertion to handle version discrepancy
}) : null;

// Controllers
import * as authController from "./controllers/auth";
import * as patientsController from "./controllers/patients";
import * as appointmentsController from "./controllers/appointments";
import * as messagesController from "./controllers/messages";
import * as billingController from "./controllers/billing";
import * as aiController from "./controllers/ai";

// Middleware
import { authenticateJWT, requireRole } from "./middleware/auth";
import { logRequest, logAccess } from "./middleware/logger";
import { hipaaCompliance, secureCookies, contentSecurityPolicy } from "./middleware/security";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Apply global middleware
  app.use(logRequest);
  app.use(hipaaCompliance);
  app.use(secureCookies);
  app.use(contentSecurityPolicy);

  // Auth routes
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  app.post("/api/auth/forgot-password", authController.forgotPassword);
  app.post("/api/auth/reset-password", authController.resetPassword);
  app.get("/api/auth/profile", authenticateJWT, authController.getProfile);
  app.put("/api/auth/profile", authenticateJWT, authController.updateProfile);
  app.post("/api/auth/enable-two-factor", authenticateJWT, authController.enableTwoFactor);
  app.post("/api/auth/verify-two-factor", authController.verifyTwoFactor);

  // Patient routes
  app.get("/api/patients", authenticateJWT, logAccess("patient", "view"), patientsController.getPatients);
  app.get("/api/patients/:id", authenticateJWT, logAccess("patient", "view"), patientsController.getPatientById);
  app.post("/api/patients", authenticateJWT, logAccess("patient", "create"), patientsController.createPatient);
  app.put("/api/patients/:id", authenticateJWT, logAccess("patient", "update"), patientsController.updatePatient);
  app.patch("/api/patients/:id/archive", authenticateJWT, logAccess("patient", "update"), patientsController.archivePatient);
  
  // Clinical notes
  app.get("/api/patients/:id/clinical-notes", authenticateJWT, logAccess("clinicalNote", "view"), patientsController.getClinicalNotes);
  app.post("/api/patients/:id/clinical-notes", authenticateJWT, logAccess("clinicalNote", "create"), patientsController.createClinicalNote);
  app.put("/api/clinical-notes/:id", authenticateJWT, logAccess("clinicalNote", "update"), patientsController.updateClinicalNote);
  app.post("/api/clinical-notes/:id/sign", authenticateJWT, requireRole(["physician"]), logAccess("clinicalNote", "update"), patientsController.signClinicalNote);

  // Appointment routes
  app.get("/api/appointments", authenticateJWT, logAccess("appointment", "view"), appointmentsController.getAppointments);
  app.get("/api/appointments/:id", authenticateJWT, logAccess("appointment", "view"), appointmentsController.getAppointmentById);
  app.post("/api/appointments", authenticateJWT, logAccess("appointment", "create"), appointmentsController.createAppointment);
  app.put("/api/appointments/:id", authenticateJWT, logAccess("appointment", "update"), appointmentsController.updateAppointment);
  app.post("/api/appointments/:id/cancel", authenticateJWT, logAccess("appointment", "update"), appointmentsController.cancelAppointment);
  app.post("/api/appointments/:id/check-in", authenticateJWT, logAccess("appointment", "update"), appointmentsController.checkInAppointment);
  app.post("/api/appointments/:id/complete", authenticateJWT, logAccess("appointment", "update"), appointmentsController.completeAppointment);
  app.post("/api/appointments/:id/reschedule", authenticateJWT, logAccess("appointment", "update"), appointmentsController.rescheduleAppointment);

  // Message routes
  app.get("/api/messages", authenticateJWT, logAccess("message", "view"), messagesController.getMessages);
  app.get("/api/messages/unread-count", authenticateJWT, messagesController.getUnreadCount);
  app.get("/api/messages/thread/:threadId", authenticateJWT, logAccess("message", "view"), messagesController.getThread);
  app.post("/api/messages", authenticateJWT, logAccess("message", "create"), messagesController.createMessage);
  app.post("/api/messages/reply", authenticateJWT, logAccess("message", "create"), messagesController.replyToMessage);
  app.post("/api/messages/:id/read", authenticateJWT, logAccess("message", "update"), messagesController.markAsRead);
  app.post("/api/messages/:id/archive", authenticateJWT, logAccess("message", "update"), messagesController.archiveMessage);

  // Billing routes
  app.get("/api/billing/invoices", authenticateJWT, logAccess("invoice", "view"), billingController.getInvoices);
  app.get("/api/billing/invoices/:id", authenticateJWT, logAccess("invoice", "view"), billingController.getInvoiceById);
  app.post("/api/billing/invoices", authenticateJWT, logAccess("invoice", "create"), billingController.createInvoice);
  app.put("/api/billing/invoices/:id", authenticateJWT, logAccess("invoice", "update"), billingController.updateInvoice);
  app.post("/api/billing/payments", authenticateJWT, logAccess("payment", "create"), billingController.recordPayment);
  app.get("/api/billing/stats", authenticateJWT, billingController.getBillingStats);
  
  // Subscription routes
  app.get("/api/billing/subscription-plans", billingController.getSubscriptionPlans);
  app.get("/api/billing/subscription", authenticateJWT, billingController.getCurrentSubscription);
  app.post("/api/billing/subscription", authenticateJWT, billingController.createSubscription);
  app.put("/api/billing/subscription/:id", authenticateJWT, billingController.updateSubscription);
  app.post("/api/billing/subscription/:id/cancel", authenticateJWT, billingController.cancelSubscription);
  app.post("/api/billing/create-checkout-session", authenticateJWT, billingController.createCheckoutSession);
  app.post("/api/billing/webhook", billingController.handleStripeWebhook);

  // AI assistant routes
  app.get("/api/ai/chat-sessions", authenticateJWT, logAccess("aiChat", "view"), aiController.getChatSessions);
  app.get("/api/ai/chat-sessions/:id", authenticateJWT, logAccess("aiChat", "view"), aiController.getChatSession);
  app.post("/api/ai/chat-sessions", authenticateJWT, logAccess("aiChat", "create"), aiController.createChatSession);
  app.put("/api/ai/chat-sessions/:id", authenticateJWT, logAccess("aiChat", "update"), aiController.updateChatSession);
  app.delete("/api/ai/chat-sessions/:id", authenticateJWT, logAccess("aiChat", "delete"), aiController.deleteChatSession);
  app.post("/api/ai/chat-messages", authenticateJWT, logAccess("aiChat", "create"), aiController.sendChatMessage);
  app.post("/api/ai/clinical-query", authenticateJWT, logAccess("aiChat", "create"), aiController.clinicalQuery);
  app.post("/api/ai/code-assistance", authenticateJWT, logAccess("aiChat", "create"), aiController.codeAssistance);
  app.post("/api/ai/generate-note", authenticateJWT, logAccess("aiChat", "create"), aiController.generateNote);

  // Activity routes
  app.get("/api/activities", authenticateJWT, patientsController.getActivities);
  
  // Static HTML pages for auth (temporary solution)
  app.get(["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"], (req, res) => {
    res.sendFile("auth.html", { root: "./client" });
  });

  // Stripe direct payment routes for one-time payments
  app.post("/api/create-payment-intent", authenticateJWT, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' 
        });
      }

      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          message: 'Invalid amount. Please provide a positive amount.'
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Stripe subscription route with customer creation
  app.post('/api/get-or-create-subscription', authenticateJWT, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' 
        });
      }

      const user = req.user;

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

        return res.send({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
      }
      
      if (!user.email) {
        return res.status(400).json({
          message: 'No user email on file'
        });
      }

      try {
        // Create a new customer or use existing
        let customer;
        if (user.stripeCustomerId) {
          customer = await stripe.customers.retrieve(user.stripeCustomerId);
        } else {
          customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
          });
          
          // Update user with new customer ID
          await storage.updateUser(user.id, {
            stripeCustomerId: customer.id
          });
        }

        // Create subscription with the price ID provided
        const { priceId } = req.body;
        
        if (!priceId) {
          return res.status(400).json({
            message: 'Price ID is required'
          });
        }

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: priceId,
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Update user with subscription ID
        await storage.updateUser(user.id, {
          stripeSubscriptionId: subscription.id
        });
    
        res.send({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        console.error('Subscription error:', error);
        return res.status(400).json({ 
          error: { message: error.message } 
        });
      }
    } catch (error: any) {
      console.error('Get or create subscription error:', error);
      res.status(500).json({ 
        message: "Error processing subscription: " + error.message 
      });
    }
  });

  return httpServer;
}
