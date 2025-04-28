import { Request, Response } from 'express';
import { storage } from '../storage';
import { createAuditLog } from '../middleware/logger';
import { insertMessageSchema } from '@shared/schema';

// Get all messages with filtering and pagination
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { 
      userId, senderId, receiverId, threadId, 
      isRead, isArchived, page, limit 
    } = req.query;
    
    const options = {
      userId: req.user?.id,
      senderId: senderId ? parseInt(senderId as string) : undefined,
      receiverId: receiverId ? parseInt(receiverId as string) : undefined,
      threadId: threadId as string,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    };
    
    const { messages, total } = await storage.getMessages(options);
    
    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page: options.page,
          limit: options.limit,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Get count of unread messages
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const count = await storage.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// Get a thread of messages
export const getThread = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    
    // Validate input
    if (!threadId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide threadId' 
      });
    }
    
    const messages = await storage.getThread(threadId);
    
    // Auto-mark messages as read
    const userId = req.user?.id || 0;
    for (const message of messages) {
      if (message.receiverId === userId && !message.isRead) {
        await storage.markMessageAsRead(message.id);
      }
    }
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch thread',
      error: error.message
    });
  }
};

// Create a new message
export const createMessage = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertMessageSchema.parse({
      ...req.body,
      senderId: req.user?.id,
      sentAt: new Date()
    });
    
    // If no threadId is provided, generate one
    if (!validatedData.threadId) {
      // Create a sorted pair of sender and receiver IDs to ensure consistent threadIds
      const participants = [validatedData.senderId, validatedData.receiverId].sort().join('-');
      validatedData.threadId = `thread-${participants}`;
    }
    
    // Create message
    const message = await storage.createMessage(validatedData);
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'message',
      resourceId: message.id.toString(),
      description: `Message sent to user ID: ${message.receiverId}`
    });
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create message',
      error: error.message
    });
  }
};

// Reply to a message
export const replyToMessage = async (req: Request, res: Response) => {
  try {
    const { messageId, content } = req.body;
    
    // Validate input
    if (!messageId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide messageId and content' 
      });
    }
    
    // Get original message to determine threadId and recipient
    const messages = Array.from((await storage.getMessages({})).messages);
    const originalMessage = messages.find(m => m.id === parseInt(messageId));
    
    if (!originalMessage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Original message not found' 
      });
    }
    
    // Create reply
    const reply = await storage.createMessage({
      threadId: originalMessage.threadId,
      senderId: req.user?.id || 0,
      receiverId: originalMessage.senderId, // Reply to the sender of the original message
      content,
      sentAt: new Date(),
      isRead: false,
      isArchived: false
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'message',
      resourceId: reply.id.toString(),
      description: `Reply sent to user ID: ${reply.receiverId}`
    });
    
    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reply to message',
      error: error.message
    });
  }
};

// Mark a message as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if message exists
    const messages = Array.from((await storage.getMessages({})).messages);
    const message = messages.find(m => m.id === parseInt(id));
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }
    
    // Verify the current user is the recipient
    if (message.receiverId !== req.user?.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only mark your own messages as read' 
      });
    }
    
    // Mark message as read
    const updatedMessage = await storage.markMessageAsRead(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Archive a message
export const archiveMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if message exists
    const messages = Array.from((await storage.getMessages({})).messages);
    const message = messages.find(m => m.id === parseInt(id));
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }
    
    // Verify the current user is the sender or recipient
    if (message.senderId !== req.user?.id && message.receiverId !== req.user?.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only archive your own messages' 
      });
    }
    
    // Archive message
    const archivedMessage = await storage.archiveMessage(parseInt(id));
    
    // Audit log
    await createAuditLog(req, {
      action: 'archive',
      resourceType: 'message',
      resourceId: id,
      description: `Message archived`
    });
    
    res.status(200).json({
      success: true,
      data: archivedMessage
    });
  } catch (error) {
    console.error('Archive message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive message',
      error: error.message
    });
  }
};