import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from '../../../utils/InputStyle'
import tw from 'twrnc'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useToast } from '../../../../Authorization/ToastContext'
import Razorpay from './RazorPay'
import { useAuth } from '../../../../Authorization/AuthContext'
import api from '../../../../Authorization/api'
import { useDash } from '../../../../Authorization/DashContext'
import { useTheme } from '../../../../Authorization/ThemeContext'
import { getThemeStyles } from '../../../utils/themeStyles'

const DashboardAddFund = ({ onClose, onPaymentSuccess }) => {
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currency] = useState('INR')
  const [paymentMode] = useState('Online')
  const [paymentModeId] = useState(1)
  const [receipt] = useState(null)

  const { showToast } = useToast()
  const { loginBranchId, userId, hosId } = useAuth()
  const { dashboardWallet, getAllDashboardPaymentHistory } = useDash()

  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const { theme } = useTheme()
  const themed = getThemeStyles(theme)

  const razorpayRef = useRef(null)

  useEffect(() => {
    if (!fromDate || !toDate) {
      const today = new Date().toISOString().split('T')[0]
      setFromDate(today)
      setToDate(today)
    }
  }, [fromDate, toDate])

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      setError(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [error])

  const handleAmountChange = text => {
    const cleaned = text.replace(/[^0-9.]/g, '')
    const dotCount = (cleaned.match(/\./g) || []).length

    if (dotCount > 1) return
    setAmount(cleaned)
  }

  const numericAmount = useMemo(() => {
    const parsed = Number(amount)
    return Number.isFinite(parsed) ? parsed : 0
  }, [amount])

  const resolvedHospId = Number(hosId || 0)
  const resolvedBranchId = Number(loginBranchId || 0)
  const resolvedUserId = Number(userId || 0)

  const paymentPayload = useMemo(() => {
    return {
      hospId: resolvedHospId,
      branchId: resolvedBranchId,
      clientId: resolvedBranchId,
      paymentModeId: Number(paymentModeId),
      createdBy: resolvedUserId,
      amount: numericAmount,
      currency,
      paymentMode,
      receipt,
      remarks: remarks?.trim() || null,
    }
  }, [
    resolvedHospId,
    resolvedBranchId,
    resolvedUserId,
    paymentModeId,
    numericAmount,
    currency,
    paymentMode,
    receipt,
    remarks,
  ])

  const getMissingFields = () => {
    const missing = []

    if (!paymentPayload.hospId || paymentPayload.hospId <= 0) {
      missing.push('HospId')
    }

    if (!paymentPayload.branchId || paymentPayload.branchId <= 0) {
      missing.push('BranchId')
    }

    if (!paymentPayload.clientId || paymentPayload.clientId <= 0) {
      missing.push('ClientId')
    }

    if (!paymentPayload.paymentModeId || paymentPayload.paymentModeId <= 0) {
      missing.push('PaymentModeId')
    }

    if (!paymentPayload.createdBy || paymentPayload.createdBy <= 0) {
      missing.push('CreatedBy')
    }

    return missing
  }

  const handleContinuePayment = async () => {
    if (!amount || numericAmount <= 0) {
      setError(true)
      showToast?.('Enter valid amount', 'error')
      return
    }

    const missingFields = getMissingFields()
    if (missingFields.length > 0) {
      console.log('Invalid payment payload:', paymentPayload)
      showToast?.(`${missingFields.join(', ')} missing`, 'error')
      return
    }

    if (razorpayRef.current?.isLoading) return

    setLoading(true)
    setError(false)

    try {
      await razorpayRef.current?.payNow()
    } catch (err) {
      console.log('handleContinuePayment error:', err)
      showToast?.('Payment failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  console.log('payment payload =>', paymentPayload)

  return (
    <View style={[themed.childScreen, tw`flex flex-col gap-2`]}>
      <Razorpay
        ref={razorpayRef}
        apiBaseUrl={api}
        payload={paymentPayload}
        customer={{
          name: '',
          email: '',
          contact: '',
        }}
        onSuccess={async data => {
          try {
            console.log('Payment success:', data)

            showToast?.(
              data?.message || 'Payment successful and saved in database.',
              'success'
            )

            setAmount('')
            setRemarks('')

            await dashboardWallet(resolvedBranchId)
            await getAllDashboardPaymentHistory({
              loginBranchId: resolvedBranchId,
              fromDate,
              toDate,
            })

            onPaymentSuccess?.(data)
            onClose?.()
          } catch (err) {
            console.log('onSuccess callback error:', err)
            showToast?.('Payment successful, but refresh failed', 'error')
          }
        }}
        onFailure={failure => {
          console.log('Payment failed:', failure)

          if (failure?.isChecking) {
            showToast?.('Checking payment status...', 'info')
            return
          }

          if (failure?.isCancelled) {
            showToast?.('Payment cancelled', 'error')
            return
          }

          showToast?.(
            failure?.message || 'Payment failed',
            'error'
          )
        }}
      />

      <View>
        <Text style={[themed.labelText, tw`my-2`]}>Enter Amount</Text>
        <TextInput
          value={amount}
          onChangeText={handleAmountChange}
          style={[themed.inputBox, themed.inputText]}
          keyboardType="numeric"
          maxLength={10}
          placeholder="Enter amount"
          placeholderTextColor={themed.inputPlaceholder}
        />
      </View>

      <View>
        <Text style={[themed.labelText, tw`my-2`]}>Enter Remarks</Text>
        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          style={[themed.inputBox, themed.inputText]}
          maxLength={50}
          placeholder="Enter remarks"
          placeholderTextColor={themed.inputPlaceholder}
        />
      </View>

      {error && (
        <View style={tw`bg-red-200 p-2 rounded-lg flex flex-row justify-between items-center`}>
          <Text style={themed.errorText}>Enter valid amount</Text>
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