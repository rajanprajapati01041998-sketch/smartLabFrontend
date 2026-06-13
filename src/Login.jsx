import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Modal,
  FlatList,
  PermissionsAndroid,
  Switch,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkInfo } from 'react-native-network-info';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import logo from '../Assets/Login/login_logo.jpg';
import api from '../Authorization/api';
import { useAuth } from '../Authorization/AuthContext';
import { useTheme } from '../Authorization/ThemeContext';
import { getThemeStyles } from './utils/themeStyles';
import { useToast } from '../Authorization/ToastContext';
import {
  clearRememberedCredentials,
  loadRememberedCredentials,
  saveRememberedCredentials,
} from './utils/loginStorage';

const Login = ({ navigation }) => {
  const { showToast } = useToast();
  const {
    login,
    setAllBranchInfo,deviceData,latitude,longitude
  } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchSearch, setBranchSearch] = useState('');
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  const { theme } = useTheme();
  const themed = getThemeStyles(theme);

  useEffect(() => {
    const restoreSavedCredentials = async () => {
      const savedCredentials = await loadRememberedCredentials();

      if (savedCredentials?.rememberMe) {
        setUsername(savedCredentials.username || '');
        setPassword(savedCredentials.password || '');
        setRememberMe(true);
        setHasSavedCredentials(true);
      } else {
        setRememberMe(false);
        setHasSavedCredentials(false);
      }
    };

    restoreSavedCredentials();
  }, []);

  useEffect(() => {
    const persistCredentials = async () => {
      if (!rememberMe) {
        if (hasSavedCredentials) {
          await clearRememberedCredentials();
        }
        return;
      }

      await saveRememberedCredentials(username, password, true);
    };

    persistCredentials();
  }, [username, password, rememberMe, hasSavedCredentials]);

  // THIS IS THE MISSING PART - filteredBranches definition
  const filteredBranches = useMemo(() => {
    const search = branchSearch.trim().toLowerCase();
    if (!search) {
      return branches;
    }
    return branches.filter(item => {
      return (
        String(item.branchName || '').toLowerCase().includes(search) ||
        String(item.branchCode || '').toLowerCase().includes(search) ||
        String(item.fullBranchName || '').toLowerCase().includes(search) ||
        String(item.branchId || '').includes(search)
      );
    });
  }, [branches, branchSearch]);

  const handleRememberMeToggle = async value => {
    setRememberMe(value);
    setHasSavedCredentials(value);

    if (!value) {
      await clearRememberedCredentials();
      return;
    }

    await saveRememberedCredentials(username, password, true);
  };

  const handleClearSavedCredentials = async () => {
    await clearRememberedCredentials();
    setUsername('');
    setPassword('');
    setRememberMe(false);
    setHasSavedCredentials(false);
    showToast('Remembered credentials cleared', 'info');
  };

  const getBranchList = async () => {
    try {
      const formData = {
        userName: username,
        userPassword: password,
        branchId: 0,
        browser: "Handset",
        device: Platform.OS === "android" ? "Android Phone" : "iPhone",
        os: Platform.OS === "android" ? "Android" : "iOS",
      };
      console.log("formData", formData);

      const response = await api.post(`Login/branch-list`, formData);

      console.log("branch response", response);

      const branchList = Array.isArray(response?.data)
        ? response.data
        : [];

      setBranches(branchList);
      setBranchModalVisible(true);

    } catch (error) {
      console.log("Branch list error:", error?.response?.data || error?.message);
      showToast('Invalid username or password', 'error');
    } finally {
      setLoading(false);
    }

  };



  const handleBranchSelect = async branch => {
    const formData = {
      userName: username,
      userPassword: password,
      branchId: branch?.branchId,
      browser: deviceData.type,
      device: deviceData.device,
      os: deviceData.os,
      latitudeApp: latitude,
      longitudeApp: longitude,
    };

    try {
      {
        setLoading(true);
        const response = await api.post('Login/login', formData);
        console.log('final login', response.data);
        const token = response.data.token;
        const userInfo = response.data;
        const success = await login(token, userInfo);
        if (!success) {
          showToast('Failed to save login data', 'error');
          return;
        }

        if (rememberMe) {
          await saveRememberedCredentials(username, password, true);
        } else {
          await clearRememberedCredentials();
        }

        await AsyncStorage.setItem(
          'AllBranch',
          JSON.stringify(branches)
        );
        setAllBranchInfo(branches);
        showToast('Login Successful', 'success');
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.log('Final Login error', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBranchModal = () => {
    return (
      <Modal
        visible={branchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBranchModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setBranchModalVisible(false)}>
          <View style={tw`flex-1 bg-black/50 justify-end`}>
            <TouchableWithoutFeedback>
              <View style={tw`bg-white rounded-t-3xl p-4 max-h-[78%]`}>
                <View style={tw`items-center mb-3`}>
                  <View style={tw`w-12 h-1 bg-gray-300 rounded-full mb-3`} />
                </View>

                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <View>
                    <Text style={tw`text-black text-lg font-bold`}>
                      Select Branch
                    </Text>
                    <Text style={tw`text-gray-500 text-xs mt-1`}>
                      {branches.length} branch available
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setBranchModalVisible(false)}
                    style={tw`h-9 w-9 rounded-full bg-gray-100 items-center justify-center`}>
                    <Ionicons name="close" size={22} color="#111827" />
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-row items-center bg-gray-100 rounded-xl px-3 mb-3`}>
                  <Ionicons name="search" size={18} color="#6B7280" />

                  <TextInput
                    value={branchSearch}
                    onChangeText={setBranchSearch}
                    placeholder="Search branch..."
                    placeholderTextColor="#9CA3AF"
                    style={tw`flex-1 px-2 py-3 text-black`}
                  />

                  {branchSearch ? (
                    <TouchableOpacity onPress={() => setBranchSearch('')}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {loginLoading ? (
                  <View style={tw`py-10 items-center justify-center`}>
                    <ActivityIndicator color="#174B3F" />
                    <Text style={tw`text-gray-500 mt-3`}>
                      Logging in...
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredBranches}
                    keyExtractor={(item, index) =>
                      `${item.branchId}-${index}`
                    }
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <View style={tw`py-12 items-center justify-center`}>
                        <MaterialIcons
                          name="business"
                          size={48}
                          color="#D1D5DB"
                        />
                        <Text style={tw`text-gray-400 mt-3`}>
                          No branch found
                        </Text>
                      </View>
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleBranchSelect(item)}
                        activeOpacity={0.75}
                        style={tw`flex-row items-center p-4 mb-2 rounded-2xl bg-gray-50 border border-gray-200`}>
                        <View style={tw`h-11 w-11 rounded-full bg-green-100 items-center justify-center mr-3`}>
                          <MaterialIcons
                            name="business"
                            size={22}
                            color="#174B3F"
                          />
                        </View>

                        <View style={tw`flex-1`}>
                          <Text
                            numberOfLines={1}
                            style={tw`text-black font-bold text-sm`}>
                            {item.fullBranchName || item.branchName}
                          </Text>

                          <Text style={tw`text-gray-500 text-xs mt-1`}>
                            Branch ID: {item.branchId}
                          </Text>
                        </View>

                        <MaterialIcons
                          name="chevron-right"
                          size={26}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={tw`flex-1 bg-white`}>
        <StatusBar barStyle="light-content" backgroundColor="#174B3F" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tw`flex-1`}>
          <View style={tw`h-[40%] rounded-b-[45px]  overflow-hidden`}>
            <ImageBackground source={logo} resizeMode="cover" style={tw`flex-1 h-45`}>
              <LinearGradient
                colors={[
                  'rgba(10,70,55,0.90)',
                  'rgba(10,70,55,0.82)',
                ]}
                style={tw`flex-1 justify-center items-center px-6`}>
                <View style={tw`h-28 w-28 rounded-full bg-white items-center justify-center shadow-lg overflow-hidden`}>
                  <Image
                    source={logo}
                    resizeMode="contain"
                    style={tw`h-26 w-26`}
                  />
                </View>

                <Text style={tw`text-white text-3xl font-extrabold mt-5`}>
                  Welcome Back!
                </Text>

                <Text style={tw`text-white/80 mt-2 text-center`}>
                  Select your branch and continue
                </Text>
              </LinearGradient>
            </ImageBackground>
          </View>

          <View style={tw`flex-1 bg-white px-7 pt-10`}>
            <Text style={tw`text-gray-500 text-sm mb-1`}>User ID</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter User ID"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              style={tw`text-black text-lg font-bold border-b border-yellow-400 pb-3 mb-5`}
            />

            <Text style={tw`text-gray-500 text-sm mb-1`}>Password</Text>

            <View style={tw`flex-row items-center border-b border-gray-200 mb-4`}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter Password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                style={tw`flex-1 text-black text-base pb-3`}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me Switch */}
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <TouchableOpacity
                onPress={() => handleRememberMeToggle(!rememberMe)}
                style={tw`flex-row items-center`}>
                <Switch
                  value={rememberMe}
                  onValueChange={handleRememberMeToggle}
                  trackColor={{ false: '#D1D5DB', true: '#174B3F' }}
                  thumbColor={rememberMe ? '#FFFFFF' : '#F3F4F6'}
                />
                <Text style={tw`text-gray-600 ml-2 text-sm`}>
                  Remember Me
                </Text>
              </TouchableOpacity>

              {hasSavedCredentials && (
                <TouchableOpacity onPress={handleClearSavedCredentials}>
                  <Text style={tw`text-red-500 text-xs`}>
                    Clear Saved
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={getBranchList}
              disabled={loading || branchLoading}
              activeOpacity={0.85}
              style={[themed.loginBtn]}>
              {loading || branchLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white text-center font-extrabold text-base tracking-widest`}>
                  CONTINUE
                </Text>
              )}
            </TouchableOpacity>

            <View style={tw`items-center mt-10`}>
              <Text style={tw`text-gray-500`}>
                Gravity Web Technologies Pvt.Ltd.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>

        {renderBranchModal()}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;