import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import tw from 'twrnc';

import Login from './src/Login';
import BottomTabNavigation from './src/BottomNavigation';
import Registration from './src/AfterLogin/Screens/PatientRegistration/Registration';
import Profile from './src/AfterLogin/Screens/Profile/Profile';

import { useAuth } from './Authorization/AuthContext';
import ListHelpDeskPatient from './src/AfterLogin/Screens/HelpDesk/ListHelpDeskPatient';
import UserLoginHistory from './src/AfterLogin/Screens/Profile/UserLoginHistory';

const Stack = createNativeStackNavigator();

export default function App() {
  const { token } = useAuth();

  // ✅ Common screen options
  const defaultOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: '#f9fafb' },
    headerTintColor: '#111',
  };

  // ✅ Logged-in screens config
  const appScreens = [
    {
      name: 'Dashboard',
      component: BottomTabNavigation,
      options: { title: 'Dashboard' },
    },
    {
      name: 'Registration',
      component: Registration,
      options: { title: 'Patient Registration' },
    },
    {
      name: 'Profile',
      component: Profile,
      options: { title: 'My Profile' },
    },
    {
      name: 'ListHelpDeskPatient',
      component: ListHelpDeskPatient,
      options: { title: 'Help Desk' },
    },
    {
      name: 'UserLoginHistory',
      component: UserLoginHistory,
      options: { title: 'Help Desk' },
    },
  ];

  // ✅ Auth screens config
  const authScreens = [
    {
      name: 'Login',
      component: Login,
      options: { headerShown: false },
    },
  ];

  return (
    <GestureHandlerRootView style={tw`flex-1 bg-gray-50`}>
      <NavigationContainer>
        <SafeAreaProvider>
          <Stack.Navigator screenOptions={defaultOptions}>
            {(token ? appScreens : authScreens).map((screen, index) => (
              <Stack.Screen
                key={index}
                name={screen.name}
                component={screen.component}
                options={screen.options}
              />
            ))}
          </Stack.Navigator>
        </SafeAreaProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}