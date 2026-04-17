import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

const ThemeContext = createContext();

const STORAGE_KEY_THEME_MODE = 'theme_mode'; // 'system' | 'light' | 'dark'

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme() || 'light';
  const [themeMode, setThemeMode] = useState('system');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_THEME_MODE);
        if (!isMounted) return;

        // ✅ force only light/dark
        if (saved === 'light' || saved === 'dark') {
          setThemeMode(saved);
        } else {
          setThemeMode('light');
        }
      } catch {
        setThemeMode('light');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_THEME_MODE, themeMode);
      } catch {
        // ignore storage errors
      }
    })();
  }, [themeMode]);

  // ✅ only light/dark
  const theme = themeMode === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    tw.setColorScheme(theme);
  }, [theme]);

  const colors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      placeholder: isDark ? '#9CA3AF' : '#6B7280',
      text: isDark ? '#F9FAFB' : '#111827',
      textMuted: isDark ? '#9CA3AF' : '#6B7280',
      background: isDark ? '#212e47' : '#F3F4F6',
      surface: isDark ? '#1b2436' : '#f0f0f0',
      card: isDark ? '#111827' : '#FFFFFF',
      border: isDark ? '#374151' : '#E5E7EB',
      primary: '#3B82F6',
      danger: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    };
  }, [theme]);

  // ✅ only toggle dark <-> light
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};