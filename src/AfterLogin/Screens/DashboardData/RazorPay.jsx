import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Platform } from 'react-native'
import RazorpayCheckout from 'react-native-razorpay'

const RazorPay = forwardRef(
  ({ apiBaseUrl, payload, customer, onSuccess, onFailure }, ref) => {
    const [isLoading, setIsLoading] = useState(false)
    const loadingRef = useRef(false)

    const getApiClient = () => {
      if (apiBaseUrl && typeof apiBaseUrl.post === 'function') {
        return apiBaseUrl
      }
      throw new Error('Invalid apiBaseUrl client passed to RazorPay component')
    }

    const payNow = async () => {
      if (loadingRef.current) return

      try {
        loadingRef.current = true
        setIsLoading(true)

        const api = getApiClient()

        const createPayload = {
          hospId: Number(payload?.hospId) || 0,
          branchId: Number(payload?.branchId) || 0,
          clientId: Number(payload?.clientId) || 0,
          paymentModeId: Number(payload?.paymentModeId) || 0,
          createdBy: Number(payload?.createdBy) || 0,
          amount: Number(payload?.amount) || 0,
          currency: payload?.currency || 'INR',
          paymentMode: payload?.paymentMode || 'Online',
          receipt: payload?.receipt || null,
          remarks: payload?.remarks || null,
        }

        console.log('Create Order Payload:', createPayload)

        const createOrderResponse = await api.post(
          'payment/create-order',
          createPayload
        )

        const createOrderData = createOrderResponse?.data || createOrderResponse

        console.log('Create Order Response:', createOrderData)

        const options = {
          description: 'Lab Advance Payment',
          image: '',
          currency: createOrderData?.currency || createPayload.currency || 'INR',
          key: createOrderData?.key,
          amount: String(createOrderData?.amount || ''),
          name: 'Gravity Web Technology',
          order_id: createOrderData?.orderId,
          prefill: {
            email: customer?.email || '',
            contact: customer?.contact || '',
            name: customer?.name || '',
          },
          theme: { color: '#0f62fe' },
          retry: {
            enabled: true,
            max_count: 4,
          },
          send_sms_hash: true,
        }

        const razorpaySuccess = await RazorpayCheckout.open(options)

        console.log('Razorpay Success:', razorpaySuccess)

        const verifyPayload = {
          hospId: Number(payload?.hospId) || 0,
          branchId: Number(payload?.branchId) || 0,
          clientId: Number(payload?.clientId) || 0,
          paymentModeId: Number(payload?.paymentModeId) || 0,
          createdBy: Number(payload?.createdBy) || 0,
          amount: Number(payload?.amount) || 0,
          paymentMode: payload?.paymentMode || 'Online',
          remarks: payload?.remarks || null,
          razorpay_order_id: razorpaySuccess?.razorpay_order_id || '',
          razorpay_payment_id: razorpaySuccess?.razorpay_payment_id || '',
          razorpay_signature: razorpaySuccess?.razorpay_signature || '',
        }

        console.log('Verify Payload:', verifyPayload)

        const verifyResponse = await api.post(
          'payment/verify-payment',
          verifyPayload
        )

        const verifyData = verifyResponse?.data || verifyResponse

        console.log('Verify Response:', verifyData)

        if (!verifyData?.status) {
          onFailure?.(verifyData || { message: 'Payment failed' })
          return
        }

        onSuccess?.(verifyData)
      } catch (error) {
        console.log('RazorPay Error:', error)

        // ✅ Detect cancel
        if (error?.code === 'PAYMENT_CANCELLED') {
          onFailure?.({
            message: 'Payment cancelled',
            isCancelled: true,
          })
          return
        }

        if (error?.description) {
          onFailure?.({
            message: error.description || 'Payment failed',
          })
        } else if (error?.response?.data) {
          onFailure?.(error.response.data)
        } else {
          onFailure?.({
            message: error?.message || 'Payment failed',
          })
        }
      } finally {
        loadingRef.current = false
        setIsLoading(false)
      }
    }

    useImperativeHandle(ref, () => ({
      payNow,
      isLoading,
    }))

    return null
  }
)

export default RazorPay