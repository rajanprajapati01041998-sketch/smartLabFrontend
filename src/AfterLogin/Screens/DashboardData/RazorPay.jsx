import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react'
import {
  Alert,
  NativeModules,
  Platform,
} from 'react-native'
import RazorpayCheckout from 'react-native-razorpay'

const Razorpay = forwardRef(
  (
    {
      apiBaseUrl,
      payload,
      customer = {},
      onSuccess,
      onFailure,
    },
    ref
  ) => {
    const [loading, setLoading] = useState(false)

    const parseResponseSafe = async (response) => {
      const text = await response.text()
      try {
        return JSON.parse(text)
      } catch {
        return { raw: text }
      }
    }

    const normalizeApiBaseUrl = (value) => {
      if (!value) return ''

      if (typeof value === 'string') {
        return value.trim()
      }

      const axiosBaseUrl = value?.defaults?.baseURL
      if (typeof axiosBaseUrl === 'string') {
        return axiosBaseUrl.trim()
      }

      return String(value).trim()
    }

    const buildApiUrl = (base, pathWithoutLeadingSlash) => {
      const trimmed = base.replace(/\/+$/, '')
      return `${trimmed}/${pathWithoutLeadingSlash.replace(/^\/+/, '')}`
    }

    const assertRazorpayNativeModuleAvailable = () => {
      if (NativeModules?.RNRazorpayCheckout) return

      const platformHint =
        Platform.OS === 'android'
          ? 'Rebuild and reinstall the Android app after installing react-native-razorpay.'
          : 'Run pod install and rebuild the iOS app.'

      throw new Error(
        `Razorpay native module not found. ${platformHint}`
      )
    }

    const payNow = async (customPayload = null) => {
      if (loading) return

      const finalPayload = customPayload || payload
      const resolvedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl)

      if (!resolvedApiBaseUrl) {
        Alert.alert('Error', 'API Base URL is missing')
        return
      }

      if (!finalPayload?.amount || Number(finalPayload?.amount) <= 0) {
        Alert.alert('Error', 'Amount is missing')
        return
      }

      setLoading(true)

      try {
        assertRazorpayNativeModuleAvailable()

        const createOrderUrl = buildApiUrl(
          resolvedApiBaseUrl,
          'payment/create-order'
        )

        const verifyPaymentUrl = buildApiUrl(
          resolvedApiBaseUrl,
          'payment/verify-payment'
        )

        const createOrderPayload = {
          hospId: Number(finalPayload?.hospId || 0),
          branchId: Number(finalPayload?.branchId || 0),
          clientId: Number(finalPayload?.clientId || 0),
          paymentModeId: Number(finalPayload?.paymentModeId || 0),
          createdBy: Number(finalPayload?.createdBy || 0),
          amount: Number(finalPayload?.amount || 0),
          currency: finalPayload?.currency || 'INR',
          paymentMode: finalPayload?.paymentMode || 'Online',
          receipt: finalPayload?.receipt || null,
          remarks: finalPayload?.remarks?.trim()
            ? finalPayload.remarks.trim()
            : null,
        }

        console.log('resolvedApiBaseUrl:', resolvedApiBaseUrl)
        console.log('createOrderUrl:', createOrderUrl)
        console.log('verifyPaymentUrl:', verifyPaymentUrl)
        console.log('Creating order...', createOrderPayload)

        let createOrderResponse
        let createOrderData

        try {
          createOrderResponse = await fetch(createOrderUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(createOrderPayload),
          })

          createOrderData = await parseResponseSafe(createOrderResponse)
        } catch (fetchError) {
          console.log('Create order fetch failed:', fetchError)
          Alert.alert(
            'Network Error',
            'Could not connect to create-order API'
          )
          onFailure?.({
            message: 'Create order API failed',
            raw: String(fetchError),
          })
          return
        }

        console.log('Create Order Response:', createOrderData)

        if (!createOrderResponse.ok) {
          Alert.alert(
            'Create Order Failed',
            createOrderData?.message ||
              createOrderData?.detail ||
              'Unable to create order'
          )
          onFailure?.(createOrderData)
          return
        }

        const options = {
          description: 'Add Fund Payment',
          currency: String(createOrderData?.currency || 'INR'),
          key: String(createOrderData?.key || ''),
          amount: String(createOrderData?.amount || ''),
          name: customer?.name || 'Gravity Web Technology',
          order_id: String(createOrderData?.orderId || ''),
          prefill: {
            name: customer?.name || '',
            email: customer?.email || '',
            contact: customer?.contact ? String(customer.contact) : '',
          },
          theme: { color: '#3399cc' },
        }

        console.log('Razorpay options:', options)
        console.log('Before RazorpayCheckout.open')

        let razorpayResponse

        try {
          razorpayResponse = await RazorpayCheckout.open(options)
          console.log('Razorpay Success:', razorpayResponse)
        } catch (rzpError) {
          console.log('Razorpay open failed:', rzpError)
          console.log(
            'Razorpay open failed JSON:',
            JSON.stringify(rzpError, null, 2)
          )

          Alert.alert(
            'Payment Failed',
            rzpError?.description ||
              rzpError?.message ||
              'Razorpay UI did not open'
          )

          onFailure?.(rzpError)
          return
        }

        const verifyPayload = {
          razorpay_order_id: razorpayResponse?.razorpay_order_id,
          razorpay_payment_id: razorpayResponse?.razorpay_payment_id,
          razorpay_signature: razorpayResponse?.razorpay_signature,
        }

        let verifyResponse
        let verifyData

        try {
          verifyResponse = await fetch(verifyPaymentUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(verifyPayload),
          })

          verifyData = await parseResponseSafe(verifyResponse)
        } catch (verifyError) {
          console.log('Verify payment fetch failed:', verifyError)
          Alert.alert(
            'Verify Failed',
            'Payment done, but verify API failed'
          )
          onFailure?.({
            message: 'Verify API failed',
            raw: String(verifyError),
          })
          return
        }

        console.log('Verify Response:', verifyData)

        if (!verifyResponse.ok) {
          Alert.alert(
            'Verify Failed',
            verifyData?.message ||
              verifyData?.detail ||
              'Payment verification failed'
          )
          onFailure?.(verifyData)
          return
        }

        onSuccess?.({
          paymentResponse: razorpayResponse,
          verifyResponse: verifyData,
          orderResponse: createOrderData,
        })
      } catch (error) {
        console.log('Payment Error:', error)
        Alert.alert(
          'Payment Error',
          error?.message || 'Something went wrong during payment'
        )
        onFailure?.(error)
      } finally {
        setLoading(false)
      }
    }

    useImperativeHandle(ref, () => ({
      payNow,
      isLoading: loading,
    }))

    return null
  }
)

export default Razorpay