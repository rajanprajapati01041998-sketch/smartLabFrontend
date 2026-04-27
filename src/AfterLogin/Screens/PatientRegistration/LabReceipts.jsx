import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import RNFetchBlob from 'react-native-blob-util';
import Pdf from 'react-native-pdf';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import api from '../../../../Authorization/api';
import { useAuth } from '../../../../Authorization/AuthContext';
import { useToast } from '../../../../Authorization/ToastContext';

const LabReceipts = () => {
  const route = useRoute();
  const { item } = route.params || {};

  const { userId } = useAuth();
  const { showToast } = useToast();

  const ftId = item?.FTId || item?.FTID || item?.ftId;
  const receiptId = item?.ReceiptID || item?.ReceiptId || item?.receiptId;
  const patientName = item?.PatientName || 'Patient';

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [pdfPath, setPdfPath] = useState('');
  const [error, setError] = useState(false);

  const makeSafeName = name =>
    String(name || 'Receipt')
      .replace(/[\/\\:*?"<>|]/g, '_')
      .replace(/\s+/g, '_');

  const getPdf = async () => {
    try {
      setLoading(true);
      setError(false);
      setPdfPath('');

      const response = await api.get(
        `ReceiptBill/details-bill?ftId=${ftId}&receiptId=${receiptId}&printUserId=${userId}&isReceipt=true&mode=view`,
      );

      const base64 = response?.data?.base64;
      const fileName =
        response?.data?.fileName ||
        `DetailsBill_${makeSafeName(patientName)}_${ftId}.pdf`;

      if (!response?.data?.status || !base64) {
        setError(true);
        return;
      }

      const cleanBase64 = String(base64).replace(
        /^data:application\/pdf;base64,/,
        '',
      );

      const safeName = makeSafeName(fileName).endsWith('.pdf')
        ? makeSafeName(fileName)
        : `${makeSafeName(fileName)}.pdf`;

      const dir =
        Platform.OS === 'android'
          ? RNFetchBlob.fs.dirs.CacheDir
          : RNFetchBlob.fs.dirs.DocumentDir;

      const path = `${dir}/${safeName}`;

      await RNFetchBlob.fs.writeFile(path, cleanBase64, 'base64');

      setPdfPath(path);
    } catch (err) {
      console.log('Receipt view pdf error:', err?.response?.data || err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      if (!ftId || !receiptId || !userId) {
        Alert.alert('Error', 'FTId, ReceiptId or UserId not found');
        return;
      }

      setDownloading(true);

      const safeName = `Receipt_${makeSafeName(patientName)}_${ftId}.pdf`;

      const downloadPath =
        Platform.OS === 'android'
          ? `${RNFetchBlob.fs.dirs.DownloadDir}/${safeName}`
          : `${RNFetchBlob.fs.dirs.DocumentDir}/${safeName}`;

      const baseUrl = api.defaults.baseURL?.endsWith('/')
        ? api.defaults.baseURL
        : `${api.defaults.baseURL}/`;

      const url =
        `${baseUrl}ReceiptBill/details-bill` +
        `?ftId=${ftId}` +
        `&receiptId=${receiptId}` +
        `&printUserId=${userId}` +
        `&isReceipt=true` +
        `&mode=pdf`;

      console.log('Receipt download URL:', url);

      const res = await RNFetchBlob.config({
        fileCache: true,
        path: downloadPath,
        appendExt: 'pdf',
        addAndroidDownloads:
          Platform.OS === 'android'
            ? {
                useDownloadManager: true,
                notification: true,
                path: downloadPath,
                title: safeName,
                description: 'Receipt PDF downloaded',
                mime: 'application/pdf',
                mediaScannable: true,
              }
            : undefined,
      }).fetch('GET', url, {
        Accept: 'application/pdf',
      });

      const status = res.info()?.status;

      if (status && status >= 400) {
        throw new Error(`Download failed with status ${status}`);
      }

      showToast('PDF downloaded successfully', 'success');
      console.log('Downloaded path:', res.path());
    } catch (err) {
      console.log('Receipt download error:', err);
      showToast('Download failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (ftId && receiptId && userId) {
        getPdf();
      } else {
        setLoading(false);
        setError(true);
      }

      return () => {};
    }, [ftId, receiptId, userId]),
  );

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={tw`mt-3 text-gray-600 font-medium`}>Loading PDF...</Text>
      </View>
    );
  }

  if (error || !pdfPath) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white px-6`}>
        <MaterialCommunityIcons name="file-pdf-box" size={80} color="#ef4444" />

        <Text style={tw`mt-4 text-lg font-semibold text-gray-800`}>
          Unable to load PDF
        </Text>

        <TouchableOpacity
          onPress={getPdf}
          style={tw`mt-5 bg-blue-600 px-6 py-3 rounded-xl`}
        >
          <Text style={tw`text-white font-semibold`}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <Pdf
        source={{ uri: `file://${pdfPath}`, cache: true }}
        style={tw`flex-1`}
        trustAllCerts={false}
        enablePaging
        horizontal={false}
        spacing={1}
        onError={e => {
          console.log('Receipt PDF render error:', e);
          setError(true);
        }}
      />

      <TouchableOpacity
        onPress={downloadPdf}
        disabled={downloading}
        activeOpacity={0.8}
        style={tw`absolute bottom-5 right-5 bg-blue-600 p-4 rounded-full shadow-lg`}
      >
        {downloading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <MaterialCommunityIcons name="download" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LabReceipts;