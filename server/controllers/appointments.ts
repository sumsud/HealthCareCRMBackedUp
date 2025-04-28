import { Request, Response } from 'express';
import { storage } from '../storage';
import { createAuditLog } from '../middleware/logger';
import { insertAppointmentSchema } from '@shared/schema';

// Get all appointments with filtering and pagination
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { 
      providerId, patientId, status, appointmentType, 
      startDate, endDate, isFollowUp, page, limit 
    } = req.query;
    
    const options = {
      providerId: providerId ? parseInt(providerId as string) : undefined,
      patientId: patientId ? parseInt(patientId as string) : undefined,
      status: status as string,
      appointmentType: appointmentType as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      isFollowUp: isFollowUp === 'true' ? true : isFollowUp === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    };
    
    const { appointments, total } = await storage.getAppointments(options);
    
    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: options.page,
          limit: options.limit,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get an appointment by id
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await storage.getAppointmentById(parseInt(id));
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// Create a new appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertAppointmentSchema.parse({
      ...req.body,
      createdBy: req.user?.id
    });
    
    // Create appointment
    const appointment = await storage.createAppointment(validatedData);
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'appointment',
      resourceId: appointment.id.toString(),
      description: `Appointment created for patient ID: ${appointment.patientId}`
    });
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Update an appointment
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if appointment exists
    const appointment = await storage.getAppointmentById(parseInt(id));
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    // Check if appointment can be updated
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${appointment.status} appointment`
      });
    }
    
    // Update appointment
    const updatedAppointment = await storage.updateAppointment(parseInt(id), req.body);
    
    // Audit log
    await createAuditLog(req, {
      action: 'update',
      resourceType: 'appointment',
      resourceId: id,
      description: `Appointment updated for patient ID: ${appointment.patientId}`
    });
    
    res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    
    // Check if appointment exists
    const appointment = await storage.getAppointmentById(parseInt(id));
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    // Check if appointment can be cancelled
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${appointment.status} appointment`
      });
    }
    
    // Cancel appointment
    const cancelledAppointment = await storage.cancelAppointment(parseInt(id), {
      cancelledBy: req.user?.id || 0,
      cancelReason
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'cancel',
      resourceType: 'appointment',
      resourceId: id,
      description: `Appointment cancelled for patient ID: ${appointment.patientId}`
    });
    
    res.status(200).json({
      success: true,
      data: cancelledAppointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// Check in an appointment
export const checkInAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if appointment exists
    const appointment = await storage.getAppointmentById(parseInt(id));
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    // Check if appointment can be checked in
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in ${appointment.status} appointment`
      });
    }
    
    // Check in appointment
    const checkedInAppointment = await storage.checkInAppointment(parseInt(id));
    
    // Audit log
    await createAuditLog(req, {
      action: 'checkIn',
      resourceType: 'appointment',
      resourceId: id,
      description: `Patient checked in for appointment ID: ${id}`
    });
    
    res.status(200).json({
      success: true,
      data: checkedInAppointment
    });
  } catch (error) {
    console.error('Check in appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check in appointment',
      error: error.message
    });
  }
};

// Complete an appointment
export const completeAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    // Check if appointment exists
    const appointment = await storage.getAppointmentById(parseInt(id));
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    // Check if appointment can be completed
    if (!['check-in', 'in-progress'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete ${appointment.status} appointment`
      });
    }
    
    // Complete appointment
    const completedAppointment = await storage.completeAppointment(parseInt(id), notes);
    
    // Audit log
    await createAuditLog(req, {
      action: 'complete',
      resourceType: 'appointment',
      resourceId: id,
      description: `Appointment marked as completed for patient ID: ${appointment.patientId}`
    });
    
    res.status(200).json({
      success: true,
      data: completedAppointment
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete appointment',
      error: error.message
    });
  }
};

// Reschedule an appointment
export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, reason } = req.body;
    
    // Validate input
    if (!startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide startTime and endTime' 
      });
    }
    
    // Check if appointment exists
    const appointment = await storage.getAppointmentById(parseInt(id));
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    // Check if appointment can be rescheduled
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule ${appointment.status} appointment`
      });
    }
    
    // Reschedule appointment
    const rescheduledAppointment = await storage.rescheduleAppointment(parseInt(id), {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'reschedule',
      resourceType: 'appointment',
      resourceId: id,
      description: `Appointment rescheduled for patient ID: ${appointment.patientId}`
    });
    
    res.status(200).json({
      success: true,
      data: rescheduledAppointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reschedule appointment',
      error: error.message
    });
  }
};