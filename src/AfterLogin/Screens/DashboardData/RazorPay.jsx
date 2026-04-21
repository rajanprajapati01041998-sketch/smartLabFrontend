import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import RazorpayCheckout from 'react-native-razorpay'

const RazorPay = forwardRef(
  ({ apiBaseUrl, payload, customer, onSuccess, onFailure }, ref) => {
    const [isLoading, setIsLoading] = useState(false)
    const loadingRef = useRef(false)
    const orderIdRef = useRef('')

    const getApiClient = () => {
      if (apiBaseUrl && typeof apiBaseUrl.post === 'function') {
        return apiBaseUrl
      }
      throw new Error('Invalid apiBaseUrl client passed')
    }

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    const basePayload = () => ({
      hospId: Number(payload?.hospId) || 0,
      branchId: Number(payload?.branchId) || 0,
      clientId: Number(payload?.clientId) || 0,
      paymentModeId: Number(payload?.paymentModeId) || 0,
      createdBy: Number(payload?.createdBy) || 0,
      amount: Number(payload?.amount) || 0,
      paymentMode: payload?.paymentMode || 'Online',
      remarks: payload?.remarks || null,
    })

    const parseRazorpayDescription = error => {
      try {
        if (!error?.description) return ''
        const parsed =
          typeof error.description === 'string'
            ? JSON.parse(error.description)
            : error.description

        return (
          parsed?.error?.description ||
          parsed?.error?.reason ||
          error?.description ||
          ''
        )
      } catch {
        return error?.description || ''
      }
    }

    const checkOrderStatus = async () => {
      const api = getApiClient()

      const response = await api.post('payment/check-order-status', {
        ...basePayload(),
        orderId: orderIdRef.current,
      })

      const responseData = response?.data || response
      console.log('Check Order Status Response:', responseData)

      return responseData
    }

    const verifyPayment = async result => {
      const api = getApiClient()

      const verifyPayload = {
        ...basePayload(),
        razorpay_order_id: result?.razorpay_order_id || '',
        razorpay_payment_id: result?.razorpay_payment_id || '',
        razorpay_signature: result?.razorpay_signature || '',
      }

      console.log('Verify Payload:', verifyPayload)

      const verifyResponse = await api.post(
        'payment/verify-payment',
        verifyPayload
      )

      const verifyData = verifyResponse?.data || verifyResponse
      console.log('Verify Response:', verifyData)

      return verifyData
    }

    const payNow = async () => {
      if (loadingRef.current) return

      try {
        loadingRef.current = true
        setIsLoading(true)

        const api = getApiClient()

        const createPayload = {
          ...basePayload(),
          currency: payload?.currency || 'INR',
          receipt: payload?.receipt || null,
        }

        console.log('Create Order Payload:', createPayload)

        const orderResponse = await api.post(
          'payment/create-order',
          createPayload
        )

        const orderData = orderResponse?.data || orderResponse
        console.log('Create Order Response:', orderData)

        orderIdRef.current = orderData?.orderId || ''

        const options = {
          description: 'Lab Advance Payment',
          image: '',
          currency: orderData?.currency || createPayload.currency || 'INR',
          key: orderData?.key,
          amount: String(orderData?.amount || ''),
          name: 'Gravity Web Technology',
          order_id: orderData?.orderId,
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

        const result = await RazorpayCheckout.open(options)
        console.log('Razorpay Success:', result)

        const verifyData = await verifyPayment(result)

        if (!verifyData?.status) {
          onFailure?.(verifyData || { message: 'Payment failed' })
          return
        }

        onSuccess?.(verifyData)
      } catch (error) {
        console.log('RazorPay Error:', error)

        const razorpayMessage = parseRazorpayDescription(error).toLowerCase()

        const isCancelLike =
          error?.code === 'PAYMENT_CANCELLED' ||
          razorpayMessage.includes('cancel') ||
          razorpayMessage.includes('payment cancelled') ||
          razorpayMessage.includes('payment canceled') ||
          razorpayMessage.includes('payment_error')

        if (isCancelLike && orderIdRef.current) {
          try {
            onFailure?.({
              message: 'Checking payment status...',
              isChecking: true,
            })

            await wait(3000)

            const statusData = await checkOrderStatus()

            if (statusData?.status && statusData?.data?.paymentFound === true) {
              onSuccess?.({
                ...(statusData?.data?.result || {}),
                message:
                  statusData?.message || 'Payment confirmed from order status',
              })
              return
            }

            onFailure?.({
              message: 'Payment cancelled',
              isCancelled: true,
              canRetry: true,
            })
            return
          } catch (statusError) {
            console.log('Status check error:', statusError)
            onFailure?.({
              message: 'Unable to confirm payment status',
              canRetry: true,
            })
            return
          }
        }

        if (error?.response?.data) {
          onFailure?.(error.response.data)
          return
        }

        onFailure?.({
          message:
            parseRazorpayDescription(error) || error?.message || 'Payment failed',
          canRetry: true,
        })
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