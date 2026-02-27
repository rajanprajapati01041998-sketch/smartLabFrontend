import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation, Provider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DashBoard from './AfterLogin/Screens/Dashborad';


function PatientListScreen() {
    return <View style={styles.screen} />;
}

function NotificationScreen() {
    return <View style={styles.screen} />;
}
export default function BottomTabNavigation({ navigation }) {
    const [index, setIndex] = useState(0);
    const routes = [
        { key: 'dashboard', title: 'Dashboard', icon: 'view-dashboard' },
        { key: 'registration', title: 'Registration', icon: 'account-plus' },
        { key: 'patient', title: 'Patient List', icon: 'account-group' },
        { key: 'notification', title: 'Notification', icon: 'bell' },

    ];

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'dashboard':
                return <DashBoard navigation={navigation} />;
            case 'patient':
                return <PatientListScreen />;
            case 'notification':
                return <NotificationScreen />;
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
                            navigation.navigate("Registration");
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
        backgroundColor: '#ffffff'
    },
    bottomBar: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: 80,
        elevation: 10,
    },

});