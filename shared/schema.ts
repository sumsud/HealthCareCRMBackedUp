import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users & Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  lastLoginAt: timestamp("last_login_at"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  isActive: boolean("is_active").default(true),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  title: text("title"),
  specialty: text("specialty"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  clinicName: text("clinic_name"),
  npiNumber: text("npi_number"),
  licenseNumber: text("license_number"),
  licenseState: text("license_state"),
  licenseExpiration: timestamp("license_expiration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(), // Custom ID (e.g., P-12345)
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  insurance: text("insurance"),
  insuranceMemberId: text("insurance_member_id"),
  insuranceGroupId: text("insurance_group_id"),
  primaryCarePhysician: text("primary_care_physician"),
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  status: text("status").default("active"),
  consentToTreat: boolean("consent_to_treat").default(false),
  consentToShare: boolean("consent_to_share").default(false),
  preferredLanguage: text("preferred_language").default("English"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastVisitDate: timestamp("last_visit_date"),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  providerId: integer("provider_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").default("scheduled"), // scheduled, confirmed, check-in, completed, cancelled, no-show
  appointmentType: text("appointment_type").notNull(), // in-person, telehealth
  reason: text("reason"),
  notes: text("notes"),
  isFollowUp: boolean("is_follow_up").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: integer("cancelled_by").references(() => users.id),
  cancelReason: text("cancel_reason"),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  recipientId: integer("recipient_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  isPatientMessage: boolean("is_patient_message").default(false),
  patientId: integer("patient_id").references(() => patients.id),
  isEncrypted: boolean("is_encrypted").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
  isArchived: boolean("is_archived").default(false),
  priority: text("priority").default("normal"),
  threadId: text("thread_id"), // For organizing messages in conversations
});

// Attachments for messages
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(), 
  filePath: text("file_path").notNull(),
  isEncrypted: boolean("is_encrypted").default(true),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
});

// Clinical notes
export const clinicalNotes = pgTable("clinical_notes", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  providerId: integer("provider_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  noteType: text("note_type").notNull(), // SOAP, procedure, lab, medication, etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  isSigned: boolean("is_signed").default(false),
  isLocked: boolean("is_locked").default(false),
  signedAt: timestamp("signed_at"),
  signedBy: integer("signed_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

// Billing
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  providerId: integer("provider_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: integer("amount").notNull(), // in cents
  tax: integer("tax").default(0),
  totalAmount: integer("total_amount").notNull(), // in cents
  status: text("status").default("pending"), // pending, paid, partially_paid, cancelled, refunded
  dueDate: timestamp("due_date").notNull(),
  issuedDate: timestamp("issued_date").notNull().defaultNow(),
  paidDate: timestamp("paid_date"),
  paidAmount: integer("paid_amount").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // in cents
  amount: integer("amount").notNull(), // in cents
  taxRate: integer("tax_rate").default(0),
  taxAmount: integer("tax_amount").default(0),
  cptCode: text("cpt_code"),
  icdCode: text("icd_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  patientId: integer("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  amount: integer("amount").notNull(), // in cents
  paymentMethod: text("payment_method").notNull(), // credit_card, cash, check, insurance
  transactionId: text("transaction_id"),
  status: text("status").default("completed"), // completed, pending, failed, refunded
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  planName: text("plan_name").notNull(),
  planDescription: text("plan_description"),
  amount: integer("amount").notNull(), // in cents
  interval: text("interval").notNull(), // month, year
  status: text("status").default("active"), // active, cancelled, past_due, trialing
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  trialEndDate: timestamp("trial_end_date"),
  cancelledAt: timestamp("cancelled_at"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  maxProviders: integer("max_providers").default(1),
  features: text("features"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Audit log for HIPAA compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // view, create, update, delete
  resourceType: text("resource_type").notNull(), // patient, appointment, message, invoice, etc.
  resourceId: text("resource_id").notNull(),
  description: text("description"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  success: boolean("success").default(true),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
});

// AI chat sessions
export const aiChatSessions = pgTable("ai_chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiChatMessages = pgTable("ai_chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => aiChatSessions.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // user, assistant
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  role: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).pick({
  userId: true,
  firstName: true,
  lastName: true,
  title: true,
  specialty: true,
  phoneNumber: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  bio: true,
  avatarUrl: true,
  clinicName: true,
  npiNumber: true,
  licenseNumber: true,
  licenseState: true,
  licenseExpiration: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  patientId: true,
  userId: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  email: true,
  phoneNumber: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  insurance: true,
  insuranceMemberId: true,
  insuranceGroupId: true,
  primaryCarePhysician: true,
  allergies: true,
  medicalConditions: true,
  medications: true,
  status: true,
  consentToTreat: true,
  consentToShare: true,
  preferredLanguage: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  patientId: true,
  providerId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  status: true,
  appointmentType: true,
  reason: true,
  notes: true,
  isFollowUp: true,
  isRecurring: true,
  recurringPattern: true,
  location: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  recipientId: true,
  subject: true,
  content: true,
  isPatientMessage: true,
  patientId: true,
  priority: true,
  threadId: true,
});

export const insertClinicalNoteSchema = createInsertSchema(clinicalNotes).pick({
  patientId: true,
  providerId: true,
  appointmentId: true,
  noteType: true,
  title: true,
  content: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  patientId: true,
  providerId: true,
  invoiceNumber: true,
  amount: true,
  tax: true,
  totalAmount: true,
  status: true,
  dueDate: true,
  notes: true,
});

export const insertAiChatSessionSchema = createInsertSchema(aiChatSessions).pick({
  userId: true,
  title: true,
});

export const insertAiChatMessageSchema = createInsertSchema(aiChatMessages).pick({
  sessionId: true,
  content: true,
  role: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertClinicalNote = z.infer<typeof insertClinicalNoteSchema>;
export type ClinicalNote = typeof clinicalNotes.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertAiChatSession = z.infer<typeof insertAiChatSessionSchema>;
export type AiChatSession = typeof aiChatSessions.$inferSelect;

export type InsertAiChatMessage = z.infer<typeof insertAiChatMessageSchema>;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
