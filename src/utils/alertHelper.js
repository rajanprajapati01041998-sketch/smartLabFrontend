// src/utils/alertHelper.js
import { Alert } from 'react-native';

// Fallback to native alert if needed
export const showNativeAlert = ({ onConfirm, onCancel, title, message }) => {
  Alert.alert(
    title || 'Logout Confirmation',
    message || 'Are you sure you want to logout?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true },
  );
};

// This can be used as a bridge if you want to keep the same API
export const createAlertShower = (showCustomAlert) => {
  return ({ onConfirm, onCancel, title, message }) => {
    showCustomAlert({
      title: title || 'Logout Confirmation',
      message: message || 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm,
      onCancel,
    });
  };
};