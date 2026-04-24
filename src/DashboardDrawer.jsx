import React from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../Authorization/ThemeContext';
import { useAuth } from '../Authorization/AuthContext';
import DashboardStack from './DashboardStack';

const Drawer = createDrawerNavigator();

function DashboardDrawerContent(props) {
  const { colors } = useTheme();
  const { logout } = useAuth();

  const goTo = (screenName) => {
    props.navigation.navigate('DashboardStack', { screen: screenName });
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          Menu
        </Text>
        <Text style={{ color: colors.text, opacity: 0.7, marginTop: 4 }}>
          Quick actions
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.8 }} />


      <DrawerItem
        label="Patient Information"
        labelStyle={{ color: colors.text }}
        icon={({ size }) => (
          <MaterialCommunityIcons name="account-search" size={size} color={colors.text} />
        )}
        onPress={() => goTo('PatientInformation')}
      />

      <DrawerItem
        label="Payment"
        labelStyle={{ color: colors.text }}
        icon={({ size }) => (
          <MaterialCommunityIcons name="credit-card" size={size} color={colors.text} />
        )}
        onPress={() => goTo('DashboardPayment')}
      />

      

      

      <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.8, marginTop: 8 }} />

      
    </DrawerContentScrollView>
  );
}

export default function DashboardDrawer() {
  const { theme, colors } = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.surface, width: 280 },
        sceneContainerStyle: { backgroundColor: colors.background },
        overlayColor: theme === 'dark' ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)',
      }}
      drawerContent={(props) => <DashboardDrawerContent {...props} />}
    >
      <Drawer.Screen name="DashboardStack" component={DashboardStack} />
    </Drawer.Navigator>
  );
}

