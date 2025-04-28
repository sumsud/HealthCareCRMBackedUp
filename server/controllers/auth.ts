import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { createAuditLog } from '../middleware/logger';
import { insertUserSchema, insertUserProfileSchema } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if username or email already exists
    const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }
    
    const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);
    
    // Create user
    const user = await storage.createUser({
      ...validatedData,
      password: hashedPassword
    });
    
    // Create user profile
    const profileData = insertUserProfileSchema.parse({
      userId: user.id,
      firstName: req.body.firstName || '',
      lastName: req.body.lastName || '',
      title: req.body.title,
      specialty: req.body.specialty,
      clinicName: req.body.clinicName
    });
    
    await storage.createUserProfile(profileData);
    
    // Audit log
    await createAuditLog(req, {
      action: 'create',
      resourceType: 'user',
      resourceId: user.id.toString(),
      description: `User registered: ${user.username}`
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is inactive' 
      });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        userId: user.id
      });
    }
    
    // Get user profile
    const profile = await storage.getUserProfile(user.id);
    
    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });
    
    // Audit log
    await createAuditLog(req, {
      action: 'login',
      resourceType: 'user',
      resourceId: user.id.toString(),
      description: `User logged in: ${user.username}`
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        profile
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    // Audit log if we have user information
    if (req.user) {
      await createAuditLog(req, {
        action: 'logout',
        resourceType: 'user',
        resourceId: req.user.id.toString(),
        description: `User logged out: ${req.user.username}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Get user from req (set by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Get user and profile
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const profile = await storage.getUserProfile(userId);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Get user from req (set by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Update user profile
    const profile = await storage.updateUserProfile(userId, req.body);
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }
    
    // Audit log
    await createAuditLog(req, {
      action: 'update',
      resourceType: 'userProfile',
      resourceId: profile.id.toString(),
      description: `User profile updated: ${req.user.username}`
    });
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email' 
      });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ 
        success: true, 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    }
    
    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour
    
    // Update user with reset token
    await storage.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });
    
    // In a real app, send email with reset link
    // For demo purposes, just return the token
    
    // Audit log
    await createAuditLog(req, {
      action: 'forgotPassword',
      resourceType: 'user',
      resourceId: user.id.toString(),
      description: `Password reset requested for: ${user.email}`
    });
    
    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link',
      // Include token for demo purposes only, would normally be sent via email
      resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    // Validate input
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide token and new password' 
      });
    }
    
    // Find user by reset token
    const users = Array.from((await storage.getPatients({})).patients);
    const user = users.find(u => u.resetPasswordToken === token && u.resetPasswordExpires > new Date());
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user with new password
    await storage.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    // Audit log
    await createAuditLog(req, {
      action: 'resetPassword',
      resourceType: 'user',
      resourceId: user.id.toString(),
      description: `Password reset completed for: ${user.email}`
    });
    
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Enable two-factor authentication
export const enableTwoFactor = async (req: Request, res: Response) => {
  try {
    // Get user from req (set by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Generate secret
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Update user with 2FA secret
    await storage.updateUser(userId, {
      twoFactorSecret: secret,
      isTwoFactorEnabled: false // Not enabled until verified
    });
    
    // In a real app, generate QR code for authenticator app
    
    // Audit log
    await createAuditLog(req, {
      action: 'enableTwoFactor',
      resourceType: 'user',
      resourceId: userId.toString(),
      description: `Two-factor authentication setup initiated for: ${req.user.username}`
    });
    
    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCodeUrl: `otpauth://totp/CareFlowCRM:${req.user.email}?secret=${secret}&issuer=CareFlowCRM`
      }
    });
  } catch (error) {
    console.error('Enable two-factor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to enable two-factor authentication',
      error: error.message
    });
  }
};

// Verify two-factor authentication
export const verifyTwoFactor = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    
    // Validate input
    if (!userId || !token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide userId and token' 
      });
    }
    
    // Get user
    const user = await storage.getUserById(parseInt(userId));
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // In a real app, verify token against user's secret
    // For demo, accept any token
    
    // If this is initial setup, enable 2FA
    if (!user.isTwoFactorEnabled) {
      await storage.updateUser(user.id, {
        isTwoFactorEnabled: true
      });
      
      // Audit log
      await createAuditLog(req, {
        action: 'enableTwoFactor',
        resourceType: 'user',
        resourceId: user.id.toString(),
        description: `Two-factor authentication enabled for: ${user.username}`
      });
      
      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled successfully'
      });
    }
    
    // If this is login verification, return user and token
    // Get user profile
    const profile = await storage.getUserProfile(user.id);
    
    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });
    
    // Audit log
    await createAuditLog(req, {
      action: 'login',
      resourceType: 'user',
      resourceId: user.id.toString(),
      description: `User logged in with 2FA: ${user.username}`
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      success: true,
      data: {
        ...userWithoutPassword,
        profile
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('Verify two-factor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify two-factor authentication',
      error: error.message
    });
  }
};
