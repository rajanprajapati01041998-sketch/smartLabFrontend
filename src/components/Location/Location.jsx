import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import * as signalR from '@microsoft/signalr';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from '../../../Authorization/AxiosInstance';
import { API_BASE_URL } from '../../../Authorization/api';
import { useTheme } from '../../../Authorization/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';

const HUB_URL = API_BASE_URL.replace(/\/?api\/?$/, '/locationHub');

const DEFAULT_LOCATION = {
  latitude: 25.29884,
  longitude: 82.95795,
};

const toNumber = value => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const haversineMeters = (a, b) => {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const AdminTrackFieldBoy = () => {
  const webViewRef = useRef(null);
  const hubRef = useRef(null);
  const trackingUserIdRef = useRef('');

  const route = useRoute();
  const fieldBoyId = route?.params?.fieldBoyId;

  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

  const [fieldBoyList, setFieldBoyList] = useState([]);
  const [fieldBoyLoading, setFieldBoyLoading] = useState(false);
  const [fieldBoyModalVisible, setFieldBoyModalVisible] = useState(false);
  const [fieldBoySearch, setFieldBoySearch] = useState('');

  const [selectedFieldBoy, setSelectedFieldBoy] = useState(null);
  const [trackingUserId, setTrackingUserId] = useState('');

  const [socketConnected, setSocketConnected] = useState(false);
  const [adminRunning, setAdminRunning] = useState(false);
  const [adminLastFix, setAdminLastFix] = useState(null);
  const [path, setPath] = useState([]);
  const [status, setStatus] = useState('Waiting...');

  useEffect(() => {
    trackingUserIdRef.current = trackingUserId;
  }, [trackingUserId]);

  const filteredFieldBoyList = useMemo(() => {
    const search = fieldBoySearch.trim().toLowerCase();

    if (!search) return fieldBoyList;

    return fieldBoyList.filter(item => {
      return (
        String(item.fieldBoyName || '')
          .toLowerCase()
          .includes(search) || String(item.fieldBoyId || '').includes(search)
      );
    });
  }, [fieldBoyList, fieldBoySearch]);

  const fetchFieldBoyList = async () => {
    try {
      setFieldBoyLoading(true);

      const response = await axiosInstance.get('FieldBoy/GetFieldBoyList');
      const list = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setFieldBoyList(list);

      if (fieldBoyId) {
        const matchedFieldBoy = list.find(
          item => String(item.fieldBoyId) === String(fieldBoyId),
        );

        if (matchedFieldBoy) {
          setSelectedFieldBoy(matchedFieldBoy);
          setTrackingUserId(String(matchedFieldBoy.fieldBoyId));
          trackingUserIdRef.current = String(matchedFieldBoy.fieldBoyId);
          return;
        }
      }

      if (list.length > 0 && !selectedFieldBoy) {
        const first = list[0];
        setSelectedFieldBoy(first);
        setTrackingUserId(String(first.fieldBoyId));
        trackingUserIdRef.current = String(first.fieldBoyId);
      }
    } catch (error) {
      console.log('FieldBoy list error:', error?.response?.data || error);
      Alert.alert('Error', 'Unable to fetch field boy list');
    } finally {
      setFieldBoyLoading(false);
    }
  };

  const sendToMap = nextFix => {
    const js = `
      if (window.updateLiveLocation) {
        window.updateLiveLocation(${nextFix.latitude}, ${nextFix.longitude});
      }
      true;
    `;

    webViewRef.current?.injectJavaScript(js);
  };

  const zoomIn = () => {
    webViewRef.current?.injectJavaScript(`
      if (window.zoomInMap) {
        window.zoomInMap();
      }
      true;
    `);
  };

  const zoomOut = () => {
    webViewRef.current?.injectJavaScript(`
      if (window.zoomOutMap) {
        window.zoomOutMap();
      }
      true;
    `);
  };

  const addPathPoint = nextFix => {
    setPath(prev => {
      const last = prev[prev.length - 1];

      if (!last) {
        return [[nextFix.latitude, nextFix.longitude]];
      }

      const lastFix = {
        latitude: last[0],
        longitude: last[1],
      };

      const movedMeters = haversineMeters(lastFix, nextFix);

      if (movedMeters < 1) return prev;

      return [...prev, [nextFix.latitude, nextFix.longitude]];
    });
  };

  const connectSocket = async () => {
    try {
      if (
        hubRef.current &&
        hubRef.current.state === signalR.HubConnectionState.Connected
      ) {
        setSocketConnected(true);
        return true;
      }

      setStatus('Connecting socket...');

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connection.onreconnecting(error => {
        console.log('Socket reconnecting:', error);
        setSocketConnected(false);
        setStatus('Socket reconnecting...');
      });

      connection.onreconnected(async () => {
        console.log('Socket reconnected');
        setSocketConnected(true);
        setStatus('Socket reconnected');

        try {
          await connection.invoke('JoinAdminGroup');
        } catch (error) {
          console.log('JoinAdminGroup reconnect error:', error);
        }
      });

      connection.onclose(error => {
        console.log('Socket closed:', error);
        setSocketConnected(false);
        setStatus('Socket disconnected');
      });

      connection.on('ReceiveLocation', location => {
        try {
          console.log('✅ RECEIVE LIVE LOCATION:', location);

          const selectedId = String(trackingUserIdRef.current || '');
          const receivedId = String(
            location.fieldBoyId || location.FieldBoyId || '',
          );

          console.log('Selected FieldBoyId:', selectedId);
          console.log('Received FieldBoyId:', receivedId);

          if (selectedId && selectedId !== receivedId) {
            console.log('❌ Location ignored because field boy id not matched');
            return;
          }

          const lat = toNumber(location.latitude || location.Latitude);
          const lng = toNumber(location.longitude || location.Longitude);

          console.log('Latitude:', lat);
          console.log('Longitude:', lng);

          if (lat == null || lng == null) {
            console.log('❌ Invalid latitude or longitude');
            return;
          }

          const nextFix = {
            latitude: lat,
            longitude: lng,
          };

          setAdminLastFix(nextFix);
          addPathPoint(nextFix);
          sendToMap(nextFix);

          setStatus(
            `Receiving live location ${new Date().toLocaleTimeString()}`,
          );
        } catch (error) {
          console.log('ReceiveLocation Error:', error);
        }
      });

      connection.on('FieldBoyConnected', data => {
        console.log('✅ FieldBoyConnected:', data);
      });

      connection.on('SampleDelivered', data => {
        console.log('✅ SampleDelivered:', data);
      });

      await connection.start();
      await connection.invoke('JoinAdminGroup');
      hubRef.current = connection;
      setSocketConnected(true);
      setStatus('Socket connected');
      console.log('✅ Admin socket connected');
      console.log('✅ Joined Admin group');

      return true;
    } catch (error) {
      console.log('❌ Socket connection failed:', error);
      setSocketConnected(false);
      setStatus('Socket connection failed');
      return false;
    }
  };

  const startTracking = async () => {
    if (!trackingUserId) {
      Alert.alert('Required', 'Please select field boy');
      return;
    }

    setPath([]);
    setAdminLastFix(null);

    const connected = await connectSocket();

    if (connected) {
      setAdminRunning(true);
      setStatus('Waiting for live location...');
    }
  };

  const stopTracking = () => {
    setAdminRunning(false);
    setStatus('Tracking stopped');
  };

  const clearPath = () => {
    setPath([]);
    setAdminLastFix(null);

    webViewRef.current?.injectJavaScript(`
      if (window.clearLivePath) {
        window.clearLivePath();
      }
      true;
    `);
  };

  const handleSelectFieldBoy = item => {
    const id = String(item.fieldBoyId);
    setSelectedFieldBoy(item);
    setTrackingUserId(id);
    trackingUserIdRef.current = id;
    setPath([]);
    setAdminLastFix(null);
    setFieldBoyModalVisible(false);
    setFieldBoySearch('');

    webViewRef.current?.injectJavaScript(`
      if (window.clearLivePath) {
        window.clearLivePath();
      }
      true;
    `);
  };

  useEffect(() => {
    fetchFieldBoyList();
    return () => {
      if (hubRef.current) {
        hubRef.current.stop();
        hubRef.current = null;
      }
    };
  }, []);

  const latitude = adminLastFix?.latitude || DEFAULT_LOCATION.latitude;
  const longitude = adminLastFix?.longitude || DEFAULT_LOCATION.longitude;

  const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .live-marker {
      width: 15px;
      height: 15px;
      background: #dc2626;
      border: 4px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(220, 38, 38, 0.8);
    }

    .pulse {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
      }
      70% {
        box-shadow: 0 0 0 18px rgba(220, 38, 38, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
      }
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <script>
    var map = L.map('map', {
      zoomControl: false
    }).setView([${latitude}, ${longitude}], 15);

    // Use Google Maps standard roadmap tiles (shows names and POIs)
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '© Google'
    }).addTo(map);

    var liveIcon = L.divIcon({
      className: '',
      html: '<div class="live-marker pulse"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    var marker = L.marker([${latitude}, ${longitude}], {
      icon: liveIcon
    }).addTo(map);

    var pathPoints = ${JSON.stringify(path)};
    
    // Draw the border of the path (darker and thicker)
    var polylineOutline = L.polyline(pathPoints, {
      color: '#1A43B2',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Draw the inner part of the path (lighter and thinner)
    var polylineInner = L.polyline(pathPoints, {
      color: '#3B82F6',
      weight: 4,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    window.updateLiveLocation = function(lat, lng) {
      var nextPoint = [lat, lng];

      marker.setLatLng(nextPoint);
      pathPoints.push(nextPoint);
      polylineOutline.setLatLngs(pathPoints);
      polylineInner.setLatLngs(pathPoints);
      map.setView(nextPoint, map.getZoom(), { animate: true });

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LIVE_LOCATION_UPDATED',
          latitude: lat,
          longitude: lng,
          zoom: map.getZoom()
        }));
      }
    };

    window.zoomInMap = function() {
      map.zoomIn();
    };

    window.zoomOutMap = function() {
      map.zoomOut();
    };

    window.clearLivePath = function() {
      pathPoints = [];
      polylineOutline.setLatLngs([]);
      polylineInner.setLatLngs([]);
    };
  </script>
</body>
</html>
`;

  return (
    <View style={[themed.screen, tw`flex-1`]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={tw`flex-1`}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('📍 Leaflet WebView:', data);
          } catch (error) {
            console.log('WebView message:', event.nativeEvent.data);
          }
        }}
      />

      <View style={tw`absolute right-4 bottom-5 z-50`}>
        <TouchableOpacity
          onPress={zoomIn}
          style={tw`bg-gray-600 h-12 w-12 rounded-full items-center justify-center mb-3 shadow-lg`}
        >
          <Text style={tw`text-white text-3xl font-bold`}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={zoomOut}
          style={tw`bg-gray-600 h-12 w-12 rounded-full items-center justify-center shadow-lg`}
        >
          <Text style={tw`text-white text-3xl font-bold`}>−</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          themed.childScreen,
          tw`absolute top-0 left-0 right-0 z-50 pt-2 pb-4 px-3 rounded-b-3xl`,
        ]}
      >
        <TouchableOpacity
          style={themed.dropDownButton}
          onPress={() => {
            fetchFieldBoyList();
            setFieldBoyModalVisible(true);
          }}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <Ionicons name="person-outline" size={22} color="#000" />

            <Text style={[themed.inputText, tw`ml-2 flex-1`]}>
              {selectedFieldBoy
                ? `${selectedFieldBoy.fieldBoyName} (${selectedFieldBoy.fieldBoyId})`
                : 'Select Field Boy'}
            </Text>
          </View>

          <Ionicons name="chevron-down" size={22} color="#000" />
        </TouchableOpacity>

        <View style={tw`flex-row mt-2`}>
          <TouchableOpacity
            onPress={adminRunning ? stopTracking : startTracking}
            style={tw`flex-1 py-3 rounded-xl ${
              adminRunning ? 'bg-red-600' : 'bg-green-600'
            } mr-2`}
          >
            <Text style={tw`text-white text-center font-bold`}>
              {adminRunning ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearPath}
            style={tw`bg-gray-700 px-5 rounded-xl justify-center`}
          >
            <Text style={tw`text-white font-bold`}>Clear</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={tw`text-center mt-2 font-bold ${
            socketConnected ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {socketConnected ? 'Connected' : 'Disconnected'}
        </Text>

        <Text style={tw`text-center text-gray-500 text-xs`}>{status}</Text>

        {adminLastFix && (
          <Text style={tw`text-center text-gray-500 text-xs mt-1`}>
            Lat: {adminLastFix.latitude} | Lng: {adminLastFix.longitude}
          </Text>
        )}
      </View>

      <Modal
        visible={fieldBoyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFieldBoyModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setFieldBoyModalVisible(false)}
        >
          <View style={tw`flex-1 bg-black/50 justify-end`}>
            <TouchableWithoutFeedback>
              <View
                style={[themed.childScreen, tw`rounded-t-3xl p-4 max-h-[55%]`]}
              >
                <Text style={[themed.modalTitle, tw`mb-3`]}>
                  Select Field Boy
                </Text>

                <View style={tw`flex-row items-center mb-3`}>
                  <TextInput
                    value={fieldBoySearch}
                    onChangeText={setFieldBoySearch}
                    placeholder="Search field boy..."
                    placeholderTextColor={themed.inputPlaceholder}
                    style={[themed.inputBox, themed.inputText, tw`flex-1`]}
                  />

                  <TouchableOpacity
                    onPress={fetchFieldBoyList}
                    style={[themed.searchButton, tw`ml-2`]}
                  >
                    <Text style={themed.searchButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {fieldBoyLoading ? (
                    <Text style={tw`text-center text-gray-500 py-5`}>
                      Loading field boys...
                    </Text>
                  ) : filteredFieldBoyList.length > 0 ? (
                    filteredFieldBoyList.map(item => {
                      const selected =
                        String(trackingUserId) === String(item.fieldBoyId);

                      return (
                        <TouchableOpacity
                          key={String(item.fieldBoyId)}
                          onPress={() => handleSelectFieldBoy(item)}
                          style={[
                            tw`rounded-xl px-4 py-4 mb-2 border`,
                            themed.childScreen,
                            themed.border,
                          ]}
                        >
                          <View
                            style={tw`flex-row justify-between items-center`}
                          >
                            <View>
                              <Text style={themed.inputText}>
                                {item.fieldBoyName}
                              </Text>
                              <Text style={tw`text-gray-500 text-xs mt-1`}>
                                ID: {item.fieldBoyId}
                              </Text>
                            </View>

                            {selected && (
                              <Text style={tw`text-blue-600 font-bold`}>
                                Selected
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={tw`text-center text-red-500 py-5`}>
                      No field boy found
                    </Text>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default AdminTrackFieldBoy;
