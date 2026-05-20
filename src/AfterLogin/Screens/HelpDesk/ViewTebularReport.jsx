import React, { useCallback, useState } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Pdf from 'react-native-pdf'
import RNFS from 'react-native-fs'
import api from '../../../../Authorization/api'
import { useAuth } from '../../../../Authorization/AuthContext'

const ViewTebularReport = ({ route, navigation }) => {
  const { item, isPrintHeader, loginHeader, mainHeader } = route.params || {};
  console.log('ViewTebularReport received params:', { item: item?.PatientInvestigationId, isPrintHeader, loginHeader, mainHeader })

  const [loading, setLoading] = useState(false)
  const [pdfPath, setPdfPath] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const {userId,loginBranchId}=useAuth()

  const getTebularReport = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      setPdfPath(null)

      const response = await api.get(`DeltaReport/download-delta-report?PatientInvestigationIdList=${item?.PatientInvestigationId}&isHeaderPNG=${isPrintHeader}&PrintBy=${userId}&branchId=${loginBranchId}&ViewReport=true`
      )

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
      getTebularReport()

      return () => {
        console.log('ViewTebularReport screen is unfocused')
      }
    }, [])
  )

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading report...</Text>
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