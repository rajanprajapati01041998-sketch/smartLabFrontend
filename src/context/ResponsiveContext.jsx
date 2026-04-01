import React, { createContext, useContext, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { createResponsiveHelpers } from '../utils/responsive';

const ResponsiveContext = createContext(null);

/**
 * Wrap the app once (inside SafeAreaProvider) so all screens share one window subscription
 * and the same scaling helpers.
 */
export function ResponsiveProvider({ children }) {
  const { width, height } = useWindowDimensions();

  const value = useMemo(
    () => createResponsiveHelpers(width, height),
    [width, height]
  );

  return (
    <ResponsiveContext.Provider value={value}>{children}</ResponsiveContext.Provider>
  );
}

/**
 * Responsive width/height percentages, font(), spacing(), breakpoints, etc.
 * Must be used under ResponsiveProvider.
 */
export function useResponsive() {
  const ctx = useContext(ResponsiveContext);
  if (!ctx) {
    throw new Error(
      'useResponsive must be used within ResponsiveProvider (wrap your app in App.jsx).'
    );
  }
  return ctx;
}
