import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  phone?: string;
  role: string;
  addresses: any[];
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const getRedirectUrl = () => {
    if (Platform.OS === 'web') {
      return `${BACKEND_URL}/`;
    }
    return Linking.createURL('/');
  };

  const exchangeSessionId = async (sessionId: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/session`,
        { session_id: sessionId },
        { headers: { 'X-Session-ID': sessionId } }
      );
      
      const { session_token, user: userData } = response.data;
      
      await AsyncStorage.setItem('session_token', session_token);
      setSessionToken(session_token);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Session exchange error:', error);
      return false;
    }
  };

  const extractSessionId = (url: string): string | null => {
    if (!url) return null;
    
    // Check hash fragment
    const hashMatch = url.match(/#session_id=([^&]+)/);
    if (hashMatch) return hashMatch[1];
    
    // Check query params
    const queryMatch = url.match(/[?&]session_id=([^&]+)/);
    if (queryMatch) return queryMatch[1];
    
    return null;
  };

  const checkExistingSession = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      setSessionToken(token);
      
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Session check error:', error);
      await AsyncStorage.removeItem('session_token');
      setSessionToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectUrl = async (url: string) => {
    const sessionId = extractSessionId(url);
    if (sessionId) {
      setIsLoading(true);
      await exchangeSessionId(sessionId);
      setIsLoading(false);
      
      // Clear URL fragment on web
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      // Check for session_id in URL first (web)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        const search = window.location.search;
        const sessionId = extractSessionId(hash) || extractSessionId(search);
        
        if (sessionId) {
          await exchangeSessionId(sessionId);
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        }
      }
      
      // Check for initial URL (mobile cold start)
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const sessionId = extractSessionId(initialUrl);
        if (sessionId) {
          await exchangeSessionId(sessionId);
          setIsLoading(false);
          return;
        }
      }
      
      // Check existing session
      await checkExistingSession();
    };
    
    init();
    
    // Listen for URL changes (mobile hot link)
    const subscription = Linking.addEventListener('url', (event) => {
      handleRedirectUrl(event.url);
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  const login = async () => {
    try {
      const redirectUrl = getRedirectUrl();
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          await handleRedirectUrl(result.url);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await axios.post(
          `${BACKEND_URL}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${sessionToken}` } }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('session_token');
      setSessionToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!sessionToken) return;
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
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
