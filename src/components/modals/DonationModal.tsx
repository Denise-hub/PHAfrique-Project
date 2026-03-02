'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { loadScript } from '@/lib/utils'

// Extend Window interface for PayPal
declare global {
  interface Window {
    paypal?: any
  }
}

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

type PaymentMethod = 'card' | 'paypal'

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [paypalLoadError, setPaypalLoadError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const paypalButtonsRef = useRef<any>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  // Card form fields
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  const placeholders = ['$10', '$50', '$100']

  // Debounce function
  const debounce = useCallback((func: () => void, delay: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(func, delay)
  }, [])

  // Load PayPal SDK
  const loadPayPalSDK = useCallback(() => {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    
    if (!paypalClientId || paypalClientId === 'YOUR_PAYPAL_CLIENT_ID') {
      setPaypalLoadError(true)
      return
    }

    setPaypalLoadError(false)
    setError(null)
    
    loadScript(`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`)
      .then(() => {
        setPaypalLoaded(true)
        setPaypalLoadError(false)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to load PayPal SDK:', err)
        setPaypalLoaded(false)
        setPaypalLoadError(true)
      })
  }, [])

  useEffect(() => {
    if (isOpen && !paypalLoaded && !paypalLoadError) {
      loadPayPalSDK()
    }
  }, [isOpen, paypalLoaded, paypalLoadError, loadPayPalSDK])

  // Rotate placeholders
  useEffect(() => {
    if (!isOpen || amount) return
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isOpen, amount, placeholders.length])

  // Debounced PayPal initialization
  useEffect(() => {
    if (paymentMethod !== 'paypal') {
      const container = document.getElementById('paypal-button-container')
      if (container) {
        container.innerHTML = ''
      }
      if (paypalButtonsRef.current) {
        try {
          paypalButtonsRef.current.close()
        } catch (e) {
          // Ignore cleanup errors
        }
        paypalButtonsRef.current = null
      }
      return
    }

    if (!paypalLoaded || !window.paypal) {
      return
    }

    if (!isValidAmount()) {
      const container = document.getElementById('paypal-button-container')
      if (container) {
        container.innerHTML = ''
      }
      return
    }

    // Debounce the PayPal button initialization
    debounce(() => {
      initializePayPal()
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [paypalLoaded, amount, paymentMethod, debounce])

  const initializePayPal = () => {
    const container = document.getElementById('paypal-button-container')
    if (!container || !window.paypal) return

    // Clear existing buttons and cleanup previous instance
    container.innerHTML = ''
    if (paypalButtonsRef.current) {
      try {
        paypalButtonsRef.current.close()
      } catch (e) {
        // Ignore cleanup errors
      }
      paypalButtonsRef.current = null
    }

    const donationAmount = getDonationAmount()
    if (donationAmount <= 0) return

    try {
      paypalButtonsRef.current = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (data: any, actions: any) => {
          try {
            // Dynamically get the current amount from state
            const currentAmount = getDonationAmount()
            if (currentAmount <= 0) {
              throw new Error('Invalid donation amount')
            }
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: currentAmount.toFixed(2),
                  currency_code: 'USD'
                },
                description: 'Donation to Public Health en Afrique'
              }]
            })
          } catch (err: any) {
            setError(err.message || 'Failed to create payment order. Please try again.')
            throw err
          }
        },
        onApprove: (data: any, actions: any) => {
          setIsProcessing(true)
          setError(null)
          return actions.order.capture().then((details: any) => {
            setIsProcessing(false)
            setIsSuccess(true)
            // Clear PayPal button container
            const container = document.getElementById('paypal-button-container')
            if (container) {
              container.innerHTML = ''
            }
            if (paypalButtonsRef.current) {
              paypalButtonsRef.current = null
            }
            console.log('Payment completed:', details)
          }).catch((err: any) => {
            setIsProcessing(false)
            setError('Payment failed. Please try again or use a different payment method.')
            console.error('PayPal capture error:', err)
          })
        },
        onError: (err: any) => {
          setIsProcessing(false)
          setError('Payment error occurred. Please try again.')
          console.error('PayPal error:', err)
        },
        onCancel: () => {
          setIsProcessing(false)
        }
      })
      paypalButtonsRef.current.render('#paypal-button-container')
    } catch (error: any) {
      console.error('Error initializing PayPal:', error)
      setError('Failed to initialize payment. Please refresh the page.')
    }
  }

  const handleAmountChange = (value: string) => {
    // Remove $ sign and any non-numeric characters except decimal point
    let numericValue = value.replace(/[^0-9.]/g, '')
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      numericValue = parts[0] + '.' + parts[1].substring(0, 2)
    }
    
    setAmount(numericValue)
    setError(null)
  }

  const getDonationAmount = (): number => {
    if (!amount) return 0
    const parsed = parseFloat(amount)
    return isNaN(parsed) ? 0 : parsed
  }

  const isValidAmount = (): boolean => {
    const donationAmount = getDonationAmount()
    return donationAmount > 0 && donationAmount <= 100000
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '').replace(/\D/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.substring(0, 19) // Max 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
    }
    return cleaned
  }

  const getCardType = (number: string): 'visa' | 'mastercard' | 'unknown' => {
    const cleaned = number.replace(/\s/g, '')
    if (/^4/.test(cleaned)) return 'visa'
    if (/^5[1-5]/.test(cleaned)) return 'mastercard'
    return 'unknown'
  }

  const handleCardSubmit = async () => {
    if (!isValidAmount()) {
      setError('Please enter a valid donation amount')
      return
    }

    if (!cardNumber || !expiryDate || !cvv) {
      setError('Please fill in all card details')
      return
    }

    // Validate card number length (remove spaces for validation)
    const cleanedCardNumber = cardNumber.replace(/\s/g, '')
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      setError('Please enter a valid card number')
      return
    }

    // Validate expiry date format
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY)')
      return
    }

    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4) {
      setError('Please enter a valid CVV')
      return
    }

    setIsProcessing(true)
    setError(null)

    // Simulate card payment processing
    // In production, integrate with Stripe or your payment processor
    try {
      // const response = await fetch('/api/donations/process-card', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: getDonationAmount() * 100,
      //     cardNumber: cleanedCardNumber,
      //     expiryDate,
      //     cvv
      //   })
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Payment processing failed')
      // }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Success - trigger success state
      setIsProcessing(false)
      setIsSuccess(true)
    } catch (error: any) {
      setIsProcessing(false)
      setError(error.message || 'Payment failed. Please check your card details and try again.')
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setIsSuccess(false)
      setAmount('')
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setError(null)
      setPlaceholderIndex(0)
      setPaymentMethod('card')
      onClose()
    }
  }

  if (!isOpen) return null

  const cardType = getCardType(cardNumber)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-[#044444]/20 flex flex-col max-h-[90vh]">
        {/* Close Button - Top Right */}
        <button
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="p-6 text-center flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#044444] dark:text-[#044444] mb-2">
              Thank You!
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Your contribution of <strong className="text-[#044444] dark:text-[#044444]">${getDonationAmount().toFixed(2)}</strong> will directly fund community health workers and medical supplies.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-[#044444] hover:bg-[#033333] text-white font-semibold text-sm transition-colors"
              >
                Download Receipt
              </button>
              <button
                onClick={() => {
                  handleClose()
                  router.push('/')
                }}
                className="px-6 py-2.5 rounded-xl border-2 border-[#044444] text-[#044444] hover:bg-[#044444]/10 font-semibold text-sm transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          /* Donation Form */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Compact Header */}
            <div className="p-4 pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-center mb-2">
                <Image
                  src="/assets/logos/TRANSPARENT-MAIN-LOGO-ico.png"
                  alt="PHAfrique Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h2 className="text-xl font-bold text-[#044444] dark:text-[#044444] text-center">
                Support Public Health en Afrique
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-1">
                Your contribution directly funds community health workers and medical supplies.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* Amount Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Donation Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 font-bold text-lg">
                    $
                  </span>
                  <input
                    type="text"
                    value={amount ? `$${amount}` : ''}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={placeholders[placeholderIndex]}
                    className="w-full pl-10 pr-4 py-3 text-xl font-semibold rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                </div>
              </div>

              {/* Payment Method Toggle */}
              <div className="mb-4">
                <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-700 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('card')
                      setError(null)
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-white dark:bg-neutral-800 text-[#044444] shadow-md'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('paypal')
                      setError(null)
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                      paymentMethod === 'paypal'
                        ? 'bg-white dark:bg-neutral-800 text-[#044444] shadow-md'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    PayPal
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full pl-4 pr-12 py-2.5 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {cardType === 'visa' && (
                          <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
                            <rect width="40" height="24" rx="2" fill="#1A1F71"/>
                            <circle cx="18" cy="12" r="4" fill="#EB001B"/>
                            <circle cx="22" cy="12" r="4" fill="#F79E1B"/>
                          </svg>
                        )}
                        {cardType === 'mastercard' && (
                          <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
                            <rect width="40" height="24" rx="2" fill="#E61E24"/>
                            <circle cx="20" cy="12" r="6" fill="#F0141F"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal Button */}
              {paymentMethod === 'paypal' && (
                <div>
                  {!paypalLoaded && !paypalLoadError && (
                    <div className="p-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900/50 text-center text-sm text-neutral-500 mb-2">
                      Loading PayPal...
                    </div>
                  )}
                  {paypalLoadError && (
                    <div className="p-4 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900/50 text-center mb-2">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Payment system coming soon
                      </p>
                    </div>
                  )}
                  <div id="paypal-button-container" className="min-h-[50px]"></div>
                  {!isValidAmount() && paypalLoaded && !paypalLoadError && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2">
                      Enter an amount above to continue
                    </p>
                  )}
                </div>
              )}

              {/* Trust Elements */}
              <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center justify-center gap-3 opacity-60">
                  <svg className="w-10 h-6" viewBox="0 0 40 24" fill="none">
                    <rect width="40" height="24" rx="2" fill="#1A1F71"/>
                    <circle cx="18" cy="12" r="4" fill="#EB001B"/>
                    <circle cx="22" cy="12" r="4" fill="#F79E1B"/>
                  </svg>
                  <svg className="w-10 h-6" viewBox="0 0 40 24" fill="none">
                    <rect width="40" height="24" rx="2" fill="#E61E24"/>
                    <circle cx="20" cy="12" r="6" fill="#F0141F"/>
                  </svg>
                  <div className="flex items-center">
                    <span className="text-[#0070BA] font-bold text-xs">Pay</span>
                    <span className="text-[#009CDE] font-bold text-xs">Pal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
              {paymentMethod === 'card' && (
                <button
                  onClick={handleCardSubmit}
                  disabled={!isValidAmount() || isProcessing || !cardNumber || !expiryDate || !cvv}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#044444] to-[#033333] hover:from-[#033333] hover:to-[#022222] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay $${getDonationAmount().toFixed(2)}`
                  )}
                </button>
              )}
              <button
                onClick={handleClose}
                className="w-full text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
