import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import styles from '../../../utils/InputStyle'
import tw from 'twrnc'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useToast } from '../../../../Authorization/ToastContext'

import { dashboardWallet } from '../../../utils/dashboardService/dashboard'
import Razorpay from './RazorPay'
import { useAuth } from '../../../../Authorization/AuthContext'
import api from '../../../../Authorization/api'

const DashboardAddFund = ({ onClose, onPaymentSuccess }) => {
  const [amount, setAmount] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currency] = useState('INR')
  const [paymentMode] = useState('Online')
  const [paymentModeId] = useState(1)
  const [receipt] = useState(null)

  const { showToast } = useToast()
  const { loginBranchId, userId, hosId, triggerUpdate, updateFlag } = useAuth()
  console.log(loginBranchId, userId, hosId)

  const razorpayRef = useRef(null)

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      setError(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [error])

  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, '')
    const dotCount = (cleaned.match(/\./g) || []).length
    if (dotCount > 1) return
    setAmount(cleaned)
  }

  const handleContinuePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      setError(true)
      showToast?.('Enter valid amount', 'error')
      return
    }

    if (razorpayRef.current?.isLoading) return

    setLoading(true)
    setError(false)

    try {
      await razorpayRef.current?.payNow()
    } catch (err) {
      console.log('handleContinuePayment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const paymentPayload = {
    hospId: hosId,
    branchId: loginBranchId,
    clientId: loginBranchId,
    paymentModeId: paymentModeId,
    createdBy: userId,
    amount: amount,
    currency,
    paymentMode,
    receipt,
    remarks,
  }

  console.log("payment payload", paymentPayload)

  return (
    <View style={tw`flex flex-col gap-2`}>
      <Razorpay
        ref={razorpayRef}
        apiBaseUrl={api}
        payload={paymentPayload}
        customer={{
          name: '',
          email: '',
          contact: '',
        }}
        onSuccess={async (data) => {
          try {
            showToast?.('Payment successful', 'success')
            setAmount('')
            setRemarks('')
            // triggerUpdate?.()
            const response = await dashboardWallet?.(loginBranchId)
            console.log("wallet",response)
            onClose?.()
          } catch (err) {
            console.log('onSuccess callback error:', err)
            showToast?.('Payment done, but wallet refresh failed', 'error')
          }
        }}
        onFailure={(error) => {
          console.log('Payment failed:', error)

          const errorMessage =
            error?.message ||
            error?.detail ||
            error?.description ||
            error?.error?.description ||
            error?.raw ||
            'Payment cancelled or failed'

          showToast?.(String(errorMessage), 'error')
        }}
      />

      <View>
        <Text style={styles.labelText}>Enter Amount</Text>
        <TextInput
          value={amount}
          onChangeText={handleAmountChange}
          style={styles.inputBox}
          keyboardType="numeric"
          maxLength={10}
          placeholder="Enter amount"
        />
      </View>

      <View>
        <Text style={styles.labelText}>Enter Remarks</Text>
        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          style={styles.inputBox}
          maxLength={50}
          placeholder="Enter remarks"
        />
      </View>

      {error && (
        <View
          style={tw`bg-red-200 p-2 rounded-lg flex flex-row justify-between items-center`}
        >
          <Text style={styles.errorText}>Enter valid amount</Text>
          <TouchableOpacity
            onPress={() => setError(false)}
            style={tw`bg-red-100 p-1.5 rounded-full border border-red-300`}
          >
            <Icon name="close" size={16} />
          </TouchableOpacity>
        </View>
      )}

      <View style={tw`flex flex-row justify-end`}>
        <TouchableOpacity
          onPress={handleContinuePayment}
          style={[styles.saveButton, loading && tw`opacity-70`]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default DashboardAddFund