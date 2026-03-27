import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './Authorization/AuthContext';
import BottomTabNavigation from './src/BottomNavigation';
import LoginScreen from './src/Login';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import tw from 'twrnc'



export default function App() {
  const { token } = useAuth();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? <BottomTabNavigation /> : <LoginScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}