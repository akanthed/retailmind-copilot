import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, confirmSignUp } from '@/lib/auth';

interface User {
  userId: string;
  email: string;
  shopName?: string;
}

interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ isFirstLogin: boolean }>;
  signup: (email: string, password: string, shopName: string) => Promise<void>;
  confirmAccount: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'retailmind_auth_tokens';
const USER_KEY = 'retailmind_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const storedTokens = localStorage.getItem(TOKEN_KEY);
        
        if (storedUser && storedTokens) {
          const parsedUser = JSON.parse(storedUser);
          const parsedTokens = JSON.parse(storedTokens);
          
          // Check if tokens are expired (basic check)
          if (parsedTokens.accessToken) {
            setUser(parsedUser);
          } else {
            // Tokens expired, clear storage
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authResult = await signIn(email, password);
      
      if (!authResult?.AccessToken || !authResult?.IdToken) {
        throw new Error('Invalid authentication response');
      }

      // Decode ID token to get user info (basic JWT decode)
      let idTokenPayload;
      try {
        const base64Url = authResult.IdToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        idTokenPayload = JSON.parse(atob(base64));
      } catch {
        throw new Error('Failed to decode authentication token');
      }
      
      const userData: User = {
        userId: idTokenPayload.sub,
        email: idTokenPayload.email,
        shopName: idTokenPayload['custom:shop_name'],
      };

      const tokens: AuthTokens = {
        accessToken: authResult.AccessToken,
        idToken: authResult.IdToken,
        refreshToken: authResult.RefreshToken || '',
      };

      // Store in localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
      
      setUser(userData);

      // Track user login in DynamoDB
      await trackUserActivity(userData, 'login');
      
      // Check if first-time login (no onboarding completed flag)
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      return { isFirstLogin: !onboardingCompleted };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, shopName: string) => {
    try {
      await signUp(email, password, shopName);
      // User needs to confirm email before they can login
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const confirmAccount = async (email: string, code: string) => {
    try {
      await confirmSignUp(email, code);
    } catch (error) {
      console.error('Confirmation error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // Track user activity in DynamoDB
  const trackUserActivity = async (userData: User, activity: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) return;

      await fetch(`${apiUrl}/users/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          shopName: userData.shopName,
          activity,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to track user activity:', error);
      // Don't throw - tracking is non-critical
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        confirmAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
