import React, {useEffect, useMemo, useRef, useState} from 'react';
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

import {Map, Camera, GeoJSONSource, Layer} from '@maplibre/maplibre-react-native';
import {useRoute} from '@react-navigation/native';
import * as signalR from '@microsoft/signalr';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from '../../../Authorization/AxiosInstance';
import {API_BASE_URL} from '../../../Authorization/api';
import {useTheme} from '../../../Authorization/ThemeContext';
import {getThemeStyles} from '../../utils/themeStyles';

const HUB_URL = API_BASE_URL.replace(/\/?api\/?$/, '/locationHub');

const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap Contributors',
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const DEFAULT_LOCATION = {
  latitude: 20.5937,
  longitude: 78.9629,
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
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const AdminTrackFieldBoy = () => {
  const cameraRef = useRef(null);
  const hubRef = useRef(null);
  const trackingUserIdRef = useRef('');

  const route = useRoute();
  const fieldBoyId = route?.params?.fieldBoyId;

  const {theme} = useTheme();
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

    if (!search) {
      return fieldBoyList;
    }

    return fieldBoyList.filter(item => {
      return (
        String(item.fieldBoyName || '').toLowerCase().includes(search) ||
        String(item.fieldBoyId || '').includes(search)
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
      console.log(
        'FieldBoy list error:',
        error?.response?.data || error?.message,
      );

      Alert.alert('Error', 'Unable to fetch field boy list');
    } finally {
      setFieldBoyLoading(false);
    }
  };

  const moveCamera = coords => {
    try {
      cameraRef.current?.easeTo({
        center: [coords.longitude, coords.latitude],
        zoom: 16,
        duration: 800,
        easing: 'ease',
      });
    } catch (error) {
      console.log('Camera error:', error?.message);
    }
  };

  const addPathPoint = nextFix => {
    setPath(prev => {
      const last = prev[prev.length - 1];

      if (!last) {
        return [[nextFix.longitude, nextFix.latitude]];
      }

      const lastFix = {
        latitude: last[1],
        longitude: last[0],
      };

      const movedMeters = haversineMeters(lastFix, nextFix);

      if (movedMeters < 1) {
        return prev;
      }

      return [...prev, [nextFix.longitude, nextFix.latitude]];
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

      setStatus('Connecting admin websocket...');

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connection.onreconnecting(error => {
        console.log('Socket reconnecting...', error);
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
        console.log('Socket disconnected:', error);
        setSocketConnected(false);
        setStatus('Socket disconnected');
      });

      connection.on('ReceiveLocation', location => {
        try {
          console.log('Admin Received Live Location:', location);

          const selectedId = String(trackingUserIdRef.current || '');
          const receivedId = String(location.fieldBoyId || location.FieldBoyId || '');

          if (selectedId && selectedId !== receivedId) {
            return;
          }

          const lat = toNumber(location.latitude || location.Latitude);
          const lng = toNumber(location.longitude || location.Longitude);

          if (lat == null || lng == null) {
            return;
          }

          const nextFix = {
            latitude: lat,
            longitude: lng,
          };

          setAdminLastFix(nextFix);
          addPathPoint(nextFix);
          moveCamera(nextFix);

          setStatus(`Receiving live location ${new Date().toLocaleTimeString()}`);
        } catch (error) {
          console.log('ReceiveLocation Error:', error);
        }
      });

      connection.on('FieldBoyConnected', data => {
        console.log('FieldBoyConnected:', data);

        Alert.alert(
          'Field Boy Live',
          data?.Message || data?.message || 'Field boy started live location',
        );
      });

      connection.on('SampleDelivered', data => {
        console.log('SampleDelivered:', data);

        Alert.alert(
          'Sample Delivered',
          data?.Message || data?.message || 'Sample delivered successfully',
        );
      });

      await connection.start();

      await connection.invoke('JoinAdminGroup');

      hubRef.current = connection;

      setSocketConnected(true);
      setStatus('Socket connected');

      return true;
    } catch (error) {
      console.log('Socket connection failed:', error);
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
  };

  useEffect(() => {
    fetchFieldBoyList();

    return () => {
      if (hubRef.current) {
        hubRef.current.stop();
        hubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latitude = adminLastFix?.latitude || DEFAULT_LOCATION.latitude;
  const longitude = adminLastFix?.longitude || DEFAULT_LOCATION.longitude;

  const markerGeoJSON = {
    type: 'FeatureCollection',
    features: adminLastFix
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            properties: {},
          },
        ]
      : [],
  };

  const pathGeoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: path,
        },
        properties: {},
      },
    ],
  };

  return (
    <View style={[themed.screen, tw`flex-1`]}>
      <Map
        style={tw`flex-1`}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        compassEnabled={true}
        rotateEnabled={true}
        zoomEnabled={true}
        attributionEnabled={false}
        scaleBarEnabled={false}
        androidRenderMode="textureView">
        <Camera
          ref={cameraRef}
          zoomLevel={adminLastFix ? 16 : 5}
          centerCoordinate={[longitude, latitude]}
        />

        {path.length >= 2 && (
          <GeoJSONSource id="adminPathSource" data={pathGeoJSON}>
            <Layer
              id="adminPathLine"
              type="line"
              paint={{
                'line-color': '#2563eb',
                'line-width': 5,
                'line-opacity': 0.9,
              }}
            />
          </GeoJSONSource>
        )}

        {adminLastFix && (
          <GeoJSONSource id="adminCurrentLocationSource" data={markerGeoJSON}>
            <Layer
              id="adminCurrentLocationCircle"
              type="circle"
              paint={{
                'circle-radius': 10,
                'circle-color': '#dc2626',
                'circle-stroke-width': 4,
                'circle-stroke-color': '#ffffff',
              }}
            />
          </GeoJSONSource>
        )}
      </Map>

      <View
        style={[
          themed.childScreen,
          tw`absolute top-0 left-0 right-0 z-50 pt-2 pb-4 px-3 rounded-b-3xl`,
        ]}>
        <TouchableOpacity
          style={themed.dropDownButton}
          onPress={() => {
            fetchFieldBoyList();
            setFieldBoyModalVisible(true);
          }}>
          <View style={tw`flex-row items-center flex-1`}>
            <View style={tw`h-10 w-10 rounded-full items-center justify-center mr-3`}>
              <Ionicons
                name="person-outline"
                size={20}
                color={themed.iconMuted}
              />
            </View>

            <View style={tw`flex-1`}>
              <Text style={themed.inputText}>Select Field Boy</Text>

              <Text numberOfLines={1} style={themed.inputText}>
                {selectedFieldBoy
                  ? `${selectedFieldBoy.fieldBoyName} (${selectedFieldBoy.fieldBoyId})`
                  : 'Choose Field Boy'}
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-down"
            size={22}
            color={themed.chevronColor}
          />
        </TouchableOpacity>

        <View style={tw`flex-row mt-2`}>
          <TouchableOpacity
            onPress={adminRunning ? stopTracking : startTracking}
            style={tw`flex-1 py-2 rounded-lg ${
              adminRunning ? 'bg-red-600' : 'bg-green-600'
            } mr-2`}>
            <Text style={tw`text-white text-center font-bold text-base`}>
              {adminRunning ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clearPath} style={themed.closeButton}>
            <Text style={tw`text-white font-bold text-base`}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`mt-3`}>
          <Text
            style={tw`text-center ${
              socketConnected ? 'text-green-500' : 'text-red-500'
            } font-bold text-lg`}>
            Location: {socketConnected ? 'Connected' : 'Disconnected'}
          </Text>

          <Text style={tw`text-center mt-1 text-gray-500 text-sm`}>
            Status: {status}
          </Text>
        </View>

        {adminLastFix && (
          <Text style={tw`text-center mt-1 text-gray-500 text-xs`}>
            Lat: {latitude} | Lng: {longitude}
          </Text>
        )}
      </View>

      <Modal
        visible={fieldBoyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFieldBoyModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setFieldBoyModalVisible(false)}>
          <View style={tw`flex-1 bg-black/50 justify-end`}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  themed.childScreen,
                  tw`rounded-t-3xl p-4 max-h-[50%]`,
                ]}>
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
                    style={[themed.searchButton, tw`ml-2`]}>
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
                          ]}>
                          <View style={tw`flex-row justify-between items-center`}>
                            <View>
                              <Text style={themed.inputText}>
                                {item.fieldBoyName}
                              </Text>
                              <Text style={tw`text-gray-500 text-xs mt-1`}>
                                ID: {item.fieldBoyId}
                              </Text>
                            </View>

                            {selected ? (
                              <Text style={tw`text-blue-600 font-bold`}>
                                Selected
                              </Text>
                            ) : null}
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