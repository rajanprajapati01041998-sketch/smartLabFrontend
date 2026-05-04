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
    processing: false,
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
      processing: false,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false, processing: false }));
  }, []);

  const AlertComponent = useCallback(() => (
    <CustomAlert
      visible={alertConfig.visible}
      disabled={alertConfig.processing}
      onConfirm={async () => {
        if (alertConfig.processing) return;
        setAlertConfig(prev => ({ ...prev, processing: true }));
        try {
          await alertConfig.onConfirm?.();
          hideAlert();
        } finally {
          // If consumer didn't close it (e.g., throws), re-enable buttons.
          setAlertConfig(prev =>
            prev.visible ? { ...prev, processing: false } : prev
          );
        }
      }}
      onCancel={async () => {
        if (alertConfig.processing) return;
        setAlertConfig(prev => ({ ...prev, processing: true }));
        try {
          await alertConfig.onCancel?.();
          hideAlert();
        } finally {
          setAlertConfig(prev =>
            prev.visible ? { ...prev, processing: false } : prev
          );
        }
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
