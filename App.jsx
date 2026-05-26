import React, {useEffect, useState} from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';

import {useAuth} from './Authorization/AuthContext';
import DashboardDrawer from './src/DashboardDrawer';
import LoginScreen from './src/Login';

import {SafeAreaProvider} from 'react-native-safe-area-context';

import {
  StatusBar,
  PermissionsAndroid,
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {ResponsiveProvider} from './src/context/ResponsiveContext';
import {useTheme} from './Authorization/ThemeContext';
import StartupSplash from './src/StartupSplash';

import useCurrentLocation from './src/utils/locationService';

import {
  getBackgroundLocationEnabled,
  getLiveLocationSession,
} from './src/utils/backgroundLocationPrefs';

import EventSource from 'react-native-sse';
import tw from 'twrnc';
import { API_BASE_URL } from './Authorization/api';
import { getAddressFromLatLng } from './src/utils/patinetService.js/location';

const navigationRef = createNavigationContainerRef();

const SSE_URL = `${API_BASE_URL}Sse/admin-listen`;

const AppContent = () => {
  const { token, latitude, longitude } = useAuth();

  useCurrentLocation({ enabled: true });

  useEffect(() => {
    if (latitude != null && longitude != null) {
      console.log('App location:', latitude, longitude);
    }
  }, [latitude, longitude]);

  return token ? <DashboardDrawer /> : <LoginScreen />;
};

export default function App() {
  const { isLoading, token } = useAuth();
  const { theme, colors } = useTheme();
  const [isStartupSplashVisible, setIsStartupSplashVisible] = useState(true);
  const [sseModalVisible, setSseModalVisible] = useState(false);
  const [sseMessage, setSseMessage] = useState('');
  const [cuurentFieldBoyId, setCurrentFieldBoyId] = useState(null);

  useEffect(() => {
    requestStoragePermission();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStartupSplashVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!token) return;

    console.log('Connecting SSE...');
    const eventSource = new EventSource(SSE_URL);

    eventSource.addEventListener('open', () => {
      console.log('SSE Connected');
    });

    eventSource.addEventListener('message', async event => {
      console.log('SSE message:', event.data);

      try {
        const data = JSON.parse(event.data);

        if (data.type === 'LOCATION_SHARED') {
          let address = 'Address not available';

          try {
            address = await getAddressFromLatLng(
              data.latitude,
              data.longitude,
            );
          } catch (error) {
            console.log('Address Error:', error);
          }
          setCurrentFieldBoyId(data.fieldBoyId);
          setSseMessage(
            `${data.message || 'Location shared'}

            FieldBoy ID: ${data.fieldBoyId || '-'}

            Address: ${address}

            Latitude: ${data.latitude || '-'}

            Longitude: ${data.longitude || '-'}`,
          );

          setSseModalVisible(true);
        }

        if (data.type === 'FIELD_BOY_LIVE') {
          setSseMessage(
            `${data.message || 'Field boy is live'}

FieldBoy ID: ${data.fieldBoyId || '-'}`,
          );

          setSseModalVisible(true);
        }

        if (data.type === 'TEST_MESSAGE') {
          setSseMessage(data.message || 'New message received');
          setSseModalVisible(true);
        }
      } catch (error) {
        console.log('SSE Parse Error:', error);
      }
    });

    eventSource.addEventListener('error', error => {
      console.log('SSE Error:', error);
    });

    return () => {
      console.log('SSE Closed');
      eventSource.close();
    };
  }, [token]);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission granted');
        } else {
          console.log('Storage permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleMapNaviagtion = () => {
    console.log('Navigating to map for FieldBoy ID:', cuurentFieldBoyId);
    if (!navigationRef.isReady()) return;

    navigationRef.navigate('MainTabs', {
      screen: 'Dashboard',
      params: {
        screen: 'Track Location',
        params: {
          fieldBoyId: cuurentFieldBoyId,
        },
      },
    });

    setSseModalVisible(false);
  };

  if (isStartupSplashVisible || isLoading) {
    return (
      <SafeAreaProvider>
        <ResponsiveProvider>
          <StatusBar
            barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme === 'dark' ? colors.surface : '#ffffff'}
          />

          <StartupSplash />
        </ResponsiveProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ResponsiveProvider>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? colors.surface : '#ffffff'}
        />

        <NavigationContainer
          ref={navigationRef}
          onReady={async () => {
            try {
              if (!token) return;

              const bgEnabled = await getBackgroundLocationEnabled();
              const session = await getLiveLocationSession();

              if (session?.active && session?.sampleId != null) {
                navigationRef.navigate('MainTabs', {
                  screen: 'Dashboard',
                  params: {
                    screen: 'FlaboShareLiveLocation',
                    params: {
                      id: session.sampleId,
                    },
                  },
                });
              } else if (bgEnabled) {
                navigationRef.navigate('MainTabs', {
                  screen: 'Dashboard',
                  params: {
                    screen: 'UpdateSampleStatus',
                  },
                });
              }
            } catch (error) {
              console.log(error);
            }
          }}
          theme={{
            ...(theme === 'dark' ? DarkTheme : DefaultTheme),
            colors: {
              ...((theme === 'dark' ? DarkTheme : DefaultTheme).colors),
              background: colors.background,
              card: colors.surface,
              border: colors.border,
              text: colors.text,
              primary: colors.primary,
            },
          }}>
          <AppContent />
        </NavigationContainer>

        <Modal
          visible={sseModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSseModalVisible(false)}>
          <View style={tw`flex-1 bg-black/50 justify-center items-center px-6`}>
            <View style={tw`bg-white rounded-3xl p-5 w-full`}>
              <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>
                Admin Notification
              </Text>

              <Text style={tw`text-gray-700 mb-5 leading-6`}>
                {sseMessage}
              </Text>

              <View style={tw`flex-row justify-center gap-2`}>
                <TouchableOpacity
                  onPress={() => setSseModalVisible(false)}
                  style={tw`bg-blue-600 py-3 rounded-xl flex-1`}>
                  <Text style={tw`text-white text-center font-bold`}>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMapNaviagtion()}
                  style={tw`bg-blue-600 py-3 rounded-xl flex-1`}>
                  <Text style={tw`text-white text-center font-bold`}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ResponsiveProvider>
    </SafeAreaProvider>
  );
}
