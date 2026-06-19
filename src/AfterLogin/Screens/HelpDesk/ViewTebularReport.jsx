import React, { useCallback, useState } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Pdf from 'react-native-pdf'
import RNFS from 'react-native-fs'
import api, { API_BASE_URL } from '../../../../Authorization/api'
import { useAuth } from '../../../../Authorization/AuthContext'
import { useTheme } from '../../../../Authorization/ThemeContext'
import tw from 'twrnc'

const ViewTebularReport = ({ route, navigation }) => {
  const { item, isPrintHeader, loginHeader, mainHeader } = route.params || {};
  const { theme } = useTheme()

  const [loading, setLoading] = useState(false)
  const [pdfPath, setPdfPath] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const { userId, loginBranchId } = useAuth()
  // console.log('ViewTebularReport received params:', { item: item?.PatientInvestigationId, isPrintHeader, loginHeader, mainHeader, userId, loginBranchId })
  // console.log('API Base URL:', loginBranchId, userId)

  const getTebularReport = async () => {
    // console.log('PatientInvestigationId:', item?.PatientInvestigationId);
    // console.log('isPrintHeader:', isPrintHeader);
    // console.log('userId:', userId);
    // console.log('loginBranchId:', loginBranchId);
    // console.log('main:', mainHeader);
    try {
      setLoading(true)
      setErrorMessage('')
      setPdfPath(null)
      // console.log("isprint headre", isPrintHeader)
      // http://103.217.247.236/LabApp/api/DeltaReport/download-delta-report?PatientInvestigationIdList=10352&isHeaderPNG=0&PrintBy=1&branchId=1&ViewReport=true
      const response = await api.get(
        `DeltaReport/download-delta-report?PatientInvestigationIdList=${item?.
          PatientInvestigationId}&isHeaderPNG=${isPrintHeader ? 1 : 0
        }&PrintBy=${userId}&branchId=${mainHeader ? 1 : loginBranchId}&ViewReport=true`,
      );

      console.log('API response for Tebular Report:', response?.data)
      const base64Pdf = response?.data?.pdfBase64
      if (!base64Pdf) {
        setErrorMessage('PDF base64 not found in API response')
        return
      }

      const filePath = `${RNFS.DocumentDirectoryPath}/DeltaReport_${item?.PatientInvestigationId}.pdf`

      await RNFS.writeFile(filePath, base64Pdf, 'base64')

      setPdfPath(`file://${filePath}`)
    } catch (error) {
      console.log('Error fetching Tebular Report:', error?.response || error)
      setErrorMessage('Failed to load PDF')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      const loadReport = async () => {
        await getTebularReport();
      };

      loadReport();

      return () => {
        console.log('Screen Unfocused');
      };
    }, [
      item?.PatientInvestigationId,
      isPrintHeader,
      userId,
      loginBranchId,
    ])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={[tw`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`]}>Loading report...</Text>
      </View>
    )
  }

  if (errorMessage) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>{errorMessage}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {pdfPath ? (
        <Pdf
          source={{ uri: pdfPath, cache: true }}
          style={{ flex: 1, width: '100%', height: '100%' }}
          onLoadComplete={(numberOfPages) => {
            console.log(`PDF loaded. Pages: ${numberOfPages}`)
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}/${numberOfPages}`)
          }}
          onError={(error) => {
            console.log('PDF render error:', error)
            setErrorMessage('Unable to display PDF')
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`)
          }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No PDF to display</Text>
        </View>
      )}
    </View>
  )
}

export default ViewTebularReport