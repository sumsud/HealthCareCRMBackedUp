import { Request, Response } from 'express';
import { storage } from '../storage';
import { createAuditLog } from '../middleware/logger';
import { insertPatientSchema, insertClinicalNoteSchema } from '@shared/schema';

// Get all patients with pagination and filtering
export const getPatients = async (req: Request, res: Response) => {
  try {
    const { search, status, page, limit, sortBy, sortDir } = req.query;
    
    const options = {
      search: search as string,
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      sortBy: sortBy as string,
      sortDir: sortDir as 'asc' | 'desc'
    };
    
    const { patients, total } = await storage.getPatients(options);
    
    res.status(200).json({
      success: true,
      data: {
        patients,
        pagination: {
          page: options.page,
          limit: options.limit,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
};

// Get a patient by id
export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await storage.getPatientById(parseInt(id));
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patient',
      error: error.message
    });
  }
};

// Create a new patient
export const createPatient = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertPatientSchema.parse(req.body);
    
    // Set user ID from authenticated user
    validatedData.userId = req.user?.id || 0;
    
    // Create patient
    const patient = await storage.createPatient(validatedData);
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'patient',
      resourceId: patient.id.toString(),
      description: `Patient created: ${patient.firstName} ${patient.lastName}`
    });
    
    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create patient',
      error: error.message
    });
  }
};

// Update a patient
export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const patient = await storage.getPatientById(parseInt(id));
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    // Update patient
    const updatedPatient = await storage.updatePatient(parseInt(id), req.body);
    
    // Audit log
    await createAuditLog(req, {
      action: 'update',
      resourceType: 'patient',
      resourceId: id,
      description: `Patient updated: ${patient.firstName} ${patient.lastName}`
    });
    
    res.status(200).json({
      success: true,
      data: updatedPatient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update patient',
      error: error.message
    });
  }
};

// Archive a patient
export const archivePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const patient = await storage.getPatientById(parseInt(id));
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    // Archive patient
    const archivedPatient = await storage.archivePatient(parseInt(id));
    
    // Audit log
    await createAuditLog(req, {
      action: 'archive',
      resourceType: 'patient',
      resourceId: id,
      description: `Patient archived: ${patient.firstName} ${patient.lastName}`
    });
    
    res.status(200).json({
      success: true,
      data: archivedPatient
    });
  } catch (error) {
    console.error('Archive patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive patient',
      error: error.message
    });
  }
};

// Get clinical notes for a patient
export const getClinicalNotes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const patient = await storage.getPatientById(parseInt(id));
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    // Get clinical notes
    const notes = await storage.getClinicalNotes(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Get clinical notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch clinical notes',
      error: error.message
    });
  }
};

// Create a clinical note for a patient
export const createClinicalNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const patient = await storage.getPatientById(parseInt(id));
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    // Validate request body
    const validatedData = insertClinicalNoteSchema.parse({
      ...req.body,
      patientId: parseInt(id),
      createdBy: req.user?.id
    });
    
    // Create clinical note
    const note = await storage.createClinicalNote(validatedData);
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'clinicalNote',
      resourceId: note.id.toString(),
      description: `Clinical note created for patient: ${patient.firstName} ${patient.lastName}`
    });
    
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Create clinical note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create clinical note',
      error: error.message
    });
  }
};

// Update a clinical note
export const updateClinicalNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if note exists
    const note = await storage.getClinicalNoteById(parseInt(id));
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Clinical note not found' 
      });
    }
    
    // Check if note is locked
    if (note.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot modify a locked clinical note' 
      });
    }
    
    // Update clinical note
    const updatedNote = await storage.updateClinicalNote(parseInt(id), req.body);
    
    // Audit log
    await createAuditLog(req, {
      action: 'update',
      resourceType: 'clinicalNote',
      resourceId: id,
      description: `Clinical note updated for patient ID: ${note.patientId}`
    });
    
    res.status(200).json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    console.error('Update clinical note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update clinical note',
      error: error.message
    });
  }
};

// Sign a clinical note
export const signClinicalNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if note exists
    const note = await storage.getClinicalNoteById(parseInt(id));
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Clinical note not found' 
      });
    }
    
    // Check if note is already signed
    if (note.isSigned) {
      return res.status(400).json({ 
        success: false, 
        message: 'Clinical note is already signed' 
      });
    }
    
    // Sign clinical note
    const signedNote = await storage.signClinicalNote(parseInt(id), req.user?.id || 0);
    
    // Audit log
    await createAuditLog(req, {
      action: 'sign',
      resourceType: 'clinicalNote',
      resourceId: id,
      description: `Clinical note signed for patient ID: ${note.patientId}`
    });
    
    res.status(200).json({
      success: true,
      data: signedNote
    });
  } catch (error) {
    console.error('Sign clinical note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sign clinical note',
      error: error.message
    });
  }
};

// Get recent activity
export const getActivities = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get audit logs
    const logs = await storage.getAuditLogs({
      limit: parseInt(limit as string)
    });
    
    // Format logs as timeline events
    const activities = logs.map(log => ({
      id: log.id,
      title: log.description,
      timestamp: log.createdAt,
      category: log.resourceType,
      userId: log.userId,
      resourceId: log.resourceId
    }));
    
    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};