/**
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { AuthProvider } from './Authorization/AuthContext';
import { ThemeProvider } from './Authorization/ThemeContext';
import { ToastProvider } from './Authorization/ToastContext';
import { DashProvider } from './Authorization/DashContext';

const Root = () => {
  return (
    <AuthProvider>
      <DashProvider>
        <ToastProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ToastProvider>
      </DashProvider>
    </AuthProvider>
  );
};

AppRegistry.registerComponent(appName, () => Root);
