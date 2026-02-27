import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    TextInput
} from 'react-native';

import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import tw from 'twrnc';
import Dashboard from '../Dashborad';
import Profile from '../Profile';
import Registration from '../PatientRegistration/Registration';
import PatientInformation from '../PatientRegistration/PatinetInformation';
import ColorMaster from '../../ColorMaster';
import ReportDispatch from '../PatientRegistration/ReportDispatch';
import DiscountAfterRegistration from '../PatientRegistration/DiscountAfterRegistration'
import TestRefund from '../PatientRegistration/TestRefund';
import OPDSettlement from '../PatientRegistration/OPDSettlement'
import ChangeSampleStatus from '../PatientRegistration/ChangeSampleStatus'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../../Authorization/ThemeContext';
import { Searchbar } from 'react-native-paper';


const Drawer = createDrawerNavigator();

const CustomDrawer = ({ navigation }) => {
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    // Menu Configuration
    const menus = [
        {
            title: 'Dashboard',
            iconImage: `https://cdn-icons-png.flaticon.com/128/15135/15135113.png`,
            screen: 'Dashboard',
        },
        {
            title: 'Patient Registration',
            iconImage: `https://cdn-icons-png.flaticon.com/128/2854/2854545.png`,
            children: [
                {
                    title: 'Registration',
                    iconImage: 'https://cdn-icons-png.flaticon.com/128/15090/15090884.png',
                    screen: 'Registration'
                },
                {
                    title: 'Patient Information',
                    iconImage: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
                    screen: 'PatientInformation'
                },
                {
                    title: 'Report Dispatch',
                    iconImage: 'https://cdn-icons-png.flaticon.com/128/3029/3029337.png',
                    screen: 'ReportDispatch'
                },
                {
                    title: 'Discount After Registration',
                    iconImage: 'https://cdn-icons-png.flaticon.com/128/13052/13052775.png',
                    screen: 'DiscountAfterRegistration'
                },
                {
                    title: 'Test Refund',
                    iconImage: 'https://cdn-icons-png.flaticon.com/128/10918/10918722.png',
                    screen: 'TestRefund'
                },
                {
                    title: 'OPD Settlement',
                    iconImage: 'https://cdn-icons-png.flaticon.com/128/4115/4115695.png',
                    screen: 'OPDSettlement'
                },
                 {
                    title: 'Change Sample Status',
                    iconImage: 'https://cdn-icons-png.flaticon.com/128/13855/13855580.png',
                    screen: 'ChangeSampleStatus'
                },
            ]
        },
        {
            title: 'Color Master',
            iconImage: `https://cdn-icons-png.flaticon.com/128/4738/4738995.png`,
            screen: 'ColorMaster',
        },
        {
            title: 'Profile',
            iconImage: `https://cdn-icons-png.flaticon.com/128/9131/9131529.png`,
            screen: 'Profile',
        },
    ];

    // FILTER LOGIC
    const filteredMenus = menus
        .map(menu => {

            // Main menu match
            if (menu.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return menu;
            }

            // Submenu match
            if (menu.children) {

                const filteredChildren = menu.children.filter(child =>
                    child.title.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredChildren.length > 0) {
                    return {
                        ...menu,
                        children: filteredChildren
                    };
                }
            }

            return null;
        })
        .filter(Boolean);

    // ICON RENDER
    const renderIcon = (iconImage) => {
        return (
            <Image
                source={{ uri: iconImage }}
                style={tw`h-5 w-5`}
                resizeMode="contain"
            />
        );

    };


    return (

        <DrawerContentScrollView style={styles.container}>

            {/* SEARCH BAR */}
            <Searchbar
                placeholder="Search menu..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                    margin: 10,
                    elevation: 2
                }}
            />
            {/* NO RESULT */}
            {filteredMenus.length === 0 && (
                <Text style={{
                    padding: 20,
                    color: '#999',
                    textAlign: 'center'
                }}>
                    No menu found
                </Text>

            )}


            {/* MENU LIST */}
            {filteredMenus.map((menu, index) => {
                const isExpanded =
                    expandedMenu === menu.title ||
                    (searchQuery.length > 0 && menu.children);

                const isActive = activeItem === menu.title;

                return (

                    <View key={index}>
                        {/* MAIN MENU */}
                        <TouchableOpacity
                            style={[
                                styles.menuItem,
                                isActive && styles.activeItem
                            ]}
                            onPress={() => {
                                if (menu.children) {
                                    setExpandedMenu(
                                        isExpanded ? null : menu.title
                                    );

                                } else {

                                    navigation.navigate(menu.screen);
                                    setActiveItem(menu.title);
                                }
                            }}
                        >

                            {renderIcon(menu.iconImage)}
                            <Text style={styles.menuText}>
                                {menu.title}
                            </Text>

                            {menu.children && (
                                <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={20} color="#777" style={{ marginLeft: 'auto' }} />

                            )}

                        </TouchableOpacity>


                        {/* SUB MENU */}
                        {menu.children && isExpanded && (
                            <View style={styles.subMenuContainer}>
                                {menu.children.map((sub, subIndex) => {
                                    const subActive =
                                        activeItem === sub.title;
                                    return (
                                        <TouchableOpacity
                                            key={subIndex}
                                            style={[styles.subMenuItem, subActive && styles.activeItem]}
                                            onPress={() => {
                                                navigation.navigate(sub.screen);
                                                setActiveItem(sub.title);
                                            }}>
                                            {/* <Entypo  name={sub.icon} size={16} color="#666"  /> */}
                                            <Image source={{ uri: sub.iconImage }} style={tw`h-5 w-5`} />
                                            <Text style={styles.subMenuText}>{sub.title} </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                );
            })}

        </DrawerContentScrollView>

    );

};

// Main Navigator
export default function DrawerNavigator() {
    const { setHeaderBackground, headerBackground } = useTheme()


    useEffect(() => {
        console.log("Current Header Color:", headerBackground); // Debug log

    }, [headerBackground]);
    const logoutButton = (navigation) => (

        <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => {

                Alert.alert(
                    "Logout",
                    "Do you want to logout?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Logout",
                            onPress: () =>
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                })
                        }
                    ]
                );

            }}
        >
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/128/4033/4033019.png' }}
                style={{ width: 22, height: 22 }}
            />
        </TouchableOpacity>

    );


    return (

        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: headerBackground
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: '600'
                }
            }}
        >

            <Drawer.Screen
                name="Dashboard"
                component={Dashboard}
                options={{ title: 'Dashboard' }}
            />

            <Drawer.Screen
                name="Registration"
                component={Registration}
                options={{ title: 'Registration' }}
            />

            <Drawer.Screen
                name="PatientInformation"
                component={PatientInformation}
                options={{ title: 'Patient Information' }}
            />

            <Drawer.Screen
                name="ColorMaster"
                component={ColorMaster}
                options={{ title: 'Color Master' }}
            />
            <Drawer.Screen
                name="ReportDispatch"
                component={ReportDispatch}
                options={{ title: 'Report Dispatch' }}
            />
            <Drawer.Screen
                name="DiscountAfterRegistration"
                component={DiscountAfterRegistration}
                options={{ title: 'Receipt Wise OPD Discount' }}
            />
            <Drawer.Screen
                name="TestRefund"
                component={TestRefund}
                options={{ title: 'Test Refund' }}
            />
            <Drawer.Screen
                name="OPDSettlement"
                component={OPDSettlement}
                options={{ title: 'OPD Settlement' }}
            />
            <Drawer.Screen
                name="ChangeSampleStatus"
                component={ChangeSampleStatus}
                options={{ title: 'Change Sample Status' }}
            />


            <Drawer.Screen
                name="Profile"
                component={Profile}
                options={({ navigation }) => ({
                    title: 'Profile',
                    headerRight: () => logoutButton(navigation)
                })}
            />

        </Drawer.Navigator>

    );
}
// Styles
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

    searchInput: {
        margin: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 14
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18
    },

    menuText: {
        fontSize: 15,
        marginLeft: 15,
        color: '#333',
        fontWeight: '500'
    },

    subMenuContainer: {
        paddingLeft: 40,
        backgroundColor: '#f8fafc'
    },

    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12
    },

    subMenuText: {
        fontSize: 14,
        marginLeft: 12,
        color: '#555'
    },

    activeItem: {
        backgroundColor: '#e0edff',
        borderRadius: 6
    }

});
