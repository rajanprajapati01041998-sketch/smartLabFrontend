import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useAuth } from './Authorization/AuthContext';
import DashboardDrawer from './src/DashboardDrawer';
import LoginScreen from './src/Login';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, PermissionsAndroid, Platform } from 'react-native';
import { ResponsiveProvider } from './src/context/ResponsiveContext';
import { useTheme } from './Authorization/ThemeContext';

export default function App() {
  const { token } = useAuth();
  const { theme, colors } = useTheme();

  useEffect(() => {
    requestStoragePermission();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Storage permission granted");
        } else {
          console.log("Storage permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <ResponsiveProvider>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? colors.surface : '#ffffff'}
        />
        <NavigationContainer
          theme={{
            ...(theme === 'dark' ? DarkTheme : DefaultTheme),
            colors: {
              ...((theme === 'dark' ? DarkTheme : DefaultTheme).colors),
              background: colors.background,
              card: colors.surface,
              border: colors.border,
              text: colors.text,
              primary: colors.primary,
            },
          }}
        >
          {token ? <DashboardDrawer /> : <LoginScreen />}
        </NavigationContainer>
      </ResponsiveProvider>
    </SafeAreaProvider>
  );
}
