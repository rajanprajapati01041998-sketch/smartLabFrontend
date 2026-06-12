import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const NeoAIButton = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    onPress?.();
  };

  const pressScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  const iconScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          transform: [{ scale: Animated.multiply(scaleAnim, pressScale) }],
        }}
      >
        {/* Base 3D Sphere Layer */}
        <View
          style={[
            tw`w-16 h-16 rounded-full items-center justify-center overflow-hidden`,
            {
              backgroundColor: '#4F46E5',
            },
          ]}
        >
          {/* Top Highlight (Light Source) */}
          <View
            style={[
              tw`absolute top-0 left-0 right-0`,
              {
                height: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
              },
            ]}
          />

          {/* Bottom Shadow (Dark Area) */}
          <View
            style={[
              tw`absolute bottom-0 left-0 right-0`,
              {
                height: 35,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderBottomLeftRadius: 40,
                borderBottomRightRadius: 40,
              },
            ]}
          />

          {/* Left Side Shadow */}
          <View
            style={[
              tw`absolute left-0 top-0 bottom-0`,
              {
                width: 15,
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
              },
            ]}
          />

          {/* Gradient Overlay for 3D Spherical Effect */}
          <LinearGradient
            colors={['#4F46E5', '#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`absolute inset-0 opacity-70`}
          />

         

          {/* Icon with Press Animation */}
          <Animated.View
            style={{
              transform: [{ scale: iconScale }],
            }}
          >
            <Ionicons name="sparkles" size={32} color="#fff" />
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default NeoAIButton;