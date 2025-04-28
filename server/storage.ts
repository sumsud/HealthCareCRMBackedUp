import { createClient } from '@supabase/supabase-js';
import {
  User, InsertUser, UserProfile, InsertUserProfile,
  Patient, InsertPatient, Appointment, InsertAppointment,
  Message, InsertMessage, ClinicalNote, InsertClinicalNote,
  Invoice, InsertInvoice, InvoiceItem, Payment,
  AIChatSession, InsertAIChatSession, AIChatMessage, InsertAIChatMessage
} from '@shared/types';

import { auditLogs, users, userProfiles, patients, appointments, messages, 
  clinicalNotes, invoices, invoiceItems, payments, subscriptions, 
  aiChatSessions, aiChatMessages } from '@shared/schema';

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // Auth and User Management
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profileData: Partial<UserProfile>): Promise<UserProfile | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined>;

  // Patient Management
  getPatients(options?: any): Promise<{ patients: Patient[], total: number }>;
  getPatientById(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined>;
  archivePatient(id: number): Promise<Patient | undefined>;
  
  // Clinical Notes
  getClinicalNotes(patientId: number): Promise<ClinicalNote[]>;
  getClinicalNoteById(id: number): Promise<ClinicalNote | undefined>;
  createClinicalNote(note: InsertClinicalNote): Promise<ClinicalNote>;
  updateClinicalNote(id: number, noteData: Partial<ClinicalNote>): Promise<ClinicalNote | undefined>;
  signClinicalNote(id: number, signedBy: number): Promise<ClinicalNote | undefined>;

  // Appointment Management
  getAppointments(options?: any): Promise<{ appointments: Appointment[], total: number }>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined>;
  cancelAppointment(id: number, cancelData: { cancelledBy: number, cancelReason?: string }): Promise<Appointment | undefined>;
  checkInAppointment(id: number): Promise<Appointment | undefined>;
  completeAppointment(id: number, notes?: string): Promise<Appointment | undefined>;
  rescheduleAppointment(id: number, rescheduleData: { startTime: Date, endTime: Date, reason?: string }): Promise<Appointment | undefined>;

  // Messaging
  getMessages(options?: any): Promise<{ messages: Message[], total: number }>;
  getUnreadCount(userId: number): Promise<number>;
  getThread(threadId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  archiveMessage(id: number): Promise<Message | undefined>;

  // Billing and Invoices
  getInvoices(options?: any): Promise<{ invoices: Invoice[], total: number }>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice, items: Partial<InvoiceItem>[]): Promise<Invoice>;
  updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined>;
  addInvoiceItem(invoiceId: number, item: Partial<InvoiceItem>): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, itemData: Partial<InvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;
  recordPayment(payment: Partial<Payment>): Promise<Payment>;
  getBillingStats(userId: number): Promise<any>;

  // AI Chat
  getChatSessions(userId: number): Promise<AIChatSession[]>;
  getChatSessionById(id: number): Promise<AIChatSession | undefined>;
  createChatSession(session: InsertAIChatSession): Promise<AIChatSession>;
  updateChatSession(id: number, sessionData: Partial<AIChatSession>): Promise<AIChatSession | undefined>;
  deleteChatSession(id: number): Promise<boolean>;
  getChatMessages(sessionId: number): Promise<AIChatMessage[]>;
  createChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage>;

  // Audit Logging
  createAuditLog(logData: any): Promise<any>;
  getAuditLogs(options?: any): Promise<any[]>;
}

export class SupabaseStorage implements IStorage {
  private supabase: any;
  
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables. Database operations will fail.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // Auth and User Management
  async getUserById(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error || !data) return undefined;
    return data as UserProfile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user profile: ${error.message}`);
    return data as UserProfile;
  }

  async updateUserProfile(userId: number, profileData: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(profileData)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as UserProfile;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeCustomerId });
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    return this.updateUser(userId, {
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    });
  }

  // Patient Management
  async getPatients(options: any = {}): Promise<{ patients: Patient[], total: number }> {
    let query = this.supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters
    if (options.search) {
      query = query.or(`firstName.ilike.%${options.search}%,lastName.ilike.%${options.search}%,patientId.ilike.%${options.search}%`);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    // Apply sorting
    if (options.sortBy) {
      const direction = options.sortDir || 'asc';
      query = query.order(options.sortBy, { ascending: direction === 'asc' });
    } else {
      query = query.order('lastName', { ascending: true });
    }
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    
    query = query.range(startIndex, startIndex + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(`Failed to fetch patients: ${error.message}`);
    
    return {
      patients: (data || []) as Patient[],
      total: count || 0
    };
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    const { data, error } = await this.supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const { data, error } = await this.supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create patient: ${error.message}`);
    return data as Patient;
  }

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined> {
    const { data, error } = await this.supabase
      .from('patients')
      .update({
        ...patientData,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Patient;
  }

  async archivePatient(id: number): Promise<Patient | undefined> {
    return this.updatePatient(id, { status: 'archived' });
  }

  // Clinical Notes
  async getClinicalNotes(patientId: number): Promise<ClinicalNote[]> {
    const { data, error } = await this.supabase
      .from('clinical_notes')
      .select('*')
      .eq('patientId', patientId)
      .eq('isDeleted', false)
      .order('createdAt', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch clinical notes: ${error.message}`);
    return (data || []) as ClinicalNote[];
  }

  async getClinicalNoteById(id: number): Promise<ClinicalNote | undefined> {
    const { data, error } = await this.supabase
      .from('clinical_notes')
      .select('*')
      .eq('id', id)
      .eq('isDeleted', false)
      .single();
    
    if (error || !data) return undefined;
    return data as ClinicalNote;
  }

  async createClinicalNote(note: InsertClinicalNote): Promise<ClinicalNote> {
    const { data, error } = await this.supabase
      .from('clinical_notes')
      .insert([note])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create clinical note: ${error.message}`);
    return data as ClinicalNote;
  }

  async updateClinicalNote(id: number, noteData: Partial<ClinicalNote>): Promise<ClinicalNote | undefined> {
    // Check if note is locked
    const existingNote = await this.getClinicalNoteById(id);
    if (!existingNote) return undefined;
    
    if (existingNote.isLocked) {
      throw new Error('Cannot modify a locked clinical note');
    }
    
    const { data, error } = await this.supabase
      .from('clinical_notes')
      .update({
        ...noteData,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as ClinicalNote;
  }

  async signClinicalNote(id: number, signedBy: number): Promise<ClinicalNote | undefined> {
    const { data, error } = await this.supabase
      .from('clinical_notes')
      .update({
        isSigned: true,
        isLocked: true,
        signedAt: new Date(),
        signedBy,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as ClinicalNote;
  }

  // Appointment Management
  async getAppointments(options: any = {}): Promise<{ appointments: Appointment[], total: number }> {
    let query = this.supabase.from('appointments').select('*, patients(*), users(*)', { count: 'exact' });
    
    // Apply filters
    if (options.providerId) {
      query = query.eq('providerId', options.providerId);
    }
    
    if (options.patientId) {
      query = query.eq('patientId', options.patientId);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.appointmentType) {
      query = query.eq('appointmentType', options.appointmentType);
    }
    
    if (options.startDate) {
      query = query.gte('startTime', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('startTime', options.endDate);
    }
    
    if (options.isFollowUp !== undefined) {
      query = query.eq('isFollowUp', options.isFollowUp);
    }
    
    // Apply sorting
    query = query.order('startTime', { ascending: true });
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    
    query = query.range(startIndex, startIndex + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(`Failed to fetch appointments: ${error.message}`);
    
    // Format the data to match the appointment type with expanded properties
    const formattedAppointments = data.map((appointment: any) => {
      return {
        ...appointment,
        patient: appointment.patients ? {
          id: appointment.patients.id,
          patientId: appointment.patients.patientId,
          firstName: appointment.patients.firstName,
          lastName: appointment.patients.lastName
        } : undefined,
        provider: appointment.users ? {
          id: appointment.users.id,
          firstName: appointment.users.profile?.firstName,
          lastName: appointment.users.profile?.lastName
        } : undefined
      };
    });
    
    return {
      appointments: formattedAppointments as Appointment[],
      total: count || 0
    };
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*, patients(*), users(*)')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    // Format the appointment
    const appointment = {
      ...data,
      patient: data.patients ? {
        id: data.patients.id,
        patientId: data.patients.patientId,
        firstName: data.patients.firstName,
        lastName: data.patients.lastName
      } : undefined,
      provider: data.users ? {
        id: data.users.id,
        firstName: data.users.profile?.firstName,
        lastName: data.users.profile?.lastName
      } : undefined
    };
    
    return appointment as Appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create appointment: ${error.message}`);
    return data as Appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const { data, error } = await this.supabase
      .from('appointments')
      .update({
        ...appointmentData,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Appointment;
  }

  async cancelAppointment(id: number, cancelData: { cancelledBy: number, cancelReason?: string }): Promise<Appointment | undefined> {
    return this.updateAppointment(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: cancelData.cancelledBy,
      cancelReason: cancelData.cancelReason
    });
  }

  async checkInAppointment(id: number): Promise<Appointment | undefined> {
    return this.updateAppointment(id, { status: 'check-in' });
  }

  async completeAppointment(id: number, notes?: string): Promise<Appointment | undefined> {
    return this.updateAppointment(id, {
      status: 'completed',
      notes: notes ? notes : undefined
    });
  }

  async rescheduleAppointment(
    id: number,
    rescheduleData: { startTime: Date, endTime: Date, reason?: string }
  ): Promise<Appointment | undefined> {
    return this.updateAppointment(id, {
      startTime: rescheduleData.startTime,
      endTime: rescheduleData.endTime,
      notes: rescheduleData.reason ? `Rescheduled: ${rescheduleData.reason}` : undefined
    });
  }

  // Messaging
  async getMessages(options: any = {}): Promise<{ messages: Message[], total: number }> {
    let query = this.supabase.from('messages').select('*, sender:users(*), recipient:users(*), patients(*)', { count: 'exact' });
    
    // Apply filters
    if (options.senderId) {
      query = query.eq('senderId', options.senderId);
    }
    
    if (options.recipientId) {
      query = query.eq('recipientId', options.recipientId);
    }
    
    if (options.patientId) {
      query = query.eq('patientId', options.patientId);
    }
    
    if (options.isRead !== undefined) {
      query = query.eq('isRead', options.isRead);
    }
    
    if (options.isArchived !== undefined) {
      query = query.eq('isArchived', options.isArchived);
    }
    
    if (options.priority) {
      query = query.eq('priority', options.priority);
    }
    
    if (options.threadId) {
      query = query.eq('threadId', options.threadId);
    }
    
    // Apply date range
    if (options.startDate) {
      query = query.gte('createdAt', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('createdAt', options.endDate);
    }
    
    // Apply search
    if (options.search) {
      query = query.or(`content.ilike.%${options.search}%,subject.ilike.%${options.search}%`);
    }
    
    // Apply sorting
    query = query.order('createdAt', { ascending: false });
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    
    query = query.range(startIndex, startIndex + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(`Failed to fetch messages: ${error.message}`);
    
    // Format the data
    const formattedMessages = data.map((message: any) => {
      return {
        ...message,
        sender: message.sender ? {
          id: message.sender.id,
          firstName: message.sender.profile?.firstName,
          lastName: message.sender.profile?.lastName,
          avatarUrl: message.sender.profile?.avatarUrl
        } : undefined,
        recipient: message.recipient ? {
          id: message.recipient.id,
          firstName: message.recipient.profile?.firstName,
          lastName: message.recipient.profile?.lastName,
          avatarUrl: message.recipient.profile?.avatarUrl
        } : undefined,
        patient: message.patients ? {
          id: message.patients.id,
          patientId: message.patients.patientId,
          firstName: message.patients.firstName,
          lastName: message.patients.lastName
        } : undefined
      };
    });
    
    return {
      messages: formattedMessages as Message[],
      total: count || 0
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    const { count, error } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('recipientId', userId)
      .eq('isRead', false)
      .eq('isArchived', false);
    
    if (error) throw new Error(`Failed to fetch unread count: ${error.message}`);
    
    return count || 0;
  }

  async getThread(threadId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*, sender:users(*), recipient:users(*), patients(*)')
      .eq('threadId', threadId)
      .order('createdAt', { ascending: true });
    
    if (error) throw new Error(`Failed to fetch thread: ${error.message}`);
    
    // Format the messages
    const formattedMessages = data.map((message: any) => {
      return {
        ...message,
        sender: message.sender ? {
          id: message.sender.id,
          firstName: message.sender.profile?.firstName,
          lastName: message.sender.profile?.lastName,
          avatarUrl: message.sender.profile?.avatarUrl
        } : undefined,
        recipient: message.recipient ? {
          id: message.recipient.id,
          firstName: message.recipient.profile?.firstName,
          lastName: message.recipient.profile?.lastName,
          avatarUrl: message.recipient.profile?.avatarUrl
        } : undefined,
        patient: message.patients ? {
          id: message.patients.id,
          patientId: message.patients.patientId,
          firstName: message.patients.firstName,
          lastName: message.patients.lastName
        } : undefined
      };
    });
    
    return formattedMessages as Message[];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    // Generate a thread ID if one is not provided
    if (!message.threadId) {
      message.threadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    
    const { data, error } = await this.supabase
      .from('messages')
      .insert([message])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create message: ${error.message}`);
    return data as Message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({
        isRead: true,
        readAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Message;
  }

  async archiveMessage(id: number): Promise<Message | undefined> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({
        isArchived: true
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Message;
  }

  // Billing and Invoices
  async getInvoices(options: any = {}): Promise<{ invoices: Invoice[], total: number }> {
    let query = this.supabase.from('invoices').select('*, patients(*), users(*), items:invoice_items(*), payments(*)', { count: 'exact' });
    
    // Apply filters
    if (options.patientId) {
      query = query.eq('patientId', options.patientId);
    }
    
    if (options.providerId) {
      query = query.eq('providerId', options.providerId);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    // Apply date range
    if (options.startDate) {
      query = query.gte('issuedDate', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('issuedDate', options.endDate);
    }
    
    // Apply search
    if (options.search) {
      query = query.or(`invoiceNumber.ilike.%${options.search}%`);
    }
    
    // Apply sorting
    query = query.order('issuedDate', { ascending: false });
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    
    query = query.range(startIndex, startIndex + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
    
    // Format the data
    const formattedInvoices = data.map((invoice: any) => {
      return {
        ...invoice,
        patient: invoice.patients ? {
          id: invoice.patients.id,
          patientId: invoice.patients.patientId,
          firstName: invoice.patients.firstName,
          lastName: invoice.patients.lastName
        } : undefined,
        provider: invoice.users ? {
          id: invoice.users.id,
          firstName: invoice.users.profile?.firstName,
          lastName: invoice.users.profile?.lastName
        } : undefined,
        items: invoice.items || [],
        payments: invoice.payments || []
      };
    });
    
    return {
      invoices: formattedInvoices as Invoice[],
      total: count || 0
    };
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*, patients(*), users(*), items:invoice_items(*), payments(*)')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    // Format the invoice
    const invoice = {
      ...data,
      patient: data.patients ? {
        id: data.patients.id,
        patientId: data.patients.patientId,
        firstName: data.patients.firstName,
        lastName: data.patients.lastName
      } : undefined,
      provider: data.users ? {
        id: data.users.id,
        firstName: data.users.profile?.firstName,
        lastName: data.users.profile?.lastName
      } : undefined,
      items: data.items || [],
      payments: data.payments || []
    };
    
    return invoice as Invoice;
  }

  async createInvoice(invoice: InsertInvoice, items: Partial<InvoiceItem>[]): Promise<Invoice> {
    // Start a transaction
    const { data: newInvoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();
    
    if (invoiceError) throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    
    // Create invoice items
    if (items.length > 0) {
      const formattedItems = items.map(item => ({
        ...item,
        invoiceId: newInvoice.id
      }));
      
      const { error: itemsError } = await this.supabase
        .from('invoice_items')
        .insert(formattedItems);
      
      if (itemsError) throw new Error(`Failed to create invoice items: ${itemsError.message}`);
    }
    
    // Fetch the complete invoice with items
    return this.getInvoiceById(newInvoice.id) as Promise<Invoice>;
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const { data, error } = await this.supabase
      .from('invoices')
      .update({
        ...invoiceData,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    
    // Fetch the complete invoice with items
    return this.getInvoiceById(id);
  }

  async addInvoiceItem(invoiceId: number, item: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const { data, error } = await this.supabase
      .from('invoice_items')
      .insert([{
        ...item,
        invoiceId
      }])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to add invoice item: ${error.message}`);
    
    // Update invoice total
    const invoice = await this.getInvoiceById(invoiceId);
    if (invoice) {
      const newAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const newTax = invoice.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      await this.updateInvoice(invoiceId, {
        amount: newAmount,
        tax: newTax,
        totalAmount: newAmount + newTax
      });
    }
    
    return data as InvoiceItem;
  }

  async updateInvoiceItem(id: number, itemData: Partial<InvoiceItem>): Promise<InvoiceItem | undefined> {
    const { data, error } = await this.supabase
      .from('invoice_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    
    // Update invoice total
    const invoiceId = data.invoiceId;
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (invoice) {
      const newAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const newTax = invoice.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      await this.updateInvoice(invoiceId, {
        amount: newAmount,
        tax: newTax,
        totalAmount: newAmount + newTax
      });
    }
    
    return data as InvoiceItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    // First get the item to know its invoiceId
    const { data: item, error: fetchError } = await this.supabase
      .from('invoice_items')
      .select('invoiceId')
      .eq('id', id)
      .single();
    
    if (fetchError || !item) return false;
    
    const { error } = await this.supabase
      .from('invoice_items')
      .delete()
      .eq('id', id);
    
    if (error) return false;
    
    // Update invoice total
    const invoiceId = item.invoiceId;
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (invoice) {
      const newAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const newTax = invoice.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      await this.updateInvoice(invoiceId, {
        amount: newAmount,
        tax: newTax,
        totalAmount: newAmount + newTax
      });
    }
    
    return true;
  }

  async recordPayment(payment: Partial<Payment>): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to record payment: ${error.message}`);
    
    // Update invoice status
    const invoiceId = payment.invoiceId!;
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + payment.amount!;
      const newStatus = totalPaid >= invoice.totalAmount ? 'paid' : 'partially_paid';
      
      await this.updateInvoice(invoiceId, {
        status: newStatus,
        paidAmount: totalPaid,
        paidDate: newStatus === 'paid' ? new Date() : invoice.paidDate
      });
    }
    
    return data as Payment;
  }

  async getBillingStats(userId: number): Promise<any> {
    // Get provider's invoices
    const { data: invoices, error } = await this.supabase
      .from('invoices')
      .select('*, payments(*)')
      .eq('providerId', userId);
    
    if (error) throw new Error(`Failed to fetch billing stats: ${error.message}`);
    
    // Calculate stats
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const pendingAmount = invoices
      .filter(invoice => invoice.status === 'pending' || invoice.status === 'partially_paid')
      .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);
    
    // Calculate overdue invoices (due date is past)
    const now = new Date();
    const overdue = invoices
      .filter(invoice => 
        (invoice.status === 'pending' || invoice.status === 'partially_paid') && 
        new Date(invoice.dueDate) < now
      )
      .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);
    
    // Calculate paid amount
    const paid = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    return {
      totalRevenue,
      pendingAmount,
      overdue,
      paid
    };
  }

  // AI Chat
  async getChatSessions(userId: number): Promise<AIChatSession[]> {
    const { data, error } = await this.supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('userId', userId)
      .order('updatedAt', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch chat sessions: ${error.message}`);
    return (data || []) as AIChatSession[];
  }

  async getChatSessionById(id: number): Promise<AIChatSession | undefined> {
    const { data, error } = await this.supabase
      .from('ai_chat_sessions')
      .select('*, messages:ai_chat_messages(*)')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    // Sort messages by creation time
    const sortedMessages = data.messages?.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return {
      ...data,
      messages: sortedMessages
    } as AIChatSession;
  }

  async createChatSession(session: InsertAIChatSession): Promise<AIChatSession> {
    const { data, error } = await this.supabase
      .from('ai_chat_sessions')
      .insert([session])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create chat session: ${error.message}`);
    return data as AIChatSession;
  }

  async updateChatSession(id: number, sessionData: Partial<AIChatSession>): Promise<AIChatSession | undefined> {
    const { data, error } = await this.supabase
      .from('ai_chat_sessions')
      .update({
        ...sessionData,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as AIChatSession;
  }

  async deleteChatSession(id: number): Promise<boolean> {
    // Delete associated messages first
    const { error: messagesError } = await this.supabase
      .from('ai_chat_messages')
      .delete()
      .eq('sessionId', id);
    
    if (messagesError) return false;
    
    // Then delete the session
    const { error } = await this.supabase
      .from('ai_chat_sessions')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getChatMessages(sessionId: number): Promise<AIChatMessage[]> {
    const { data, error } = await this.supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('sessionId', sessionId)
      .order('createdAt', { ascending: true });
    
    if (error) throw new Error(`Failed to fetch chat messages: ${error.message}`);
    return (data || []) as AIChatMessage[];
  }

  async createChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage> {
    const { data, error } = await this.supabase
      .from('ai_chat_messages')
      .insert([message])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create chat message: ${error.message}`);
    
    // Update the session's updatedAt timestamp
    await this.updateChatSession(message.sessionId, { updatedAt: new Date() });
    
    return data as AIChatMessage;
  }

  // Audit Logging
  async createAuditLog(logData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .insert([{
        ...logData,
        timestamp: new Date()
      }])
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create audit log: ${error.message}`);
    return data;
  }

  async getAuditLogs(options: any = {}): Promise<any[]> {
    let query = this.supabase.from('audit_logs').select('*');
    
    // Apply filters
    if (options.userId) {
      query = query.eq('userId', options.userId);
    }
    
    if (options.action) {
      query = query.eq('action', options.action);
    }
    
    if (options.resourceType) {
      query = query.eq('resourceType', options.resourceType);
    }
    
    if (options.resourceId) {
      query = query.eq('resourceId', options.resourceId);
    }
    
    if (options.startDate) {
      query = query.gte('timestamp', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('timestamp', options.endDate);
    }
    
    // Apply sorting
    query = query.order('timestamp', { ascending: false });
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);
    return data || [];
  }
}

// Fallback in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProfiles: Map<number, UserProfile>;
  private patients: Map<number, Patient>;
  private appointments: Map<number, Appointment>;
  private messages: Map<number, Message>;
  private clinicalNotes: Map<number, ClinicalNote>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private payments: Map<number, Payment>;
  private chatSessions: Map<number, AIChatSession>;
  private chatMessages: Map<number, AIChatMessage>;
  private auditLogs: any[];
  
  private userIdCounter: number = 1;
  private userProfileIdCounter: number = 1;
  private patientIdCounter: number = 1;
  private appointmentIdCounter: number = 1;
  private messageIdCounter: number = 1;
  private clinicalNoteIdCounter: number = 1;
  private invoiceIdCounter: number = 1;
  private invoiceItemIdCounter: number = 1;
  private paymentIdCounter: number = 1;
  private chatSessionIdCounter: number = 1;
  private chatMessageIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.messages = new Map();
    this.clinicalNotes = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.payments = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.auditLogs = [];
    
    // Initialize with a demo admin user
    this.createUser({
      email: 'admin@example.com',
      username: 'admin',
      password: 'password',
      role: 'admin'
    });
    
    this.createUserProfile({
      userId: 1,
      firstName: 'Admin',
      lastName: 'User',
      title: 'Administrator',
      specialty: '',
      clinicName: 'Demo Clinic'
    });
  }

  // Auth and User Management
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isVerified: false,
      isTwoFactorEnabled: false
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(profile => profile.userId === userId);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = this.userProfileIdCounter++;
    const newProfile: UserProfile = {
      ...profile,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateUserProfile(userId: number, profileData: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const profile = Array.from(this.userProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = {
      ...profile,
      ...profileData,
      updatedAt: new Date()
    };
    this.userProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeCustomerId });
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    return this.updateUser(userId, {
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    });
  }

  // Patient Management
  async getPatients(options: any = {}): Promise<{ patients: Patient[], total: number }> {
    let patients = Array.from(this.patients.values());
    
    // Apply filters
    if (options.search) {
      const search = options.search.toLowerCase();
      patients = patients.filter(patient => 
        patient.firstName.toLowerCase().includes(search) ||
        patient.lastName.toLowerCase().includes(search) ||
        patient.patientId.toLowerCase().includes(search)
      );
    }
    
    if (options.status) {
      patients = patients.filter(patient => patient.status === options.status);
    }
    
    // Apply sorting
    if (options.sortBy) {
      const direction = options.sortDir === 'desc' ? -1 : 1;
      patients.sort((a, b) => {
        const aValue = a[options.sortBy];
        const bValue = b[options.sortBy];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction * aValue.localeCompare(bValue);
        }
        
        return direction * ((aValue > bValue) ? 1 : -1);
      });
    } else {
      // Default sort by last name
      patients.sort((a, b) => a.lastName.localeCompare(b.lastName));
    }
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const total = patients.length;
    
    patients = patients.slice(startIndex, startIndex + limit);
    
    return {
      patients,
      total
    };
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.patientIdCounter++;
    const newPatient: Patient = {
      ...patient,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = {
      ...patient,
      ...patientData,
      updatedAt: new Date()
    };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async archivePatient(id: number): Promise<Patient | undefined> {
    return this.updatePatient(id, { status: 'archived' });
  }

  // Clinical Notes
  async getClinicalNotes(patientId: number): Promise<ClinicalNote[]> {
    return Array.from(this.clinicalNotes.values())
      .filter(note => note.patientId === patientId && !note.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getClinicalNoteById(id: number): Promise<ClinicalNote | undefined> {
    const note = this.clinicalNotes.get(id);
    return note && !note.isDeleted ? note : undefined;
  }

  async createClinicalNote(note: InsertClinicalNote): Promise<ClinicalNote> {
    const id = this.clinicalNoteIdCounter++;
    const newNote: ClinicalNote = {
      ...note,
      id,
      isSigned: false,
      isLocked: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clinicalNotes.set(id, newNote);
    return newNote;
  }

  async updateClinicalNote(id: number, noteData: Partial<ClinicalNote>): Promise<ClinicalNote | undefined> {
    const note = this.clinicalNotes.get(id);
    if (!note || note.isLocked) return undefined;
    
    const updatedNote = {
      ...note,
      ...noteData,
      updatedAt: new Date()
    };
    this.clinicalNotes.set(id, updatedNote);
    return updatedNote;
  }

  async signClinicalNote(id: number, signedBy: number): Promise<ClinicalNote | undefined> {
    const note = this.clinicalNotes.get(id);
    if (!note) return undefined;
    
    const signedNote = {
      ...note,
      isSigned: true,
      isLocked: true,
      signedAt: new Date(),
      signedBy,
      updatedAt: new Date()
    };
    this.clinicalNotes.set(id, signedNote);
    return signedNote;
  }

  // Appointment Management
  async getAppointments(options: any = {}): Promise<{ appointments: Appointment[], total: number }> {
    let appointments = Array.from(this.appointments.values());
    
    // Apply filters
    if (options.providerId) {
      appointments = appointments.filter(appt => appt.providerId === options.providerId);
    }
    
    if (options.patientId) {
      appointments = appointments.filter(appt => appt.patientId === options.patientId);
    }
    
    if (options.status) {
      appointments = appointments.filter(appt => appt.status === options.status);
    }
    
    if (options.appointmentType) {
      appointments = appointments.filter(appt => appt.appointmentType === options.appointmentType);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      appointments = appointments.filter(appt => new Date(appt.startTime) >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      appointments = appointments.filter(appt => new Date(appt.startTime) <= endDate);
    }
    
    if (options.isFollowUp !== undefined) {
      appointments = appointments.filter(appt => appt.isFollowUp === options.isFollowUp);
    }
    
    // Sort by start time
    appointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const total = appointments.length;
    
    appointments = appointments.slice(startIndex, startIndex + limit);
    
    // Expand patient and provider information
    appointments = appointments.map(appointment => {
      const patient = this.patients.get(appointment.patientId);
      const provider = this.users.get(appointment.providerId);
      const providerProfile = provider ? Array.from(this.userProfiles.values()).find(p => p.userId === provider.id) : undefined;
      
      return {
        ...appointment,
        patient: patient ? {
          id: patient.id,
          patientId: patient.patientId,
          firstName: patient.firstName,
          lastName: patient.lastName
        } : undefined,
        provider: provider && providerProfile ? {
          id: provider.id,
          firstName: providerProfile.firstName,
          lastName: providerProfile.lastName
        } : undefined
      };
    });
    
    return {
      appointments,
      total
    };
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const patient = this.patients.get(appointment.patientId);
    const provider = this.users.get(appointment.providerId);
    const providerProfile = provider ? Array.from(this.userProfiles.values()).find(p => p.userId === provider.id) : undefined;
    
    return {
      ...appointment,
      patient: patient ? {
        id: patient.id,
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName
      } : undefined,
      provider: provider && providerProfile ? {
        id: provider.id,
        firstName: providerProfile.firstName,
        lastName: providerProfile.lastName
      } : undefined
    };
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const newAppointment: Appointment = {
      ...appointment,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = {
      ...appointment,
      ...appointmentData,
      updatedAt: new Date()
    };
    this.appointments.set(id, updatedAppointment);
    return this.getAppointmentById(id);
  }

  async cancelAppointment(id: number, cancelData: { cancelledBy: number, cancelReason?: string }): Promise<Appointment | undefined> {
    return this.updateAppointment(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: cancelData.cancelledBy,
      cancelReason: cancelData.cancelReason
    });
  }

  async checkInAppointment(id: number): Promise<Appointment | undefined> {
    return this.updateAppointment(id, { status: 'check-in' });
  }

  async completeAppointment(id: number, notes?: string): Promise<Appointment | undefined> {
    return this.updateAppointment(id, {
      status: 'completed',
      notes: notes ? notes : undefined
    });
  }

  async rescheduleAppointment(
    id: number,
    rescheduleData: { startTime: Date, endTime: Date, reason?: string }
  ): Promise<Appointment | undefined> {
    return this.updateAppointment(id, {
      startTime: rescheduleData.startTime,
      endTime: rescheduleData.endTime,
      notes: rescheduleData.reason ? `Rescheduled: ${rescheduleData.reason}` : undefined
    });
  }

  // Messaging
  async getMessages(options: any = {}): Promise<{ messages: Message[], total: number }> {
    let messages = Array.from(this.messages.values());
    
    // Apply filters
    if (options.senderId) {
      messages = messages.filter(msg => msg.senderId === options.senderId);
    }
    
    if (options.recipientId) {
      messages = messages.filter(msg => msg.recipientId === options.recipientId);
    }
    
    if (options.patientId) {
      messages = messages.filter(msg => msg.patientId === options.patientId);
    }
    
    if (options.isRead !== undefined) {
      messages = messages.filter(msg => msg.isRead === options.isRead);
    }
    
    if (options.isArchived !== undefined) {
      messages = messages.filter(msg => msg.isArchived === options.isArchived);
    }
    
    if (options.priority) {
      messages = messages.filter(msg => msg.priority === options.priority);
    }
    
    if (options.threadId) {
      messages = messages.filter(msg => msg.threadId === options.threadId);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      messages = messages.filter(msg => new Date(msg.createdAt) >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      messages = messages.filter(msg => new Date(msg.createdAt) <= endDate);
    }
    
    if (options.search) {
      const search = options.search.toLowerCase();
      messages = messages.filter(msg => 
        (msg.content && msg.content.toLowerCase().includes(search)) ||
        (msg.subject && msg.subject.toLowerCase().includes(search))
      );
    }
    
    // Sort by creation time (newest first)
    messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const total = messages.length;
    
    messages = messages.slice(startIndex, startIndex + limit);
    
    // Expand sender, recipient, and patient information
    messages = messages.map(message => {
      const sender = this.users.get(message.senderId);
      const senderProfile = sender ? Array.from(this.userProfiles.values()).find(p => p.userId === sender.id) : undefined;
      
      const recipient = this.users.get(message.recipientId);
      const recipientProfile = recipient ? Array.from(this.userProfiles.values()).find(p => p.userId === recipient.id) : undefined;
      
      const patient = message.patientId ? this.patients.get(message.patientId) : undefined;
      
      return {
        ...message,
        sender: sender && senderProfile ? {
          id: sender.id,
          firstName: senderProfile.firstName,
          lastName: senderProfile.lastName,
          avatarUrl: senderProfile.avatarUrl
        } : undefined,
        recipient: recipient && recipientProfile ? {
          id: recipient.id,
          firstName: recipientProfile.firstName,
          lastName: recipientProfile.lastName,
          avatarUrl: recipientProfile.avatarUrl
        } : undefined,
        patient: patient ? {
          id: patient.id,
          patientId: patient.patientId,
          firstName: patient.firstName,
          lastName: patient.lastName
        } : undefined
      };
    });
    
    return {
      messages,
      total
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      msg => msg.recipientId === userId && !msg.isRead && !msg.isArchived
    ).length;
  }

  async getThread(threadId: string): Promise<Message[]> {
    let messages = Array.from(this.messages.values())
      .filter(msg => msg.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // Expand sender, recipient, and patient information
    messages = messages.map(message => {
      const sender = this.users.get(message.senderId);
      const senderProfile = sender ? Array.from(this.userProfiles.values()).find(p => p.userId === sender.id) : undefined;
      
      const recipient = this.users.get(message.recipientId);
      const recipientProfile = recipient ? Array.from(this.userProfiles.values()).find(p => p.userId === recipient.id) : undefined;
      
      const patient = message.patientId ? this.patients.get(message.patientId) : undefined;
      
      return {
        ...message,
        sender: sender && senderProfile ? {
          id: sender.id,
          firstName: senderProfile.firstName,
          lastName: senderProfile.lastName,
          avatarUrl: senderProfile.avatarUrl
        } : undefined,
        recipient: recipient && recipientProfile ? {
          id: recipient.id,
          firstName: recipientProfile.firstName,
          lastName: recipientProfile.lastName,
          avatarUrl: recipientProfile.avatarUrl
        } : undefined,
        patient: patient ? {
          id: patient.id,
          patientId: patient.patientId,
          firstName: patient.firstName,
          lastName: patient.lastName
        } : undefined
      };
    });
    
    return messages;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    
    // Generate a thread ID if one is not provided
    const threadId = message.threadId || `thread_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const newMessage: Message = {
      ...message,
      id,
      threadId,
      isRead: false,
      isEncrypted: true,
      isArchived: false,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = {
      ...message,
      isRead: true,
      readAt: new Date()
    };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async archiveMessage(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = {
      ...message,
      isArchived: true
    };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Billing and Invoices
  async getInvoices(options: any = {}): Promise<{ invoices: Invoice[], total: number }> {
    let invoices = Array.from(this.invoices.values());
    
    // Apply filters
    if (options.patientId) {
      invoices = invoices.filter(invoice => invoice.patientId === options.patientId);
    }
    
    if (options.providerId) {
      invoices = invoices.filter(invoice => invoice.providerId === options.providerId);
    }
    
    if (options.status) {
      invoices = invoices.filter(invoice => invoice.status === options.status);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      invoices = invoices.filter(invoice => new Date(invoice.issuedDate) >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      invoices = invoices.filter(invoice => new Date(invoice.issuedDate) <= endDate);
    }
    
    if (options.search) {
      const search = options.search.toLowerCase();
      invoices = invoices.filter(invoice => invoice.invoiceNumber.toLowerCase().includes(search));
    }
    
    // Sort by issued date (newest first)
    invoices.sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const total = invoices.length;
    
    invoices = invoices.slice(startIndex, startIndex + limit);
    
    // Expand patient, provider, items, and payments information
    invoices = invoices.map(invoice => {
      const patient = this.patients.get(invoice.patientId);
      const provider = this.users.get(invoice.providerId);
      const providerProfile = provider ? Array.from(this.userProfiles.values()).find(p => p.userId === provider.id) : undefined;
      
      const items = Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === invoice.id);
      const payments = Array.from(this.payments.values()).filter(payment => payment.invoiceId === invoice.id);
      
      return {
        ...invoice,
        patient: patient ? {
          id: patient.id,
          patientId: patient.patientId,
          firstName: patient.firstName,
          lastName: patient.lastName
        } : undefined,
        provider: provider && providerProfile ? {
          id: provider.id,
          firstName: providerProfile.firstName,
          lastName: providerProfile.lastName
        } : undefined,
        items,
        payments
      };
    });
    
    return {
      invoices,
      total
    };
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const patient = this.patients.get(invoice.patientId);
    const provider = this.users.get(invoice.providerId);
    const providerProfile = provider ? Array.from(this.userProfiles.values()).find(p => p.userId === provider.id) : undefined;
    
    const items = Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === invoice.id);
    const payments = Array.from(this.payments.values()).filter(payment => payment.invoiceId === invoice.id);
    
    return {
      ...invoice,
      patient: patient ? {
        id: patient.id,
        patientId: patient.patientId,
        firstName: patient.firstName,
        lastName: patient.lastName
      } : undefined,
      provider: provider && providerProfile ? {
        id: provider.id,
        firstName: providerProfile.firstName,
        lastName: providerProfile.lastName
      } : undefined,
      items,
      payments
    };
  }

  async createInvoice(invoice: InsertInvoice, items: Partial<InvoiceItem>[]): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const newInvoice: Invoice = {
      ...invoice,
      id,
      paidAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.invoices.set(id, newInvoice);
    
    // Create invoice items
    if (items.length > 0) {
      for (const item of items) {
        await this.addInvoiceItem(id, item);
      }
    }
    
    return this.getInvoiceById(id) as Promise<Invoice>;
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = {
      ...invoice,
      ...invoiceData,
      updatedAt: new Date()
    };
    this.invoices.set(id, updatedInvoice);
    return this.getInvoiceById(id);
  }

  async addInvoiceItem(invoiceId: number, item: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const id = this.invoiceItemIdCounter++;
    const newItem: InvoiceItem = {
      ...item as any,
      id,
      invoiceId,
      createdAt: new Date()
    };
    this.invoiceItems.set(id, newItem);
    
    // Update invoice total
    const invoice = await this.getInvoiceById(invoiceId);
    if (invoice) {
      const newAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const newTax = invoice.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      await this.updateInvoice(invoiceId, {
        amount: newAmount,
        tax: newTax,
        totalAmount: newAmount + newTax
      });
    }
    
    return newItem;
  }

  async updateInvoiceItem(id: number, itemData: Partial<InvoiceItem>): Promise<InvoiceItem | undefined> {
    const item = this.invoiceItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = {
      ...item,
      ...itemData
    };
    this.invoiceItems.set(id, updatedItem);
    
    // Update invoice total
    const invoiceId = item.invoiceId;
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (invoice) {
      const newAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const newTax = invoice.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      await this.updateInvoice(invoiceId, {
        amount: newAmount,
        tax: newTax,
        totalAmount: newAmount + newTax
      });
    }
    
    return updatedItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    const item = this.invoiceItems.get(id);
    if (!item) return false;
    
    this.invoiceItems.delete(id);
    
    // Update invoice total
    const invoiceId = item.invoiceId;
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (invoice) {
      const newAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const newTax = invoice.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      await this.updateInvoice(invoiceId, {
        amount: newAmount,
        tax: newTax,
        totalAmount: newAmount + newTax
      });
    }
    
    return true;
  }

  async recordPayment(payment: Partial<Payment>): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const newPayment: Payment = {
      ...payment as any,
      id,
      paymentDate: payment.paymentDate || new Date(),
      status: payment.status || 'completed',
      createdAt: new Date()
    };
    this.payments.set(id, newPayment);
    
    // Update invoice status
    const invoiceId = payment.invoiceId!;
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + payment.amount!;
      const newStatus = totalPaid >= invoice.totalAmount ? 'paid' : 'partially_paid';
      
      await this.updateInvoice(invoiceId, {
        status: newStatus,
        paidAmount: totalPaid,
        paidDate: newStatus === 'paid' ? new Date() : invoice.paidDate
      });
    }
    
    return newPayment;
  }

  async getBillingStats(userId: number): Promise<any> {
    // Get provider's invoices
    const invoices = Array.from(this.invoices.values()).filter(invoice => invoice.providerId === userId);
    
    // Calculate stats
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const pendingAmount = invoices
      .filter(invoice => invoice.status === 'pending' || invoice.status === 'partially_paid')
      .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);
    
    // Calculate overdue invoices (due date is past)
    const now = new Date();
    const overdue = invoices
      .filter(invoice => 
        (invoice.status === 'pending' || invoice.status === 'partially_paid') && 
        new Date(invoice.dueDate) < now
      )
      .reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);
    
    // Calculate paid amount
    const paid = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    return {
      totalRevenue,
      pendingAmount,
      overdue,
      paid
    };
  }

  // AI Chat
  async getChatSessions(userId: number): Promise<AIChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getChatSessionById(id: number): Promise<AIChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const messages = Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return {
      ...session,
      messages
    };
  }

  async createChatSession(session: InsertAIChatSession): Promise<AIChatSession> {
    const id = this.chatSessionIdCounter++;
    const newSession: AIChatSession = {
      ...session,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.chatSessions.set(id, newSession);
    return newSession;
  }

  async updateChatSession(id: number, sessionData: Partial<AIChatSession>): Promise<AIChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      ...sessionData,
      updatedAt: new Date()
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteChatSession(id: number): Promise<boolean> {
    if (!this.chatSessions.has(id)) return false;
    
    // Delete associated messages
    Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === id)
      .forEach(msg => this.chatMessages.delete(msg.id));
    
    // Delete the session
    this.chatSessions.delete(id);
    return true;
  }

  async getChatMessages(sessionId: number): Promise<AIChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage> {
    const id = this.chatMessageIdCounter++;
    const newMessage: AIChatMessage = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, newMessage);
    
    // Update session's updatedAt timestamp
    const session = this.chatSessions.get(message.sessionId);
    if (session) {
      this.updateChatSession(message.sessionId, { updatedAt: new Date() });
    }
    
    return newMessage;
  }

  // Audit Logging
  async createAuditLog(logData: any): Promise<any> {
    const newLog = {
      ...logData,
      id: this.auditLogs.length + 1,
      timestamp: new Date()
    };
    this.auditLogs.push(newLog);
    return newLog;
  }

  async getAuditLogs(options: any = {}): Promise<any[]> {
    let logs = [...this.auditLogs];
    
    // Apply filters
    if (options.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }
    
    if (options.action) {
      logs = logs.filter(log => log.action === options.action);
    }
    
    if (options.resourceType) {
      logs = logs.filter(log => log.resourceType === options.resourceType);
    }
    
    if (options.resourceId) {
      logs = logs.filter(log => log.resourceId === options.resourceId);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      logs = logs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    if (options.limit) {
      logs = logs.slice(0, options.limit);
    }
    
    return logs;
  }
}

// Use Supabase storage in production, fall back to MemStorage in development/testing
export const storage = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? new SupabaseStorage()
  : new MemStorage();
