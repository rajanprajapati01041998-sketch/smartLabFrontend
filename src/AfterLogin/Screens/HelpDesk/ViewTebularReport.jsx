import React, { useCallback, useState } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import RNFetchBlob from 'react-native-blob-util'
import Pdf from 'react-native-pdf'
import tw from 'twrnc'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import api from '../../../../Authorization/api'

const TRF_Print = () => {
  const route = useRoute()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pdfPath, setPdfPath] = useState('')

  const FTId = route?.params?.item?.FTId

  // ✅ SAVE BASE64 PDF TO FILE
  const savePdfFile = async (base64Data, fileName = 'TRF.pdf') => {
  try {
    const cleanBase64 = String(base64Data || '').replace(
      /^data:application\/pdf;base64,/,
      ''
    );

    if (!cleanBase64) {
      setError(true);
      return;
    }

    if (!RNFetchBlob?.fs?.dirs) {
      console.log('RNFetchBlob native module not linked');
      setError(true);
      return;
    }

    const safeName = fileName.replace(/[\/\\:*?"<>|]/g, '_');

    const dir =
      Platform.OS === 'ios'
        ? RNFetchBlob.fs.dirs.DocumentDir
        : RNFetchBlob.fs.dirs.CacheDir;

    const filePath = `${dir}/${safeName}`;

    await RNFetchBlob.fs.writeFile(filePath, cleanBase64, 'base64');

    setPdfPath(filePath);
  } catch (error) {
    console.log('savePdfFile error:', error);
    setError(true);
  }
};

  // ✅ CALL YOUR TRF API
  const getReport = async () => {
    try {
      setLoading(true)
      setError(false)
      setPdfPath('')

      const response = await api.get(
        `Patient/test-requisition-form?filter=${FTId}&mode=view`
      )

      console.log('TRF RESPONSE:', response?.data)

      const base64Pdf = response?.data?.base64
      const fileName = response?.data?.fileName || 'TRF.pdf'

      if (!base64Pdf || typeof base64Pdf !== 'string') {
        setError(true)
        return
      }

      await savePdfFile(base64Pdf, fileName)
    } catch (err) {
      console.log('TRF error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // ✅ AUTO LOAD ON SCREEN FOCUS
  useFocusEffect(
    useCallback(() => {
      if (FTId) {
        getReport()
      }
      return () => {}
    }, [FTId])
  )

  // ================= UI =================

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={tw`mt-3 text-gray-600 font-medium`}>
          Loading TRF...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white px-6`}>
        <MaterialCommunityIcons name="file-pdf-box" size={80} color="#ef4444" />

        <Text style={tw`mt-4 text-lg font-semibold text-gray-800`}>
          Unable to load TRF
        </Text>

        <Text style={tw`mt-2 text-sm text-gray-500 text-center`}>
          PDF is not showing properly. Please try again.
        </Text>

        <TouchableOpacity
          onPress={getReport}
          style={tw`mt-6 bg-blue-600 px-6 py-3 rounded-xl flex-row items-center`}
        >
          <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
          <Text style={tw`text-white font-semibold ml-2`}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!pdfPath) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <MaterialCommunityIcons name="file-pdf-box" size={70} color="#9ca3af" />
        <Text style={tw`mt-3 text-gray-500`}>No PDF available</Text>
      </View>
    )
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <Pdf
        source={{ uri: `file://${pdfPath}`, cache: true }}
        style={tw`flex-1`}
        trustAllCerts={false}
        enablePaging={true}
        horizontal={false}
        spacing={8}
        onLoadComplete={(pages) => {
          console.log('PDF Loaded Pages:', pages)
        }}
        onPageChanged={(page, pages) => {
          console.log('Page:', page, '/', pages)
        }}
        onError={(err) => {
          console.log('PDF error:', err)
          setError(true)
        }}
      />
    </View>
  )
}

export default TRF_Print