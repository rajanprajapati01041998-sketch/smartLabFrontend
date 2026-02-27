import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './src/Login';
import BottomTabNavigation from './src/BottomNavigation';
import Registration from './src/AfterLogin/Screens/PatientRegistration/Registration'
import Profile from './src/AfterLogin/Screens/Profile'
import DrawerNavigation from './src/AfterLogin/Screens/DashBoardHome/DrawerNavigation'
const Stack = createNativeStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {

    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
        }

      } catch (e) {
        console.log("Token error:", e);
      }
      setLoading(false);
    };
    loadToken();
  }, []);


  if (loading) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={token ? "Dashboard" : "Login"} >
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false, title: "Login", }} />
            <Stack.Screen name="Dashboard" component={BottomTabNavigation} options={{ headerShown: true, title: "Dashboard", }} />
            {/* <Stack.Screen name="Dashboard" component={DrawerNavigation} options={{ headerShown: false }}  /> */}
            <Stack.Screen name="Registration" component={Registration} options={{ headerShown: true, title: "New Registartion", }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true, title: "Profile", }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

}