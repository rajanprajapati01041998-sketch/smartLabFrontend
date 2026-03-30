import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HelpDeskHome from './AfterLogin/Screens/HelpDesk/HelpDeskHome';
import ListHelpDeskPatient from './AfterLogin/Screens/HelpDesk/ListHelpDeskPatient';

const Stack = createNativeStackNavigator();

export default function HelpDeskStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#e6e9ec' },
        headerTintColor: '#111',
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="HelpDeskHome"
        component={HelpDeskHome}
        options={{
          title: 'Help desk',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListHelpDeskPatient"
        component={ListHelpDeskPatient}
        options={{
          title: 'Help desk',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

