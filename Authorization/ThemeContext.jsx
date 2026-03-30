import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import tw from 'twrnc';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const theme = useColorScheme() || 'light';

  useEffect(() => {
    tw.setColorScheme(theme);
  }, [theme]);

  const colors = {
    placeholder: theme === 'dark' ? '#d3d5d8' : '#c5c8d0',
    text: theme === 'dark' ? '#FFFFFF' : '#000000',
    background: theme === 'dark' ? '#111827' : '#FFFFFF',
    border: theme === 'dark' ? '#374151' : '#E5E7EB',
  };

  return (
    <ThemeContext.Provider value={{ theme, colors }}>
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