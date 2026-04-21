import React, { useCallback, useState } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import RNFetchBlob from 'react-native-blob-util'
import Pdf from 'react-native-pdf'
import tw from 'twrnc'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import api from '../../../../Authorization/api'
import { useAuth } from '../../../../Authorization/AuthContext'

const ViewLabReport = () => {
  const { loginBranchId, userId ,mainBranchId} = useAuth()
  const route = useRoute()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pdfPath, setPdfPath] = useState('')

  const ptInvstId = route?.params?.patientInvestigationId
  const branchId = route?.params?.loginHeader === true ? loginBranchId : 0
console.log("teblur",route?.params);

  const isPrintValue = route?.params?.isPrintHeader ? 1 : 0
  const mainClientId =
    route?.params?.mainHeader === true  ? mainBranchId : 0 

  const patientInvestigationId =
    route?.params?.item?.PatientInvestigationId || ptInvstId

  const savePdfFile = async (base64Data) => {
    const cleanBase64 = String(base64Data || '').replace(
      /^data:application\/pdf;base64,/,
      ''
    )

    const fileName = `report_${Date.now()}.pdf`
    const dir =
      Platform.OS === 'ios'
        ? RNFetchBlob.fs.dirs.DocumentDir
        : RNFetchBlob.fs.dirs.CacheDir

    const filePath = `${dir}/${fileName}`

    await RNFetchBlob.fs.writeFile(filePath, cleanBase64, 'base64')
    setPdfPath(filePath)
  }

  const getReport = async () => {
    try {
      setLoading(true)
      setError(false)
      setPdfPath('')

      const payload = {
        PatientInvestigationIdList: patientInvestigationId,
        isHeaderPNG: isPrintValue,
        PrintBy: userId,
        branchId:branchId,
        clientId: mainClientId,
        ViewReport: true
      }
      console.log("mainclientId", mainClientId)
      console.log('API PAYLOAD:', payload)

      const response = await api.get('DeltaReport/download-delta-report', {
        params: payload
      })

      // console.log('API RESPONSE:', response?.data)

      const base64Pdf = response?.data?.pdfBase64

      if (!base64Pdf || typeof base64Pdf !== 'string') {
        // console.log('Invalid pdfBase64:', base64Pdf)
        setError(true)
        return
      }

      // console.log('PDF BASE64 LENGTH:', base64Pdf.length)

      await savePdfFile(base64Pdf)
    } catch (err) {
      // console.log('getReport error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getReport()
      return () => { }
    }, [ptInvstId, branchId])
  )

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={tw`mt-3 text-gray-600 font-medium`}>
          Loading report...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white px-6`}>
        <MaterialCommunityIcons name="file-pdf-box" size={80} color="#ef4444" />
        <Text style={tw`mt-4 text-lg font-semibold text-gray-800`}>
          Unable to load report
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
        onLoadComplete={(numberOfPages, filePath) => {
          console.log('PDF loaded. Pages:', numberOfPages)
          console.log('File path:', filePath)
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log('Current page:', page, 'of', numberOfPages)
        }}
        onError={(err) => {
          console.log('PDF render error:', err)
          setError(true)
        }}
      />
    </View>
  )
}

export default ViewLabReport