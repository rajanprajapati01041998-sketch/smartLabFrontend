import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../Authorization/ThemeContext';

// Screens
import LabDashboard from './AfterLogin/Screens/DashboardData/Dashborad';
import Registration from './AfterLogin/Screens/PatientRegistration/Registration';
import UserLoginHistory from './AfterLogin/Screens/Profile/UserLoginHistory';
import Profile from './AfterLogin/Screens/Profile/Profile';
import SearchPatient from './AfterLogin/Screens/PatientRegistration/SearchPatient';
import DashboardPayment from './AfterLogin/Screens/DashboardData/DashboardPayment';
import DashboardPaymentHistoryDetails from './AfterLogin/Screens/DashboardData/DashboardPaymentHistoryDetails';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
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
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => Alert.alert("click menu")}
                            style={{ marginRight: 15 }}
                        >
                            <MaterialCommunityIcons
                                name="menu"
                                size={28}
                                color={colors.text}
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

            <Stack.Screen
                name="SearchPatient"
                component={SearchPatient}
                options={{ title: 'Search Patient' }}
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
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerTitleStyle: { color: colors.text },
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen
                name="DashboardPayment"
                component={DashboardPayment}
                options={{
                    title: 'Payment',
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="DashboardPaymentHistoryDetails"
                component={DashboardPaymentHistoryDetails}
                options={{
                    title: 'History',
                    headerShown: true,
                }}
            />

        </Stack.Navigator>
    );
}
