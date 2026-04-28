import React, { useCallback, useRef, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import tw from 'twrnc';
import { Camera } from 'react-native-camera-kit';
import { useTheme } from '../Authorization/ThemeContext';

const getCodeFromEvent = event => {
  return (
    event?.nativeEvent?.codeStringValue ||
    event?.nativeEvent?.code ||
    event?.codeStringValue ||
    event?.code ||
    ''
  ).toString();
};

export default function BarcodeScannerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const returnScreen = route?.params?.returnScreen || null;
  const [hasScanned, setHasScanned] = useState(false);
  const lastValueRef = useRef('');

  const onReadCode = useCallback(
    event => {
      const value = getCodeFromEvent(event).trim();
      if (!value || hasScanned || lastValueRef.current === value) return;

      lastValueRef.current = value;
      setHasScanned(true);

      if (returnScreen) {
        navigation.navigate(returnScreen, { scannedBarcode: value });
      } else {
        navigation.goBack();
      }
    },
    [hasScanned, navigation, returnScreen],
  );

  return (
    <View style={tw`flex-1 bg-black`}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <Camera
        style={tw`flex-1`}
        scanBarcode={true}
        onReadCode={onReadCode}
        showFrame={true}
        laserColor={colors.primary || '#3b82f6'}
        frameColor={colors.primary || '#3b82f6'}
      />

      <View
        style={[
          tw`absolute top-0 left-0 right-0 px-4 pt-12 pb-4`,
          { backgroundColor: 'rgba(0,0,0,0.25)' },
        ]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`w-11 h-11 rounded-full items-center justify-center bg-black/40`}
            activeOpacity={0.8}
          >
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={tw`flex-1 items-center`}>
            <Text style={tw`text-white font-semibold text-base`}>
              Scan Barcode
            </Text>
            <Text style={tw`text-white/70 text-xs mt-0.5`}>
              Align barcode inside the frame
            </Text>
          </View>

          <View style={tw`w-11 h-11`} />
        </View>
      </View>
    </View>
  );
}