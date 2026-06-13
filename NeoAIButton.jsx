import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  PanResponder,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const NeoAIButton = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // PanResponder to detect drag vs press
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Consider it a drag if moved more than 5 pixels
        const isDrag = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        if (isDrag) {
          hasMoved.current = true;
          setIsDragging(true);
        }
        return isDrag;
      },
      onPanResponderGrant: (e, gestureState) => {
        // Record start position when touch begins
        startPosition.current = {
          x: gestureState.x0,
          y: gestureState.y0,
        };
        hasMoved.current = false;
        setIsDragging(false);
        
        // Start press animation
        Animated.spring(pressAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        // You can add drag logic here if needed
        // For example, moving the button around the screen
      },
      onPanResponderRelease: (_, gestureState) => {
        // Reset press animation
        Animated.spring(pressAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();

        // Check if it was a press (not a drag)
        const wasDragged = hasMoved.current || 
          Math.abs(gestureState.dx) > 5 || 
          Math.abs(gestureState.dy) > 5;
        
        if (!wasDragged && !isDragging) {
          // Only trigger onPress if it wasn't a drag
          onPress?.();
        }
        
        // Reset states
        setIsDragging(false);
        hasMoved.current = false;
      },
      onPanResponderTerminate: () => {
        // Reset on termination
        Animated.spring(pressAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setIsDragging(false);
        hasMoved.current = false;
      },
    })
  ).current;

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

  const pressScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  const iconScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
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
  );
};

export default NeoAIButton;