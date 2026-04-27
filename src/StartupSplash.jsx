import { View, Image, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import SplashImage from '../src/assets/splash.png';

const StartupSplash = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={SplashImage}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />

      {/* No Internet Overlay */}
      {!isConnected && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            No Internet Connection
          </Text>

          <Text
            style={{
              color: '#ccc',
              fontSize: 14,
              marginTop: 10,
              textAlign: 'center',
            }}
          >
            Please check your network and try again
          </Text>
        </View>
      )}
    </View>
  );
};

export default StartupSplash;