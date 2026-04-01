import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './Authorization/AuthContext';
import BottomTabNavigation from './src/BottomNavigation';
import LoginScreen from './src/Login';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, PermissionsAndroid, Platform } from 'react-native';
import { ResponsiveProvider } from './src/context/ResponsiveContext';

export default function App() {
  const { token } = useAuth();

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
          barStyle="dark-content"
          backgroundColor="#ffffff"
        />
        <NavigationContainer>
          {token ? <BottomTabNavigation /> : <LoginScreen />}
        </NavigationContainer>
      </ResponsiveProvider>
    </SafeAreaProvider>
  );
}