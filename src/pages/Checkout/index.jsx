import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { BsFillBagCheckFill } from 'react-icons/bs'
import { MdLocationOn, MdAdd, MdCheckCircle, MdLock, MdDeliveryDining } from 'react-icons/md'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { IoShieldCheckmarkOutline, IoWalletOutline } from 'react-icons/io5'
import { MdLocalShipping } from 'react-icons/md'
import CircularProgress from '@mui/material/CircularProgress'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Mycontext } from '../../App'
import { postData } from '../../utils/api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const STRIPE_STYLE = {
  style: {
    base: {
      fontSize:        '13px',
      color:           '#1f2937',
      fontFamily:      'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
}

// ── Stripe card form ──────────────────────────────────────────────────────────
const StripeForm = ({ total, onSuccess }) => {
  const stripe   = useStripe()
  const elements = useElements()

  const [paying,     setPaying]     = useState(false)
  const [cardError,  setCardError]  = useState('')
  const [nameOnCard, setNameOnCard] = useState('')

  const handlePay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!nameOnCard.trim()) { setCardError('Please enter the name on your card'); return }
    setPaying(true)
    setCardError('')
    try {
      if (!total || total <= 0) throw new Error('Order total is $0 — check cart item prices')
      const resData      = await postData('/api/payment/create-intent', { amount: total })
      const clientSecret = resData?.clientSecret
      if (resData?.error) throw new Error(resData.message || 'Payment error')
      if (!clientSecret)  throw new Error('No client secret returned from server')
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardNumberElement), billing_details: { name: nameOnCard } },
      })
      if (error) { setCardError(error.message); setPaying(false); return }
      if (paymentIntent.status === 'succeeded') onSuccess(paymentIntent)
    } catch (err) {
      setCardError(err?.message || 'Payment failed. Please try again.')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handlePay} className='flex flex-col gap-4'>
      <div>
        <label className='block text-[12px] font-[600] text-gray-500 uppercase tracking-widest mb-1.5'>Name on Card</label>
        <input type='text' value={nameOnCard} onChange={e => setNameOnCard(e.target.value)}
          placeholder='John Smith' disabled={paying}
          className='w-full h-[42px] border border-gray-200 focus:outline-none focus:border-[#f51111] rounded-lg px-3 text-[13px] transition-colors disabled:bg-gray-50' />
      </div>
      <div>
        <label className='block text-[12px] font-[600] text-gray-500 uppercase tracking-widest mb-1.5'>Card Number</label>
        <div className='h-[42px] border border-gray-200 focus-within:border-[#f51111] rounded-lg px-3 flex items-center transition-colors'>
          <CardNumberElement options={STRIPE_STYLE} className='w-full' />
        </div>
      </div>
      <div className='flex gap-3'>
        <div className='flex-1'>
          <label className='block text-[12px] font-[600] text-gray-500 uppercase tracking-widest mb-1.5'>Expiry</label>
          <div className='h-[42px] border border-gray-200 focus-within:border-[#f51111] rounded-lg px-3 flex items-center transition-colors'>
            <CardExpiryElement options={STRIPE_STYLE} className='w-full' />
          </div>
        </div>
        <div className='flex-1'>
          <label className='block text-[12px] font-[600] text-gray-500 uppercase tracking-widest mb-1.5'>CVC</label>
          <div className='h-[42px] border border-gray-200 focus-within:border-[#f51111] rounded-lg px-3 flex items-center transition-colors'>
            <CardCvcElement options={STRIPE_STYLE} className='w-full' />
          </div>
        </div>
      </div>
      <div className='flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl'>
        <span className='text-[14px] mt-0.5'>ℹ️</span>
        <p className='text-[11px] text-blue-600 leading-relaxed'>
          <strong>Test card:</strong> 4242 4242 4242 4242 · Any future expiry · Any CVC
        </p>
      </div>
      {cardError && (
        <div className='flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl'>
          <span className='text-red-400 text-[13px]'>⚠</span>
          <p className='text-[12px] text-red-600'>{cardError}</p>
        </div>
      )}
      <button type='submit' disabled={!stripe || paying}
        className={'w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-[700] text-white transition-all duration-200 ' +
          (paying || !stripe ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#f51111] hover:bg-[#e03f3f] active:scale-[0.98] shadow-md')}>
        {paying ? <><CircularProgress size={18} color='inherit' /> Processing…</> : <><MdLock size={16} /> Pay ${Number(total).toFixed(2)}</>}
      </button>
      <div className='flex items-center justify-center gap-1.5 text-[11px] text-gray-400'>
        <MdLock size={12} /> Secured by Stripe — your card details are never stored
      </div>
    </form>
  )
}

// ── Cash on Delivery form ─────────────────────────────────────────────────────
const CashForm = ({ total, onSuccess }) => {
  const [placing, setPlacing] = useState(false)
  const handlePlace = async () => {
    setPlacing(true)
    try { onSuccess(null) } catch (err) { console.log(err); setPlacing(false) }
  }
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl'>
        <IoWalletOutline size={20} className='text-amber-500 flex-shrink-0 mt-0.5' />
        <div>
          <p className='text-[13px] font-[700] text-amber-700 mb-1'>Cash on Delivery</p>
          <p className='text-[12px] text-amber-600 leading-relaxed'>Pay in cash when your order arrives. Please have the exact amount ready.</p>
        </div>
      </div>
      <div className='flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-100'>
        <span className='text-[13px] text-gray-500 font-[500]'>Amount due on delivery</span>
        <span className='text-[18px] font-[800] text-gray-900'>${Number(total).toFixed(2)}</span>
      </div>
      <button onClick={handlePlace} disabled={placing}
        className={'w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[14px] font-[700] text-white transition-all duration-200 ' +
          (placing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] shadow-md')}>
        {placing ? <><CircularProgress size={18} color='inherit' /> Placing Order…</> : <><BsFillBagCheckFill size={15} /> Place Order (Pay on Delivery)</>}
      </button>
    </div>
  )
}

// ── Order Success Screen ──────────────────────────────────────────────────────
const OrderSuccess = ({ isCod, total, paymentIntent }) => {
  const steps = [
    { icon: '✅', label: 'Order Confirmed',   done: true  },
    { icon: '📦', label: 'Preparing Order',   done: false },
    { icon: '🚚', label: 'Out for Delivery',  done: false },
    { icon: '🏠', label: 'Delivered',         done: false },
  ]

  return (
    <section className='bg-gray-50 flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-[500px] flex flex-col gap-4'>

        {/* Main success card */}
        <div className='bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8 sm:p-10 text-center'>

          {/* Animated icon */}
          <div className={'relative w-[80px] h-[80px] rounded-full mx-auto mb-5 flex items-center justify-center ' +
                          (isCod ? 'bg-amber-100' : 'bg-emerald-100')}>
            {/* Pulse ring */}
            <div className={'absolute inset-0 rounded-full animate-ping opacity-20 ' +
                            (isCod ? 'bg-amber-400' : 'bg-emerald-400')} />
            {isCod
              ? <MdDeliveryDining size={42} className='text-amber-500 relative z-10' />
              : <MdCheckCircle    size={42} className='text-emerald-500 relative z-10' />
            }
          </div>

          <h2 className='text-[24px] sm:text-[28px] font-[800] text-gray-900 tracking-tight !mb-2'>
            {isCod ? 'Order Confirmed!' : 'Payment Successful!'}
          </h2>
          <p className='text-[13px] text-gray-400 leading-relaxed !mb-6'>
            {isCod
              ? <>Your order is on its way. Have <span className='font-[700] text-gray-700'>${total.toFixed(2)}</span> ready when your delivery arrives.</>
              : <>Thank you for your purchase! Your payment of <span className='font-[700] text-emerald-600'>${total.toFixed(2)}</span> was received.</>
            }
          </p>

          {/* Payment ID for card */}
          {!isCod && paymentIntent?.id && (
            <div className='inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 !mb-6'>
              <IoShieldCheckmarkOutline size={14} className='text-gray-400 flex-shrink-0' />
              <span className='text-[10px] text-gray-400'>Payment ID:</span>
              <span className='text-[10px] font-[700] text-gray-600 truncate max-w-[160px]'>{paymentIntent.id}</span>
            </div>
          )}

          {/* Order tracking steps */}
          <div className='flex items-center justify-between !mb-8 px-2'>
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div className='flex flex-col items-center gap-1.5'>
                  <div className={'w-[36px] h-[36px] rounded-full flex items-center justify-center text-[16px] ' +
                                  (step.done ? (isCod ? 'bg-amber-100' : 'bg-emerald-100') : 'bg-gray-100')}>
                    {step.icon}
                  </div>
                  <span className={'text-[9px] sm:text-[10px] font-[600] text-center leading-tight ' +
                                   (step.done ? (isCod ? 'text-amber-600' : 'text-emerald-600') : 'text-gray-400')}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={'flex-1 h-[2px] mx-1 rounded-full ' +
                                  (i === 0 ? (isCod ? 'bg-amber-200' : 'bg-emerald-200') : 'bg-gray-200')} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* CTA buttons */}
          <div className='flex gap-3'>
            <Link to='/orders'
              className='flex-1 py-3 rounded-xl border-2 border-[#f51111] text-[#f51111]
                         font-[700] text-[13px] text-center hover:bg-red-50 transition-colors'>
              View Orders
            </Link>
            <Link to='/productListing'
              className='flex-1 py-3 rounded-xl font-[700] text-[13px] text-center
                         text-white hover:bg-[#e03f3f] transition-colors active:scale-[0.98]'
              style={{ background: 'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)' }}>
              Shop More
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            { icon: <MdLocalShipping size={18} />,         label: 'Free Shipping',    sub: 'On all orders'      },
            { icon: <IoShieldCheckmarkOutline size={18} />, label: 'Secure Payment',   sub: 'SSL encrypted'      },
            { icon: <MdDeliveryDining size={18} />,         label: 'Fast Delivery',    sub: '2–5 business days'  },
          ].map((b, i) => (
            <div key={i} className='bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center text-center gap-1.5 shadow-sm'>
              <div className='text-[#f51111]'>{b.icon}</div>
              <p className='text-[10px] sm:text-[11px] font-[700] text-gray-700 leading-tight'>{b.label}</p>
              <p className='text-[9px] sm:text-[10px] text-gray-400'>{b.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ── Main Checkout page ────────────────────────────────────────────────────────
const Checkout = () => {
  const context = useContext(Mycontext)

  const [summaryExpanded, setSummaryExpanded] = useState(true)
  const [paid,            setPaid]            = useState(false)
  const [paymentIntent,   setPaymentIntent]   = useState(null)
  const [paymentMethod,   setPaymentMethod]   = useState('card')
  const [isCod,           setIsCod]           = useState(false)
  const [frozenTotal,     setFrozenTotal]     = useState(0)

  const cartItems   = context?.cartItems        || []
  const userData    = context?.userData         || {}
  const addresses   = userData?.address_details || []
  const defaultAddr = addresses.find(a => a.status) || addresses[0] || null

  const subtotal = cartItems.reduce((sum, item) =>
    sum + (item.productId?.price ?? 0) * (item.quantity || 1), 0)
  const total = subtotal

  const handleSuccess = async (intent) => {
    const isCodOrder = intent === null
    setPaymentIntent(intent)
    setIsCod(isCodOrder)
    setFrozenTotal(total)  // capture before cart is cleared
    try {
      const orderRes = await postData('/api/order', {
        paymentId:        isCodOrder ? 'COD' : intent.id,
        payment_status:   isCodOrder ? 'pending' : 'paid',
        delivery_address: defaultAddr?._id,
        sub_total_amount: subtotal,
        total_amount:     total,
        items:            cartItems,
      })
      if (orderRes?.error) throw new Error(orderRes.message || 'Order save failed')
      context?.setCartItems?.([])
    } catch (err) {
      console.log(err)
      context?.openAlertBox?.('error',
        isCodOrder
          ? 'Order could not be placed. Please try again.'
          : 'Payment received but order save failed. Contact support with ID: ' + intent?.id
      )
      return
    }
    setPaid(true)
  }

  if (!context?.isLogin) {
    return (
      <section className='min-h-screen bg-gray-50 flex items-center justify-center py-20 text-center px-4'>
        <div className='flex flex-col items-center gap-4'>
          <MdLock size={40} className='text-gray-300' />
          <p className='text-gray-500 text-[14px]'>Please log in to checkout</p>
          <Link to='/login' className='px-6 py-3 rounded-xl font-[700] text-[13px] text-white'
            style={{ background: 'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)' }}>
            Log In
          </Link>
        </div>
      </section>
    )
  }

  if (paid) return <OrderSuccess isCod={isCod} total={frozenTotal} paymentIntent={paymentIntent} />

  return (
    <section className='py-8 min-h-screen bg-gray-50'>
      <div className='container max-w-[1100px] mx-auto px-4'>

        <div className='!mb-6'>
          <h1 className='text-[24px] font-[800] text-gray-900'>Checkout</h1>
          <p className='text-[13px] text-gray-400 mt-0.5'>Review your order and complete payment</p>
        </div>

        <div className='flex gap-6 items-start flex-wrap lg:flex-nowrap'>

          {/* ── Left column ── */}
          <div className='flex flex-col gap-5 w-full lg:w-[60%]'>

            {/* Delivery address */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
              <div className='flex items-center justify-between !mb-4'>
                <h2 className='text-[15px] font-[700] text-gray-900 flex items-center gap-2'>
                  <MdLocationOn className='text-[#f51111]' size={18} /> Delivery Address
                </h2>
                <Link to='/addresses'
                  className='text-[12px] font-[600] text-[#f51111] hover:underline flex items-center gap-1'>
                  <MdAdd size={14} /> Manage
                </Link>
              </div>
              {defaultAddr ? (
                <div className='flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100'>
                  <MdCheckCircle className='text-[#f51111] mt-0.5 flex-shrink-0' size={18} />
                  <div>
                    <div className='flex items-center gap-2 mb-0.5'>
                      <span className='text-[10px] font-[700] uppercase tracking-widest text-gray-400'>{defaultAddr.address_name || 'Home'}</span>
                      <span className='text-[10px] font-[700] text-[#f51111] bg-red-100 px-1.5 py-[1px] rounded-full'>Default</span>
                    </div>
                    <p className='text-[13px] font-[600] text-gray-800'>{defaultAddr.address_line}, {defaultAddr.city}, {defaultAddr.state}</p>
                    <p className='text-[13px] text-gray-500'>{defaultAddr.country} — {defaultAddr.pincode}</p>
                    <p className='text-[12px] text-gray-400 mt-0.5'>📞 {defaultAddr.mobile}</p>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center py-6 gap-3 text-center'>
                  <MdLocationOn size={36} className='text-gray-200' />
                  <p className='text-[13px] text-gray-400'>No address saved yet</p>
                  <Link to='/addresses' className='text-[13px] font-[700] text-white bg-[#f51111] px-4 py-2 rounded-xl'>+ Add Address</Link>
                </div>
              )}
            </div>

            {/* Order items */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
              <button onClick={() => setSummaryExpanded(v => !v)} className='w-full flex items-center justify-between mb-3'>
                <h2 className='text-[15px] font-[700] text-gray-900'>
                  Order Items
                  <span className='ml-2 text-[12px] text-gray-400 font-[400]'>({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                </h2>
                {summaryExpanded ? <FiChevronUp className='text-gray-400' /> : <FiChevronDown className='text-gray-400' />}
              </button>
              {summaryExpanded && (
                <div className='flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1'>
                  {cartItems.length === 0 ? (
                    <div className='text-center py-6 text-gray-400 text-[13px]'>
                      Your cart is empty. <Link to='/productListing' className='text-[#f51111] font-[600]'>Browse products</Link>
                    </div>
                  ) : cartItems.map((item) => {
                    const prod  = item.productId || {}
                    const price = prod.price ?? 0
                    const qty   = item.quantity || 1
                    return (
                      <div key={item._id} className='flex items-center gap-3 p-3 rounded-xl bg-gray-50'>
                        <div className='w-[52px] h-[52px] rounded-xl overflow-hidden bg-gray-200 flex-shrink-0'>
                          {prod.images?.[0]
                            ? <img src={prod.images[0]} alt={prod.name} className='w-full h-full object-cover' />
                            : <div className='w-full h-full flex items-center justify-center text-gray-300 text-[10px]'>No img</div>
                          }
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-[13px] font-[600] text-gray-800 truncate'>{prod.name || 'Product'}</p>
                          <div className='flex flex-wrap gap-1 mt-0.5'>
                            {item.size          && <span className='text-[10px] bg-gray-200 text-gray-500 px-1.5 py-[1px] rounded-full'>{item.size}</span>}
                            {item.productRam    && <span className='text-[10px] bg-gray-200 text-gray-500 px-1.5 py-[1px] rounded-full'>{item.productRam}</span>}
                            {item.productWeight && <span className='text-[10px] bg-gray-200 text-gray-500 px-1.5 py-[1px] rounded-full'>{item.productWeight}</span>}
                          </div>
                          <p className='text-[11px] text-gray-400 mt-0.5'>Qty: {qty}</p>
                        </div>
                        <p className='text-[13px] font-[700] text-[#f51111]'>${(price * qty).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className='w-full lg:w-[40%] flex flex-col gap-4 lg:sticky lg:top-6'>

            {/* Order summary */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
              <h2 className='text-[15px] font-[700] text-gray-900 mb-4'>Order Summary</h2>
              <div className='flex flex-col gap-2 text-[13px]'>
                <div className='flex justify-between text-gray-600'>
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className='font-[600]'>${subtotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                  <span>Shipping</span>
                  <span className='text-emerald-600 font-[600]'>Free</span>
                </div>
                <div className='border-t border-gray-100 pt-3 mt-1 flex justify-between text-[16px] font-[800] text-gray-900'>
                  <span>Total</span>
                  <span className='text-[#f51111]'>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
              <h2 className='text-[15px] font-[700] text-gray-900 !mb-4'>Payment Method</h2>
              {cartItems.length === 0 ? (
                <p className='text-[13px] text-gray-400 text-center py-4'>Add items to your cart first</p>
              ) : !defaultAddr ? (
                <p className='text-[13px] text-gray-400 text-center py-4'>
                  Please <Link to='/addresses' className='text-[#f51111] font-[600] hover:underline'>add a delivery address</Link> first
                </p>
              ) : (
                <>
                  <div className='grid grid-cols-2 gap-3 mb-5'>
                    <button onClick={() => setPaymentMethod('card')}
                      className={'flex flex-col items-center gap-2 py-3.5 px-3 rounded-xl border-2 transition-all duration-150 text-center ' +
                        (paymentMethod === 'card' ? 'border-[#f51111] bg-red-50' : 'border-gray-200 hover:border-gray-300')}>
                      <div className={'w-[36px] h-[36px] rounded-full flex items-center justify-center ' + (paymentMethod === 'card' ? 'bg-[#f51111]' : 'bg-gray-100')}>
                        <MdLock size={18} className={paymentMethod === 'card' ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className={'text-[12px] font-[700] ' + (paymentMethod === 'card' ? 'text-[#f51111]' : 'text-gray-700')}>Credit / Debit</p>
                        <p className='text-[10px] text-gray-400 mt-0.5'>Visa, Mastercard</p>
                      </div>
                      {paymentMethod === 'card' && <span className='text-[10px] font-[700] text-[#f51111]'>✓ Selected</span>}
                    </button>
                    <button onClick={() => setPaymentMethod('cod')}
                      className={'flex flex-col items-center gap-2 py-3.5 px-3 rounded-xl border-2 transition-all duration-150 text-center ' +
                        (paymentMethod === 'cod' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300')}>
                      <div className={'w-[36px] h-[36px] rounded-full flex items-center justify-center ' + (paymentMethod === 'cod' ? 'bg-amber-400' : 'bg-gray-100')}>
                        <IoWalletOutline size={18} className={paymentMethod === 'cod' ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className={'text-[12px] font-[700] ' + (paymentMethod === 'cod' ? 'text-amber-600' : 'text-gray-700')}>Cash on Delivery</p>
                        <p className='text-[10px] text-gray-400 mt-0.5'>Pay when it arrives</p>
                      </div>
                      {paymentMethod === 'cod' && <span className='text-[10px] font-[700] text-amber-600'>✓ Selected</span>}
                    </button>
                  </div>
                  <div className='border-t border-gray-100 !mb-5' />
                  {paymentMethod === 'card' ? (
                    <Elements stripe={stripePromise}>
                      <StripeForm total={total} onSuccess={handleSuccess} />
                    </Elements>
                  ) : (
                    <CashForm total={total} onSuccess={handleSuccess} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Checkout