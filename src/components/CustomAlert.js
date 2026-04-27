// src/components/CustomAlert.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning', // 'warning', 'success', 'error', 'info'
  animationType = 'spring', // 'spring', 'bounce', 'fade', 'slide'
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(height)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#10b981', bgColor: '#d1fae5' };
      case 'error':
        return { name: 'close-circle', color: '#ef4444', bgColor: '#fee2e2' };
      case 'info':
        return { name: 'information', color: '#3b82f6', bgColor: '#dbeafe' };
      default:
        return { name: 'alert', color: '#f59e0b', bgColor: '#fed7aa' };
    }
  };

  const iconConfig = getIconConfig();

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      animateIn();
    } else {
      animateOut();
    }
  }, [visible]);

  const animateIn = () => {
    if (animationType === 'spring') {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          damping: 12,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => setIsAnimating(false));
    } else if (animationType === 'bounce') {
      Animated.sequence([
        Animated.spring(scaleValue, {
          toValue: 1.1,
          damping: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          damping: 15,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsAnimating(false));
    } else if (animationType === 'slide') {
      Animated.parallel([
        Animated.spring(slideValue, {
          toValue: 0,
          damping: 15,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsAnimating(false));
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsAnimating(false));
    }
  };

  const animateOut = () => {
    if (animationType === 'slide') {
      Animated.parallel([
        Animated.timing(slideValue, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        scaleValue.setValue(0);
        rotateValue.setValue(0);
      });
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        scaleValue.setValue(0);
        rotateValue.setValue(0);
      });
    }
  };

  const getAnimatedStyle = () => {
    if (animationType === 'slide') {
      return {
        transform: [{ translateY: slideValue }],
        opacity: opacityValue,
      };
    }
    return {
      transform: [
        { scale: scaleValue },
        {
          rotate: rotateValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '-5deg', '0deg'],
          }),
        },
      ],
      opacity: opacityValue,
    };
  };

  const handleConfirm = () => {
    if (!isAnimating) {
      onConfirm?.();
    }
  };

  const handleCancel = () => {
    if (!isAnimating) {
      onCancel?.();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Pressable style={styles.backdrop} onPress={handleCancel} />
        <Animated.View style={[styles.alertContainer, getAnimatedStyle()]}>
          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  {
                    scale: rotateValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: iconConfig.bgColor }]}>
              <MaterialCommunityIcons name={iconConfig.name} size={40} color={iconConfig.color} />
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{title || 'Confirmation'}</Text>

          {/* Message */}
          <Text style={styles.message}>{message || 'Are you sure you want to proceed?'}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {cancelText && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
            )}
            {confirmText && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  type === 'warning' && styles.warningButton,
                  type === 'error' && styles.errorButton,
                  type === 'success' && styles.successButton,
                ]}
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>{confirmText || 'Confirm'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    width: width,
    height: height,
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#6b7280',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
  },
  errorButton: {
    backgroundColor: '#ef4444',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;