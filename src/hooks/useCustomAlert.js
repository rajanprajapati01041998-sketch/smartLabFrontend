// src/hooks/useCustomAlert.js
import { useState, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: '',
    cancelText: '',
    type: 'warning',
    animationType: 'spring',
  });

  const showCustomAlert = useCallback((config) => {
    setAlertConfig({
      visible: true,
      title: config.title || 'Confirmation',
      message: config.message || 'Are you sure you want to proceed?',
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText !== undefined ? config.cancelText : 'Cancel',
      type: config.type || 'warning',
      animationType: config.animationType || 'spring',
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const AlertComponent = useCallback(() => (
    <CustomAlert
      visible={alertConfig.visible}
      onConfirm={() => {
        alertConfig.onConfirm?.();
        hideAlert();
      }}
      onCancel={() => {
        alertConfig.onCancel?.();
        hideAlert();
      }}
      title={alertConfig.title}
      message={alertConfig.message}
      confirmText={alertConfig.confirmText}
      cancelText={alertConfig.cancelText}
      type={alertConfig.type}
      animationType={alertConfig.animationType}
    />
  ), [alertConfig, hideAlert]);

  return { showCustomAlert, AlertComponent, hideAlert };
};