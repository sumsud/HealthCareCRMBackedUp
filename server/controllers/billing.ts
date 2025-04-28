import { Request, Response } from 'express';
import { storage } from '../storage';
import { createAuditLog } from '../middleware/logger';
import { insertInvoiceSchema } from '@shared/schema';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Get all invoices with filtering and pagination
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { 
      patientId, status, startDate, endDate, page, limit 
    } = req.query;
    
    const options = {
      patientId: patientId ? parseInt(patientId as string) : undefined,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    };
    
    const { invoices, total } = await storage.getInvoices(options);
    
    res.status(200).json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: options.page,
          limit: options.limit,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Get an invoice by id
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await storage.getInvoiceById(parseInt(id));
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

// Create a new invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { invoice, items } = req.body;
    
    // Validate invoice data
    const validatedInvoice = insertInvoiceSchema.parse({
      ...invoice,
      createdBy: req.user?.id,
      status: 'draft'
    });
    
    // Validate items (would use a separate schema in production)
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide at least one invoice item' 
      });
    }
    
    // Create invoice with items
    const newInvoice = await storage.createInvoice(validatedInvoice, items);
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'invoice',
      resourceId: newInvoice.id.toString(),
      description: `Invoice created for patient ID: ${newInvoice.patientId}`
    });
    
    res.status(201).json({
      success: true,
      data: newInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// Update an invoice
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists
    const invoice = await storage.getInvoiceById(parseInt(id));
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }
    
    // Check if invoice can be updated
    if (['paid', 'cancelled'].includes(invoice.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${invoice.status} invoice`
      });
    }
    
    // Update invoice
    const updatedInvoice = await storage.updateInvoice(parseInt(id), req.body);
    
    // Audit log
    await createAuditLog(req, {
      action: 'update',
      resourceType: 'invoice',
      resourceId: id,
      description: `Invoice updated for patient ID: ${invoice.patientId}`
    });
    
    res.status(200).json({
      success: true,
      data: updatedInvoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// Record a payment
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, amount, paymentMethod, notes } = req.body;
    
    // Validate input
    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide invoiceId, amount, and paymentMethod' 
      });
    }
    
    // Check if invoice exists
    const invoice = await storage.getInvoiceById(parseInt(invoiceId));
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }
    
    // Check if payment amount is valid
    if (amount <= 0 || amount > invoice.balance) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment amount. Must be between 0 and ${invoice.balance}`
      });
    }
    
    // Record payment
    const payment = await storage.recordPayment({
      invoiceId: parseInt(invoiceId),
      amount,
      paymentMethod,
      paymentDate: new Date(),
      notes,
      recordedBy: req.user?.id
    });
    
    // Update invoice balance and status
    const newBalance = invoice.balance - amount;
    let newStatus = invoice.status;
    
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (invoice.status === 'draft') {
      newStatus = 'sent';
    }
    
    await storage.updateInvoice(invoice.id, {
      balance: newBalance,
      status: newStatus
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'payment',
      resourceType: 'invoice',
      resourceId: invoiceId,
      description: `Payment of ${amount} recorded for invoice ID: ${invoiceId}`
    });
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

// Get billing stats
export const getBillingStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const stats = await storage.getBillingStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get billing stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch billing stats',
      error: error.message
    });
  }
};

// Get subscription plans
export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    // Fetch plans from Stripe
    const prices = await stripe.prices.list({
      active: true,
      limit: 10,
      expand: ['data.product']
    });
    
    const plans = prices.data.map((price: any) => ({
      id: price.id,
      name: price.product.name,
      description: price.product.description,
      price: price.unit_amount ? price.unit_amount / 100 : 0,
      currency: price.currency,
      interval: price.recurring?.interval,
      features: price.product.metadata?.features ? JSON.parse(price.product.metadata.features) : []
    }));
    
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
};

// Get current subscription
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get user to check if they have a Stripe subscription
    const user = await storage.getUserById(userId);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    
    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    
    res.status(200).json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items.data[0].price.id,
        productId: subscription.items.data[0].price.product
      }
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch current subscription',
      error: error.message
    });
  }
};

// Create a subscription
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { priceId } = req.body;
    
    // Validate input
    if (!priceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide priceId' 
      });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user already has a subscription
    if (user.stripeSubscriptionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already has a subscription' 
      });
    }
    
    // Create or get customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.username}`,
        metadata: {
          userId: userId.toString()
        }
      });
      
      stripeCustomerId = customer.id;
      await storage.updateStripeCustomerId(userId, stripeCustomerId);
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    
    // Update user with subscription ID
    await storage.updateUserStripeInfo(userId, {
      customerId: stripeCustomerId,
      subscriptionId: subscription.id
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'subscription',
      resourceId: subscription.id,
      description: `Subscription created for user ID: ${userId}`
    });
    
    // Return client secret for payment
    res.status(201).json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create subscription',
      error: error.message
    });
  }
};

// Update a subscription
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { priceId } = req.body;
    
    // Validate input
    if (!priceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide priceId' 
      });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    const user = await storage.getUserById(userId);
    if (!user || user.stripeSubscriptionId !== id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own subscription' 
      });
    }
    
    // Update subscription
    const subscription = await stripe.subscriptions.retrieve(id);
    await stripe.subscriptions.update(id, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'update',
      resourceType: 'subscription',
      resourceId: id,
      description: `Subscription updated for user ID: ${userId}`
    });
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update subscription',
      error: error.message
    });
  }
};

// Cancel a subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    const user = await storage.getUserById(userId);
    if (!user || user.stripeSubscriptionId !== id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only cancel your own subscription' 
      });
    }
    
    // Cancel subscription at period end
    await stripe.subscriptions.update(id, {
      cancel_at_period_end: true
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'cancel',
      resourceType: 'subscription',
      resourceId: id,
      description: `Subscription cancelled for user ID: ${userId}`
    });
    
    res.status(200).json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { priceId } = req.body;
    
    // Validate input
    if (!priceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide priceId' 
      });
    }
    
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get user
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/billing/cancel`,
      customer: user.stripeCustomerId || undefined,
      client_reference_id: userId.toString(),
    });
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
};

// Handle Stripe webhook
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!sig) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing Stripe signature' 
      });
    }
    
    // Verify event
    let event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      event = req.body;
    }
    
    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get user ID from session
        const userId = parseInt(session.client_reference_id);
        
        // Get user
        const user = await storage.getUserById(userId);
        if (user) {
          // Update user with subscription ID
          await storage.updateUserStripeInfo(userId, {
            customerId: session.customer,
            subscriptionId: session.subscription
          });
          
          // Audit log
          await createAuditLog(req, {
            action: 'create',
            resourceType: 'subscription',
            resourceId: session.subscription,
            description: `Subscription created via checkout for user ID: ${userId}`
          });
        }
        break;
      }
      case 'invoice.paid': {
        // Update subscription status in your database
        const invoice = event.data.object;
        console.log('Invoice paid:', invoice.id);
        break;
      }
      case 'invoice.payment_failed': {
        // Notify customer of payment failure
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find user with this subscription
        const users = Array.from((await storage.getPatients({})).patients);
        const user = users.find(u => u.stripeSubscriptionId === subscription.id);
        
        if (user) {
          // Remove subscription from user
          await storage.updateUser(user.id, {
            stripeSubscriptionId: null
          });
          
          // Audit log
          await createAuditLog(req, {
            action: 'delete',
            resourceType: 'subscription',
            resourceId: subscription.id,
            description: `Subscription deleted for user ID: ${user.id}`
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};