import { Request, Response } from 'express';
import { storage } from '../storage';
import { createAuditLog } from '../middleware/logger';
import { insertAiChatSessionSchema, insertAiChatMessageSchema } from '@shared/schema';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get all chat sessions for a user
export const getChatSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const sessions = await storage.getChatSessions(userId);
    
    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat sessions',
      error: error.message
    });
  }
};

// Get a specific chat session by id
export const getChatSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get the chat session
    const session = await storage.getChatSessionById(parseInt(id));
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat session not found' 
      });
    }
    
    // Check if the session belongs to the user
    if (session.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to access this chat session' 
      });
    }
    
    // Get chat messages
    const messages = await storage.getChatMessages(session.id);
    
    res.status(200).json({
      success: true,
      data: {
        session,
        messages
      }
    });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat session',
      error: error.message
    });
  }
};

// Create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Validate request body
    const validatedData = insertAiChatSessionSchema.parse({
      ...req.body,
      userId
    });
    
    // Create chat session
    const session = await storage.createChatSession(validatedData);
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'aiChatSession',
      resourceId: session.id.toString(),
      description: `Chat session created: ${session.title}`
    });
    
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create chat session',
      error: error.message
    });
  }
};

// Update a chat session
export const updateChatSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get the chat session
    const session = await storage.getChatSessionById(parseInt(id));
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat session not found' 
      });
    }
    
    // Check if the session belongs to the user
    if (session.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to update this chat session' 
      });
    }
    
    // Update chat session
    const updatedSession = await storage.updateChatSession(parseInt(id), req.body);
    
    // Audit log
    await createAuditLog(req, {
      action: 'update',
      resourceType: 'aiChatSession',
      resourceId: id,
      description: `Chat session updated: ${session.title}`
    });
    
    res.status(200).json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Update chat session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update chat session',
      error: error.message
    });
  }
};

// Delete a chat session
export const deleteChatSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get the chat session
    const session = await storage.getChatSessionById(parseInt(id));
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat session not found' 
      });
    }
    
    // Check if the session belongs to the user
    if (session.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to delete this chat session' 
      });
    }
    
    // Delete chat session
    const success = await storage.deleteChatSession(parseInt(id));
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete chat session' 
      });
    }
    
    // Audit log
    await createAuditLog(req, {
      action: 'delete',
      resourceType: 'aiChatSession',
      resourceId: id,
      description: `Chat session deleted: ${session.title}`
    });
    
    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete chat session',
      error: error.message
    });
  }
};

// Send a chat message
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, content } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Validate input
    if (!sessionId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide sessionId and content' 
      });
    }
    
    // Get the chat session
    const session = await storage.getChatSessionById(parseInt(sessionId));
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat session not found' 
      });
    }
    
    // Check if the session belongs to the user
    if (session.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to send messages to this chat session' 
      });
    }
    
    // Get previous messages for context
    const previousMessages = await storage.getChatMessages(session.id);
    
    // Format messages for OpenAI
    const messages = previousMessages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // Add system message based on session type
    let systemMessage = 'You are a helpful healthcare assistant.';
    if (session.type === 'clinical') {
      systemMessage = 'You are a clinical assistant for healthcare providers. Provide evidence-based information and maintain HIPAA compliance. Do not make diagnoses, but you can suggest differential considerations.';
    } else if (session.type === 'coding') {
      systemMessage = 'You are a medical coding assistant. Help with ICD-10, CPT, and HCPCS codes. Provide guidance on proper coding practices for billing.';
    } else if (session.type === 'documentation') {
      systemMessage = 'You are a documentation assistant for healthcare providers. Help create clinical notes, referrals, and patient education materials.';
    }
    
    messages.unshift({ role: 'system', content: systemMessage });
    
    // Add the new user message
    messages.push({ role: 'user', content });
    
    // Create user message in database
    const userMessage = await storage.createChatMessage({
      sessionId: session.id,
      content,
      isUser: true,
      timestamp: new Date()
    });
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const aiResponse = response.choices[0].message.content || 'Sorry, I could not generate a response.';
    
    // Create AI message in database
    const aiMessage = await storage.createChatMessage({
      sessionId: session.id,
      content: aiResponse,
      isUser: false,
      timestamp: new Date()
    });
    
    // Update session last message time
    await storage.updateChatSession(session.id, {
      lastMessageAt: new Date()
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'message',
      resourceType: 'aiChat',
      resourceId: session.id.toString(),
      description: `Chat message sent in session: ${session.title}`
    });
    
    res.status(200).json({
      success: true,
      data: {
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send chat message',
      error: error.message
    });
  }
};

// Clinical query
export const clinicalQuery = async (req: Request, res: Response) => {
  try {
    const { query, patientContext } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Validate input
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a query' 
      });
    }
    
    // Construct the prompt
    let prompt = `Clinical Query: ${query}\n\n`;
    
    if (patientContext) {
      prompt += `Patient Context:\n${JSON.stringify(patientContext, null, 2)}\n\n`;
    }
    
    prompt += 'Please provide evidence-based information. Remember to maintain HIPAA compliance.';
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: 'You are a clinical decision support assistant for healthcare providers. Provide evidence-based information and maintain HIPAA compliance. Do not make diagnoses, but you can suggest differential considerations and cite relevant medical literature.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    const aiResponse = response.choices[0].message.content || 'Sorry, I could not generate a response.';
    
    // Audit log
    await createAuditLog(req, {
      action: 'query',
      resourceType: 'aiClinical',
      resourceId: userId.toString(),
      description: `Clinical query: ${query.substring(0, 50)}...`
    });
    
    res.status(200).json({
      success: true,
      data: { response: aiResponse }
    });
  } catch (error) {
    console.error('Clinical query error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process clinical query',
      error: error.message
    });
  }
};

// Code assistance
export const codeAssistance = async (req: Request, res: Response) => {
  try {
    const { query, codeSystem, patientDetails } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Validate input
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a query' 
      });
    }
    
    // Construct the prompt
    let prompt = `Medical Coding Query: ${query}\n\n`;
    
    if (codeSystem) {
      prompt += `Code System: ${codeSystem}\n\n`;
    }
    
    if (patientDetails) {
      prompt += `Patient Details:\n${JSON.stringify(patientDetails, null, 2)}\n\n`;
    }
    
    prompt += 'Please provide accurate coding information with explanations.';
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: 'You are a medical coding assistant for healthcare providers. Help with ICD-10, CPT, and HCPCS codes. Provide guidance on proper coding practices for billing. When providing codes, always include the code number and full description, and explain your reasoning.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });
    
    const aiResponse = response.choices[0].message.content || 'Sorry, I could not generate a response.';
    
    // Audit log
    await createAuditLog(req, {
      action: 'query',
      resourceType: 'aiCoding',
      resourceId: userId.toString(),
      description: `Coding assistance query: ${query.substring(0, 50)}...`
    });
    
    res.status(200).json({
      success: true,
      data: { response: aiResponse }
    });
  } catch (error) {
    console.error('Code assistance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process coding query',
      error: error.message
    });
  }
};

// Generate clinical note
export const generateNote = async (req: Request, res: Response) => {
  try {
    const { type, patientId, appointmentId, details } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Validate input
    if (!type || !patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide type and patientId' 
      });
    }
    
    // Get patient information
    const patient = await storage.getPatientById(parseInt(patientId));
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    // Get appointment information if provided
    let appointment;
    if (appointmentId) {
      appointment = await storage.getAppointmentById(parseInt(appointmentId));
    }
    
    // Construct the prompt
    let prompt = `Generate a ${type} clinical note for the following patient:\n\n`;
    
    prompt += `Patient Information:\n`;
    prompt += `- Name: ${patient.firstName} ${patient.lastName}\n`;
    prompt += `- DOB: ${patient.dateOfBirth || 'Unknown'}\n`;
    prompt += `- Gender: ${patient.gender || 'Unknown'}\n`;
    
    if (patient.medicalConditions) {
      prompt += `- Medical Conditions: ${patient.medicalConditions}\n`;
    }
    
    if (patient.allergies) {
      prompt += `- Allergies: ${patient.allergies}\n`;
    }
    
    if (patient.medications) {
      prompt += `- Medications: ${patient.medications}\n`;
    }
    
    if (appointment) {
      prompt += `\nAppointment Information:\n`;
      prompt += `- Date: ${appointment.startTime}\n`;
      prompt += `- Type: ${appointment.appointmentType}\n`;
      prompt += `- Reason: ${appointment.title}\n`;
    }
    
    if (details) {
      prompt += `\nAdditional Details:\n${details}\n`;
    }
    
    prompt += '\nPlease generate a well-structured clinical note that includes appropriate headers, assessment, and plan.';
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: 'You are a documentation assistant for healthcare providers. Help create detailed, professional clinical notes that follow standard medical documentation practices. Format the note with clear sections like Subjective, Objective, Assessment, and Plan (SOAP). Include relevant medical terminology while maintaining HIPAA compliance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2500
    });
    
    const aiResponse = response.choices[0].message.content || 'Sorry, I could not generate a note.';
    
    // Audit log
    await createAuditLog(req, {
      action: 'generate',
      resourceType: 'aiNote',
      resourceId: `${patientId}`,
      description: `Generated ${type} note for patient: ${patient.firstName} ${patient.lastName}`
    });
    
    res.status(200).json({
      success: true,
      data: { 
        note: aiResponse,
        patient: {
          id: patient.id,
          name: `${patient.firstName} ${patient.lastName}`
        },
        appointment: appointment ? {
          id: appointment.id,
          date: appointment.startTime,
          type: appointment.appointmentType
        } : null
      }
    });
  } catch (error) {
    console.error('Generate note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate clinical note',
      error: error.message
    });
  }
};