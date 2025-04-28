export interface Invoice {
  id: number;
  patientId: number;
  providerId: number;
  invoiceNumber: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'partially_paid' | 'cancelled' | 'refunded';
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
  paidAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Expanded properties
  patient?: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  cptCode?: string;
  icdCode?: string;
  createdAt: Date;
}

export interface Payment {
  id: number;
  invoiceId: number;
  patientId: number;
  amount: number;
  paymentMethod: 'credit_card' | 'cash' | 'check' | 'insurance';
  transactionId?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface BillingState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  totalInvoices: number;
  page: number;
  limit: number;
  stats: BillingStats;
}

export interface BillingStats {
  totalRevenue: number;
  pendingAmount: number;
  overdue: number;
  paid: number;
}

export interface CreateInvoiceRequest {
  patientId: number;
  providerId: number;
  dueDate: Date;
  notes?: string;
  items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  cptCode?: string;
  icdCode?: string;
}

export interface UpdateInvoiceRequest {
  id: number;
  dueDate?: Date;
  notes?: string;
  status?: 'pending' | 'paid' | 'partially_paid' | 'cancelled' | 'refunded';
}

export interface AddInvoiceItemRequest {
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  cptCode?: string;
  icdCode?: string;
}

export interface UpdateInvoiceItemRequest {
  id: number;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  cptCode?: string;
  icdCode?: string;
}

export interface DeleteInvoiceItemRequest {
  id: number;
}

export interface RecordPaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: 'credit_card' | 'cash' | 'check' | 'insurance';
  transactionId?: string;
  paymentDate?: Date;
  notes?: string;
}

export interface FilterInvoicesRequest {
  patientId?: number;
  providerId?: number;
  status?: 'pending' | 'paid' | 'partially_paid' | 'cancelled' | 'refunded';
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Subscription {
  id: number;
  userId: number;
  planName: string;
  planDescription?: string;
  amount: number;
  interval: 'month' | 'year';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  cancelledAt?: Date;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  maxProviders: number;
  features?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  planName: string;
  interval: 'month' | 'year';
}

export interface UpdateSubscriptionRequest {
  id: number;
  planName?: string;
  interval?: 'month' | 'year';
}

export interface CancelSubscriptionRequest {
  id: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxProviders: number;
  isPopular?: boolean;
}
