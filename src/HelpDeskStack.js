import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HelpDeskHome from './AfterLogin/Screens/HelpDesk/HelpDeskHome';
import ListHelpDeskPatient from './AfterLogin/Screens/HelpDesk/ListHelpDeskPatient';
import ViewLabReport from './AfterLogin/Screens/HelpDesk/ViewLabReport';
import ViewTebularReport from './AfterLogin/Screens/HelpDesk/ViewTebularReport';
import { useTheme } from '../Authorization/ThemeContext';

const Stack = createNativeStackNavigator();

export default function HelpDeskStack() {
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

      <Stack.Screen
        name="ViewLabReport"
        component={ViewLabReport}
        options={{
          title: 'Report',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ViewTebularReport"
        component={ViewTebularReport}
        options={{
          title: 'Report',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
