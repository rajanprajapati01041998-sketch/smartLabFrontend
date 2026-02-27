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

const Root = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
};

AppRegistry.registerComponent(appName, () => Root);
