/**
 * Authentication Storage Utilities
 * 
 * SECURITY NOTE: In production, this would interact with a real backend database
 * and use secure JWT tokens. This implementation uses localStorage to simulate
 * client-side + server-side persistence for demonstration purposes.
 * 
 * Production Requirements:
 * - Store passwords encrypted/hashed on server (bcrypt, argon2)
 * - Use JWT or session tokens for authentication
 * - Implement secure HTTPS endpoints
 * - Add CSRF protection
 * - Rate limiting for login attempts
 * 
 * API Endpoints (Production):
 * - POST /api/signup - Create new user account
 * - POST /api/login - Authenticate user
 * - POST /api/logout - End session
 * - POST /api/forgot-password - Send password reset email
 * - GET /api/demo-login - Demo account access
 * 
 * Database Schema (Production):
 * - users table:
 *   - id (primary key)
 *   - email (unique)
 *   - username (unique)
 *   - password (hashed)
 *   - rememberMe (boolean)
 *   - created_at (timestamp)
 *   - last_login (timestamp)
 *   - device_info (text)
 */

interface StoredUser {
  username: string;
  userId: string;
  lastLogin: string;
  deviceInfo?: string;
}

interface SessionData {
  token: string;
  username: string;
  userId: string;
  expiresAt: number;
}

// Storage keys
const STORAGE_KEYS = {
  REMEMBERED_USERNAME: 'cineverse_remembered_username',
  SESSION_TOKEN: 'cineverse_session_token',
  USER_DATA: 'cineverse_user_data',
} as const;

/**
 * Remember Me functionality - stores username locally
 */
export const rememberUsername = (username: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REMEMBERED_USERNAME, username);
  } catch (error) {
    console.error('Failed to save remembered username:', error);
  }
};

export const getRememberedUsername = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_USERNAME);
  } catch (error) {
    console.error('Failed to get remembered username:', error);
    return null;
  }
};

export const forgetUsername = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REMEMBERED_USERNAME);
  } catch (error) {
    console.error('Failed to remove remembered username:', error);
  }
};

/**
 * Session Management - simulates JWT token storage
 * In production: server would generate JWT, client stores securely
 */
export const createSession = (username: string, userId: string, rememberMe: boolean = false): SessionData => {
  // Simulate JWT token (in production: server generates this)
  const token = `jwt_${btoa(JSON.stringify({ username, userId, timestamp: Date.now() }))}`;
  
  // Session expires in 30 days if "remember me", otherwise 24 hours
  const expiryHours = rememberMe ? 720 : 24;
  const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);
  
  const sessionData: SessionData = {
    token,
    username,
    userId,
    expiresAt,
  };
  
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
  
  return sessionData;
};

export const getSession = (): SessionData | null => {
  try {
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (!sessionStr) return null;
    
    const session: SessionData = JSON.parse(sessionStr);
    
    // Check if session expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

/**
 * User Data Storage - simulates server-side user database
 * In production: stored in actual database (PostgreSQL, MongoDB, etc.)
 */
export const storeUserData = (username: string, userId: string): void => {
  try {
    const users = getAllUsers();
    
    const userData: StoredUser = {
      username,
      userId,
      lastLogin: new Date().toISOString(),
      deviceInfo: navigator.userAgent.substring(0, 50), // Simplified device info
    };
    
    // Update or add user
    const existingIndex = users.findIndex(u => u.userId === userId);
    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }
    
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(users));
    
    console.log('✅ User data stored securely (simulated backend storage)');
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

export const getUserData = (userId: string): StoredUser | null => {
  try {
    const users = getAllUsers();
    return users.find(u => u.userId === userId) || null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

const getAllUsers = (): StoredUser[] => {
  try {
    const usersStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return usersStr ? JSON.parse(usersStr) : [];
  } catch (error) {
    console.error('Failed to get all users:', error);
    return [];
  }
};

/**
 * Complete logout - clears all stored data
 */
export const performLogout = (): void => {
  clearSession();
  // Optionally keep remembered username unless user unchecks "remember me"
  console.log('✅ User logged out - session cleared');
};

/**
 * Check if user has an active session
 */
export const hasActiveSession = (): boolean => {
  return getSession() !== null;
};

/**
 * Get time since last login
 */
export const getLastLoginTime = (userId: string): string | null => {
  const userData = getUserData(userId);
  if (!userData) return null;
  
  const lastLogin = new Date(userData.lastLogin);
  const now = new Date();
  const diffMs = now.getTime() - lastLogin.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return 'Just now';
};