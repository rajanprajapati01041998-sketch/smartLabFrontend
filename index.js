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
import { Root as PopupRootProvider } from '@sekizlipenguen/react-native-popup-confirm-toast';
import { store } from './src/Redux/store'
import { Provider } from 'react-redux'


const Root = () => {
  return (
    <Provider store={store}>
      <PopupRootProvider>
        <AuthProvider>
          <DashProvider>
            <ToastProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </ToastProvider>
          </DashProvider>
        </AuthProvider>
      </PopupRootProvider>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Root);
