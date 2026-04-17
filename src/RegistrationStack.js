import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../Authorization/ThemeContext';

import Registration from './AfterLogin/Screens/PatientRegistration/Registration';
import SearchPatient from './AfterLogin/Screens/PatientRegistration/SearchPatient';

const Stack = createNativeStackNavigator();

export default function RegistrationStack() {
  const { theme, colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={() => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        headerShown: true,
        headerBackVisible: true,
        headerBackTitleVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerBackTitle: '',
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: colors.background },
      })}
    >
      <Stack.Screen
        name="RegistrationHome"
        component={Registration}
        options={{ title: 'Patient Registration', headerShown: false }}
      />
      <Stack.Screen
        name="SearchPatient"
        component={SearchPatient}
        options={{ title: 'Search Patient' }}
      />
    </Stack.Navigator>
  );
}
