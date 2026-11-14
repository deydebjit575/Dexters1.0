import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getAuthToken());
  const [loading, setLoading] = useState(true);
  const [activeUniverse, setActiveUniverse] = useState(null);
  const [universes, setUniverses] = useState([]);
  const [toast, setToast] = useState(null);

  // Show Toast Alert helper
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Fetch current user and universes
  const loadUserAndUniverses = useCallback(async () => {
    const existingToken = getAuthToken();
    if (!existingToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { user: userData } = await api.getMe();
      setUser(userData);

      // Load universes for active picker
      const unis = await api.getUniverses('my');
      setUniverses(unis);
      if (unis.length > 0) {
        // Retain saved active universe if still valid
        const savedId = localStorage.getItem('storyverse_active_uni_id');
        const found = unis.find(u => u.id === savedId) || unis[0];
        setActiveUniverse(found);
        localStorage.setItem('storyverse_active_uni_id', found.id);
      }
    } catch (err) {
      console.warn('Auth token expired or invalid:', err.message);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserAndUniverses();
  }, [loadUserAndUniverses]);

  // Refresh Universes
  const refreshUniverses = useCallback(async (preferredSelectId) => {
    try {
      const unis = await api.getUniverses('my');
      setUniverses(unis);
      if (unis.length > 0) {
        const toSelect = unis.find(u => u.id === preferredSelectId) ||
                         (activeUniverse && unis.find(u => u.id === activeUniverse.id)) ||
                         unis[0];
        setActiveUniverse(toSelect);
        localStorage.setItem('storyverse_active_uni_id', toSelect.id);
      } else {
        setActiveUniverse(null);
      }
      return unis;
    } catch (e) {
      console.error('Error refreshing universes:', e);
    }
  }, [activeUniverse]);

  const selectUniverse = (uni) => {
    setActiveUniverse(uni);
    if (uni?.id) {
      localStorage.setItem('storyverse_active_uni_id', uni.id);
      showToast(`Switched universe context to: "${uni.name}"`, 'info');
    }
  };

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUniverses();
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    return data.user;
  };

  const register = async (name, email, password, penName) => {
    const data = await api.register({ name, email, password, penName });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUniverses();
    showToast('Account created! Welcome to StoryVerse AI.', 'success');
    return data.user;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setActiveUniverse(null);
    localStorage.removeItem('storyverse_active_uni_id');
    showToast('You have been logged out.', 'info');
  };

  const updateCreditsLocally = (remainingCredits) => {
    setUser(prev => prev ? { ...prev, credits: remainingCredits } : null);
  };

  const updateProfileLocally = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeUniverse,
        universes,
        selectUniverse,
        refreshUniverses,
        login,
        register,
        logout,
        updateCreditsLocally,
        updateProfileLocally,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
