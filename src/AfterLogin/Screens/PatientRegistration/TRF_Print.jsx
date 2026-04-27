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
import api from '../../../../Authorization/api';
import RNFetchBlob from 'react-native-blob-util';
import Pdf from 'react-native-pdf';
import tw from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useToast } from '../../../../Authorization/ToastContext';

const TRF_Print = () => {
    const route = useRoute();
    const { item } = route.params || {};
    const { showToast } = useToast()
    const ftId = item?.FTId || item?.ftId || item?.FTID;

    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [pdfPath, setPdfPath] = useState('');
    const [error, setError] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (ftId) {
                getPdf(ftId);
            }

            return () => { };
        }, [ftId])
    );

    const getPdf = async (id) => {
        try {
            setLoading(true);
            setError(false);
            setPdfPath('');

            const response = await api.get(
                `Patient/test-requisition-form?filter=${id}&mode=view`
            );

            const base64 = response?.data?.base64;
            const fileName = response?.data?.fileName || `TRF_${id}.pdf`;

            if (!base64) {
                setError(true);
                return;
            }

            const cleanBase64 = String(base64).replace(
                /^data:application\/pdf;base64,/,
                ''
            );

            const safeName = fileName.replace(/[\/\\:*?"<>|]/g, '_');

            const dir =
                Platform.OS === 'android'
                    ? RNFetchBlob.fs.dirs.CacheDir
                    : RNFetchBlob.fs.dirs.DocumentDir;

            const path = `${dir}/${safeName}`;

            await RNFetchBlob.fs.writeFile(path, cleanBase64, 'base64');

            setPdfPath(path);
        } catch (err) {
            console.log('view pdf error:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = async () => {
        try {
            if (!ftId) {
                Alert.alert('Error', 'FTId not found');
                return;
            }

            setDownloading(true);

            const safeName = `TRF_${ftId}.pdf`;

            const path =
                Platform.OS === 'android'
                    ? `${RNFetchBlob.fs.dirs.DownloadDir}/${safeName}`
                    : `${RNFetchBlob.fs.dirs.DocumentDir}/${safeName}`;

            const url = `${api.defaults.baseURL}Patient/test-requisition-form?filter=${ftId}&mode=pdf`;

            const res = await RNFetchBlob.config({
                fileCache: true,
                path,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: false, // ✅ hide top download notification
                    path,
                    title: safeName,
                    description: 'TRF PDF downloaded',
                    mime: 'application/pdf',
                    mediaScannable: true,
                },
            }).fetch('GET', url);

            showToast('PDF downloaded successfully', 'success');
        } catch (err) {
            console.log('download error:', err);
            showToast('Download failed', 'error');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <View style={tw`flex-1 items-center justify-center bg-white`}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={tw`mt-3 text-gray-600 font-medium`}>
                    Loading PDF...
                </Text>
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
                    onPress={() => getPdf(ftId)}
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
                style={tw`flex-2`}
                trustAllCerts={false}
                enablePaging={true}
                horizontal={false}
                spacing={1}
                onError={(e) => {
                    console.log('PDF render error:', e);
                    setError(true);
                }}
            />

            <TouchableOpacity
                onPress={downloadPdf}
                disabled={downloading}
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

export default TRF_Print;