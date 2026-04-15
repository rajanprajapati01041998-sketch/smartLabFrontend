import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceInfo } from '../src/utils/deviceInfo';
import { logoutUser } from '../src/utils/logoutService/logout';
import { NetworkInfo } from 'react-native-network-info';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [ipAddress, setIpAddress] = useState(null);
  const [serviceItem, setServiceItem] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [corporateId, setCorporateId] = useState(null)
  const [loginBranchId, setLoginBranchId] = useState(null)
  const [hosId, setHosId] = useState(1)
  const [patientData, setPatientData] = useState(null)
  const [userId, setUserId] = useState(null)
  const [allBranchInfo, setAllBranchInfo] = useState([])
  const [deviceData, setDeviceData] = useState(null);
  const [sessionId, setSessionId] = useState(null)
  const [centerLoginBranchId, setCenterLoginBranchId] = useState(null)
  const [updateFlag, setUpdateFlag] = useState(0);
  const [addBarcode, setAddBarcode] = useState(false)

  const triggerUpdate = () => {
    setUpdateFlag(prev => prev + 1);
  };

  // console.log("updateg fleg",updateFlag)


  // Load stored auth data on app startup
  useEffect(() => {
    loadStoredData();
    getBranchInfo()
    loadDeviceInfo();
    getLocalIP();
  }, []);




  const getLocalIP = async () => {
    try {
      const ip = await NetworkInfo.getIPV4Address();
      console.log('Local IP:', ip);
      setIpAddress(ip || '0.0.0.0');
      return ip || '0.0.0.0';
    } catch (error) {
      console.log('Local IP error:', error);
      return '0.0.0.0';
    }
  };



  const loadDeviceInfo = async () => {
    const info = await getDeviceInfo();
    setDeviceData(info);
  };

  const getBranchInfo = async () => {
    try {
      const data = await AsyncStorage.getItem('AllBranch');

      if (data) {
        const parsedData = JSON.parse(data);
        setAllBranchInfo(parsedData);

        // ✅ default select first branch
        if (parsedData.length > 0) {
          const defaultBranch = parsedData[0];
          // setSelectedItem(defaultBranch);
          // getrateListPanel(defaultBranch.branchId);
        }
      }
    } catch (error) {
      console.log("Error reading branches", error);
    }
  };








  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUserInfo) {
        const parsedUser = JSON.parse(storedUserInfo);
        console.log("login dta:", parsedUser)
        setLoginBranchId(parsedUser?.branchId)
        setUser(parsedUser);
        setUserData(parsedUser?.user);
        setUserId(parsedUser?.user?.id)
        setSessionId(parsedUser?.sessionId)
      }

    } catch (error) {
      console.log('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token, userInfo) => {
    try {
      // Store in AsyncStorage  
      console.log("token", token)
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      setToken(token);
      setUserData(userInfo);
      setUser(userInfo);
      return true;
    } catch (error) {
      console.log('Error saving auth data:', error);
      return false;
    }
  };

  const logout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Logout Cancelled"),
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('userInfo');
              await logoutUser(sessionId)
              setToken(null);
              setUserData({});
              setUser(null);
              setUserId(null);
              setCorporateId(null)
              setSessionId(null)
              setAllBranchInfo(null)
              console.log("User Logged Out");
            } catch (error) {
              console.log('Error during logout:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  return (
    <AuthContext.Provider
      value={{
        triggerUpdate, updateFlag,
        user, userData,
        isLoading, login,
        logout,
        token,
        setToken,
        setUserData,
        ipAddress,
        serviceItem, setServiceItem,
        selectedDoctor, setSelectedDoctor,
        corporateId, setCorporateId,
        patientData, setPatientData,
        userId, setUserId,
        loginBranchId, setLoginBranchId,
        allBranchInfo, setAllBranchInfo,
        deviceData, setDeviceData, loadDeviceInfo,
        sessionId, setSessionId,
        centerLoginBranchId, setCenterLoginBranchId,
        hosId, setHosId,
        addBarcode, setAddBarcode
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};