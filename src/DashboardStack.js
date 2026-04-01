import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import LabDashboard from './AfterLogin/Screens/DashboardData/Dashborad';
import Registration from './AfterLogin/Screens/PatientRegistration/Registration';
import UserLoginHistory from './AfterLogin/Screens/Profile/UserLoginHistory';
import Profile from './AfterLogin/Screens/Profile/Profile';
import SearchPatient from './AfterLogin/Screens/PatientRegistration/SearchPatient';
import ListHelpDeskPatient from './AfterLogin/Screens/HelpDesk/ListHelpDeskPatient';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
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

            {/* Dashboard */}
            <Stack.Screen
                name="DashboardHome"
                component={LabDashboard}
                options={({ navigation }) => ({
                    headerTitle: "Dashboard",
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            style={{ marginRight: 15 }}
                        >
                            <MaterialCommunityIcons
                                name="account-circle"
                                size={28}
                                color="#000"
                            />
                        </TouchableOpacity>
                    ),
                })}
            />

            {/* Registration */}
            <Stack.Screen
                name="Registration"
                component={Registration}
                options={{
                    title: 'Patient Registration',
                }}
            />

            {/* Login History */}
            <Stack.Screen
                name="UserLoginHistory"
                component={UserLoginHistory}
                options={{ title: 'Login History' }}
            />

            {/* Profile */}
            <Stack.Screen
                name="Profile"
                component={Profile}
                options={{
                    title: 'My Profile',
                    headerShown: true,
                }}
            />

            {/* ✅ Help Desk (FIXED) */}
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