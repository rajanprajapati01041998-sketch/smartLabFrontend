import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation, Provider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import DashBoard from './AfterLogin/Screens/DashboardData/Dashborad';
import HelpDeskHome from './AfterLogin/Screens/HelpDesk/HelpDeskHome';



export default function BottomTabNavigation({ navigation }) {
    const [index, setIndex] = useState(0);

    // ✅ Clean route keys (no spaces, lowercase)
    const routes = [
        { key: 'dashboard', title: 'Dashboard', icon: 'view-dashboard' },
        { key: 'registration', title: 'Registration', icon: 'account-plus' },
        { key: 'helpdesk', title: 'Help Desk', icon: 'bell' },
    ];

    // ✅ Update header title dynamically
    useEffect(() => {
        const currentRoute = routes[index];

        let title = '';

        switch (currentRoute.key) {
            case 'dashboard':
                title = 'Dashboard';
                break;
            case 'helpdesk':
                title = 'Help Desk';
                break;
            default:
                title = 'Dashboard';
        }

        navigation.setOptions({ title });

    }, [index]);

    // ✅ Render tab screens
    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'dashboard':
                return <DashBoard navigation={navigation} />;
            case 'helpdesk':
                return <HelpDeskHome navigation={navigation} />;
            default:
                return <DashBoard navigation={navigation} />;
        }
    };

    return (
        <Provider>
            <View style={{ flex: 1 }}>
                {renderScene({ route: routes[index] })}

                <BottomNavigation.Bar
                    navigationState={{ index, routes }}

                    onTabPress={({ route }) => {
                        if (route.key === 'registration') {
                            // 👉 Navigate to Stack Screen
                            navigation.navigate('Registration');
                        } else {
                            const newIndex = routes.findIndex(
                                r => r.key === route.key
                            );
                            setIndex(newIndex);
                        }
                    }}

                    renderIcon={({ route, color }) => (
                        <MaterialCommunityIcons
                            name={route.icon}
                            size={24}
                            color={color}
                        />
                    )}

                    getLabelText={({ route }) => route.title}

                    style={styles.bottomBar}
                />
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#99a9ce',
    },
    bottomBar: {
        backgroundColor: '#aecddd',
        // borderTopLeftRadius: 25,
        // borderTopRightRadius: 25,
        height: 70,
        elevation: 10,
    },
});