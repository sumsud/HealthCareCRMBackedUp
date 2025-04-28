import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BillingState, CreateInvoiceRequest, UpdateInvoiceRequest, RecordPaymentRequest, FilterInvoicesRequest, CreateSubscriptionRequest, UpdateSubscriptionRequest, CancelSubscriptionRequest, SubscriptionPlan } from '@shared/types';
import apiService from '@/lib/api';

const initialState: BillingState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
  totalInvoices: 0,
  page: 1,
  limit: 10,
  stats: {
    totalRevenue: 0,
    pendingAmount: 0,
    overdue: 0,
    paid: 0
  }
};

// Fetch invoices with pagination and filters
export const fetchInvoices = createAsyncThunk(
  'billing/fetchInvoices',
  async (filters: FilterInvoicesRequest = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaginated('/billing/invoices', filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch invoices');
    }
  }
);

// Fetch a single invoice by ID
export const fetchInvoiceById = createAsyncThunk(
  'billing/fetchInvoiceById',
  async (id: number, { rejectWithValue }) => {
    try {
      const invoice = await apiService.get(`/billing/invoices/${id}`);
      return invoice;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch invoice');
    }
  }
);

// Create a new invoice
export const createInvoice = createAsyncThunk(
  'billing/createInvoice',
  async (invoiceData: CreateInvoiceRequest, { rejectWithValue }) => {
    try {
      const newInvoice = await apiService.post('/billing/invoices', invoiceData);
      return newInvoice;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create invoice');
    }
  }
);

// Update an existing invoice
export const updateInvoice = createAsyncThunk(
  'billing/updateInvoice',
  async (invoiceData: UpdateInvoiceRequest, { rejectWithValue }) => {
    try {
      const updatedInvoice = await apiService.put(`/billing/invoices/${invoiceData.id}`, invoiceData);
      return updatedInvoice;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update invoice');
    }
  }
);

// Record a payment for an invoice
export const recordPayment = createAsyncThunk(
  'billing/recordPayment',
  async (paymentData: RecordPaymentRequest, { rejectWithValue }) => {
    try {
      const payment = await apiService.post('/billing/payments', paymentData);
      return payment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to record payment');
    }
  }
);

// Fetch billing statistics
export const fetchBillingStats = createAsyncThunk(
  'billing/fetchBillingStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await apiService.get('/billing/stats');
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch billing statistics');
    }
  }
);

// Fetch subscription plans
export const fetchSubscriptionPlans = createAsyncThunk(
  'billing/fetchSubscriptionPlans',
  async (_, { rejectWithValue }) => {
    try {
      const plans = await apiService.get('/billing/subscription-plans');
      return plans as SubscriptionPlan[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch subscription plans');
    }
  }
);

// Fetch current subscription
export const fetchCurrentSubscription = createAsyncThunk(
  'billing/fetchCurrentSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const subscription = await apiService.get('/billing/subscription');
      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch current subscription');
    }
  }
);

// Create a new subscription
export const createSubscription = createAsyncThunk(
  'billing/createSubscription',
  async (subscriptionData: CreateSubscriptionRequest, { rejectWithValue }) => {
    try {
      const newSubscription = await apiService.post('/billing/subscription', subscriptionData);
      return newSubscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create subscription');
    }
  }
);

// Update an existing subscription
export const updateSubscription = createAsyncThunk(
  'billing/updateSubscription',
  async (subscriptionData: UpdateSubscriptionRequest, { rejectWithValue }) => {
    try {
      const updatedSubscription = await apiService.put(`/billing/subscription/${subscriptionData.id}`, subscriptionData);
      return updatedSubscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update subscription');
    }
  }
);

// Cancel a subscription
export const cancelSubscription = createAsyncThunk(
  'billing/cancelSubscription',
  async (data: CancelSubscriptionRequest, { rejectWithValue }) => {
    try {
      const cancelledSubscription = await apiService.post(`/billing/subscription/${data.id}/cancel`, {});
      return cancelledSubscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel subscription');
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.items;
        state.totalInvoices = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Invoice By ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift(action.payload);
        state.totalInvoices += 1;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Invoice
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in invoices array
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        
        // Update current invoice if it's the one being edited
        if (state.currentInvoice && state.currentInvoice.id === action.payload.id) {
          state.currentInvoice = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Record Payment
      .addCase(recordPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordPayment.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update invoice in the list with the new payment
        const invoiceId = action.payload.invoiceId;
        const index = state.invoices.findIndex(i => i.id === invoiceId);
        
        if (index !== -1) {
          // Update the invoice's paid amount and status
          const updatedInvoice = {
            ...state.invoices[index],
            paidAmount: state.invoices[index].paidAmount + action.payload.amount,
            status: action.payload.amount >= state.invoices[index].totalAmount ? 'paid' : 'partially_paid'
          };
          
          state.invoices[index] = updatedInvoice;
          
          // Update current invoice if it's the one receiving payment
          if (state.currentInvoice && state.currentInvoice.id === invoiceId) {
            state.currentInvoice = {
              ...state.currentInvoice,
              paidAmount: state.currentInvoice.paidAmount + action.payload.amount,
              status: action.payload.amount >= state.currentInvoice.totalAmount ? 'paid' : 'partially_paid',
              payments: [...(state.currentInvoice.payments || []), action.payload]
            };
          }
        }
      })
      .addCase(recordPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Billing Stats
      .addCase(fetchBillingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearCurrentInvoice, clearError } = billingSlice.actions;
export default billingSlice.reducer;
