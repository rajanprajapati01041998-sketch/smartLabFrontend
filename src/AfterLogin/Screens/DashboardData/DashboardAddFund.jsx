import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from '../../../utils/InputStyle'
import tw from 'twrnc'
import { useTheme } from '../../../../Authorization/ThemeContext'
import { useToast } from '../../../../Authorization/ToastContext'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'


const DashboardAddFund = () => {
  const [amount, setAmount] = useState(null)
  const [remarks, setRemarks] = useState(null)
  const [error, setError] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    setTimeout(() => {
      setError(false)
    }, 5000)
  }, [error])

  const handleContinuePayment = async () => {
    if (!amount) {
      setError(true)
      return
    }
    try {

    } catch (error) {

    } finally {
      setError(false)
    }
  }

  return (
    <View style={tw`flex flex-col gap-2`}>
      <View>
        <Text style={styles.labelText} >Enter Amount</Text>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(text)}
          style={styles.inputBox}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>
      <View>
        <Text style={styles.labelText} >Enter Remarks</Text>
        <TextInput
          value={remarks}
          onChangeText={(text) => setRemarks(text)}
          style={styles.inputBox}
          maxLength={50}

        />
      </View>
      {error && <View style={tw`bg-red-200 p-2 rounded-lg flex flex-row justify-between`}>
        <Text style={styles.errorText}>Enter Amount</Text>
        <TouchableOpacity style={tw`bg-red-100 p-1.6 rounded-full border border-red-300`}>
          <Icon onPress={() => setError(false)} name='close' />
        </TouchableOpacity>
      </View>}
      <View style={[tw`flex flex-row justify-end`]}>
        <TouchableOpacity
          onPress={() => handleContinuePayment()}
          style={[styles.saveButton]}>
          <Text style={[styles.saveButtonText]}>Continue</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

export default DashboardAddFund