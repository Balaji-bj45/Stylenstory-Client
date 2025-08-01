import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus, setAuthToken, logoutUser } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          const { data } = await checkAuthStatus();
          setIsLoggedIn(true);
          // Combine first and last name for display
          const userWithFullName = {
            ...data.user,
            name: `${data.user.firstName} ${data.user.lastName}`
          };
          setUser(userWithFullName);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (token, userData) => {
    try {
      localStorage.setItem('authToken', token);
      // Combine first and last name for display
      const userWithFullName = {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`
      };
      localStorage.setItem('userData', JSON.stringify(userWithFullName));
      setAuthToken(token);
      setIsLoggedIn(true);
      setUser(userWithFullName);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout API error:', error);
      toast.error('Logout failed');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setAuthToken(null);
      setIsLoggedIn(false);
      setUser(null);
      navigate('/auth');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}