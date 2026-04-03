import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Registration from './AfterLogin/Screens/PatientRegistration/Registration';
import SearchPatient from './AfterLogin/Screens/PatientRegistration/SearchPatient';

const Stack = createNativeStackNavigator();

export default function RegistrationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#e6e9ec' },
        headerTintColor: '#111',
        headerShown: true,
        headerBackVisible: true,
        headerBackTitleVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerBackTitle: '',
        headerTitleAlign: 'center',
      }}
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

