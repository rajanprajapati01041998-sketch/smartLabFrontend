import React, { useEffect, useState, useRef } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';

import { useAuth } from './Authorization/AuthContext';
import DashboardDrawer from './src/DashboardDrawer';
import LoginScreen from './src/Login';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  StatusBar,
  PermissionsAndroid,
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';

import { ResponsiveProvider } from './src/context/ResponsiveContext';
import { useTheme } from './Authorization/ThemeContext';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

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
  const [sseTitle, setSseTitle] = useState('');
  const [sseType, setSseType] = useState('');

  const [currentFieldBoyId, setCurrentFieldBoyId] = useState(null);
  const [currentFieldBoyName, setCurrentFieldBoyName] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(slideAnim, {
      toValue: sseModalVisible ? 1 : 0,
      duration: sseModalVisible ? 300 : 250,
      useNativeDriver: true,
    }).start();
  }, [sseModalVisible, slideAnim]);

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
            address = await getAddressFromLatLng(data.latitude, data.longitude);
          } catch (error) {
            console.log('Address Error:', error);
          }

          const fieldBoyId = data.fieldBoyId || data.FieldBoyId || null;
          const fieldBoyName =
            data.fieldBoyName || data.FieldBoyName || data.name || '';

          setCurrentFieldBoyId(fieldBoyId);
          setCurrentFieldBoyName(fieldBoyName);

          setSseTitle('📍 Location Update');
          setSseType('location');
          setSseMessage(
            `${data.message || 'Location shared'}\n\n` +
              `Field Boy Name: ${fieldBoyName || '-'}\n\n` +
              `Field Boy ID: ${fieldBoyId || '-'}\n\n` +
              `Address: ${address}\n\n` +
              `Latitude: ${data.latitude || data.Latitude || '-'}\n\n` +
              `Longitude: ${data.longitude || data.Longitude || '-'}`,
          );

          setSseModalVisible(true);
        }

        if (data.type === 'FIELD_BOY_LIVE') {
          const fieldBoyId = data.fieldBoyId || data.FieldBoyId || null;
          const fieldBoyName =
            data.fieldBoyName ||
            data.FieldBoyName ||
            data.fieldboyName ||
            data.FieldboyName ||
            data.name ||
            data.Name ||
            'Unknown Field Boy';
          setCurrentFieldBoyId(fieldBoyId);
          setCurrentFieldBoyName(fieldBoyName);
          setSseTitle('🟢 Field Boy Live');
          setSseType('live');
          setSseMessage(
            `${data.message || 'Field boy is live'}\n\n` +
              `Field Boy Name: ${fieldBoyName || '-'}\n\n` +
              `Field Boy ID: ${fieldBoyId || '-'}`,
          );

          setSseModalVisible(true);
        }

        if (data.type === 'TEST_MESSAGE') {
          setSseTitle('📬 Test Message');
          setSseType('test');
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

  const handleMapNavigation = () => {
    console.log('Navigating FieldBoy:', {
      currentFieldBoyId,
      currentFieldBoyName,
    });

    if (!navigationRef.isReady()) return;

    navigationRef.navigate('MainTabs', {
      screen: 'Dashboard',
      params: {
        screen: 'Track Location',
        params: {
          fieldBoyId: currentFieldBoyId,
          fieldBoyName: currentFieldBoyName,
        },
      },
    });

    setSseModalVisible(false);
  };

  const getHeaderIcon = () => {
    if (sseType === 'location') return 'location-sharp';
    if (sseType === 'live') return 'radio-outline';
    return 'notifications-outline';
  };

  const getHeaderGradient = () => {
    if (sseType === 'location') return ['#3b82f6', '#2563eb'];
    if (sseType === 'live') return ['#10b981', '#059669'];
    return ['#8b5cf6', '#7c3aed'];
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
              ...(theme === 'dark' ? DarkTheme : DefaultTheme).colors,
              background: colors.background,
              card: colors.surface,
              border: colors.border,
              text: colors.text,
              primary: colors.primary,
            },
          }}
        >
          <AppContent />
        </NavigationContainer>

        <Modal
          visible={sseModalVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => setSseModalVisible(false)}
        >
          <View style={tw`flex-1 justify-end bg-black/50`}>
            <TouchableOpacity
              style={tw`flex-1`}
              activeOpacity={1}
              onPress={() => setSseModalVisible(false)}
            />

            <Animated.View
              style={[
                tw`bg-white rounded-t-3xl overflow-hidden`,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient colors={getHeaderGradient()} style={tw`h-1`} />

              <View style={tw`items-center pt-3 pb-1`}>
                <View style={tw`w-10 h-1 bg-gray-300 rounded-full`} />
              </View>

              <View style={tw`p-5`}>
                <View style={tw`flex-row items-center mb-4`}>
                  <LinearGradient
                    colors={getHeaderGradient()}
                    style={tw`p-2.5 rounded-full mr-3`}
                  >
                    <Ionicons name={getHeaderIcon()} size={22} color="white" />
                  </LinearGradient>

                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xl font-bold text-gray-900`}>
                      {sseTitle || 'Notification'}
                    </Text>

                    <Text style={tw`text-xs text-gray-500 mt-0.5`}>
                      {sseType === 'location'
                        ? 'Field boy is sharing location'
                        : sseType === 'live'
                        ? 'Field boy is now online'
                        : 'New notification received'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSseModalVisible(false)}
                    style={tw`p-2 rounded-full bg-gray-100`}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    tw`rounded-xl p-4 mb-5`,
                    sseType === 'location'
                      ? tw`bg-blue-50`
                      : sseType === 'live'
                      ? tw`bg-green-50`
                      : tw`bg-purple-50`,
                  ]}
                >
                  <View style={tw`flex-row items-start`}>
                    <Ionicons
                      name={
                        sseType === 'location'
                          ? 'location-sharp'
                          : sseType === 'live'
                          ? 'radio-outline'
                          : 'chatbubble-ellipses-outline'
                      }
                      size={20}
                      color={
                        sseType === 'location'
                          ? '#3b82f6'
                          : sseType === 'live'
                          ? '#10b981'
                          : '#8b5cf6'
                      }
                      style={tw`mr-2 mt-0.5`}
                    />

                    <Text style={tw`text-gray-800 flex-1 leading-5`}>
                      {sseMessage}
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-row justify-between items-center mb-5`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="time-outline" size={14} color="#9ca3af" />
                    <Text style={tw`text-xs text-gray-400 ml-1`}>
                      {new Date().toLocaleTimeString()}
                    </Text>
                  </View>

                  <View style={tw`flex-row items-center`}>
                    <View
                      style={[
                        tw`w-2 h-2 rounded-full mr-1`,
                        sseType === 'live' ? tw`bg-green-500` : tw`bg-blue-500`,
                      ]}
                    />
                    <Text style={tw`text-xs text-gray-400`}>
                      {sseType === 'live' ? 'Live' : 'Real-time'}
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity
                    onPress={() => setSseModalVisible(false)}
                    style={tw`flex-1 bg-gray-100 py-3.5 rounded-xl`}
                  >
                    <Text style={tw`text-gray-700 text-center font-semibold`}>
                      Dismiss
                    </Text>
                  </TouchableOpacity>

                  {(sseType === 'location' || sseType === 'live') && (
                    <TouchableOpacity
                      onPress={handleMapNavigation}
                      style={[
                        tw`flex-1 py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-md`,
                        sseType === 'live' ? tw`bg-green-600` : tw`bg-blue-600`,
                      ]}
                    >
                      <Ionicons
                        name="navigate-circle-outline"
                        size={20}
                        color="white"
                      />
                      <Text style={tw`text-white text-center font-semibold`}>
                        Navigate
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={tw`h-4`} />
            </Animated.View>
          </View>
        </Modal>
      </ResponsiveProvider>
    </SafeAreaProvider>
  );
}
