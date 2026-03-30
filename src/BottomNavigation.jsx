import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import DashboardStack from './DashboardStack';
import HelpDeskHome from './AfterLogin/Screens/HelpDesk/HelpDeskHome';
import Registration from './AfterLogin/Screens/PatientRegistration/Registration';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigation() {
  const insets = useSafeAreaInsets();

  const baseTabBarStyle = {
    position: 'absolute',
    left: 5,
    right: 5,
    height: 55 + insets.bottom,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 2,
    backgroundColor: '#d5d2d2',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, focused }) => {
          let iconName;

          if (route.name === 'Dashboard') iconName = 'view-dashboard';
          else if (route.name === 'HelpDesk') iconName = 'bell';
          else if (route.name === 'Registration') iconName = 'account-plus'; // ✅ ADD THIS

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={focused ? 26 : 22}
              color={color}
            />
          );
        },

        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#777',

        tabBarStyle: baseTabBarStyle,

        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={({ route }) => {
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? 'DashboardHome';

          const hideOnScreens = ['ListHelpDeskPatient', 'Profile', 'UserLoginHistory'];

          return {
            tabBarStyle: [
              baseTabBarStyle,
              { display: hideOnScreens.includes(routeName) ? 'none' : 'flex' },
            ],
          };
        }}
      />
      <Tab.Screen
        name="Registration"
        component={Registration}
      />

      <Tab.Screen
        name="HelpDesk"
        component={HelpDeskHome}
      />
    </Tab.Navigator>
  );
}
