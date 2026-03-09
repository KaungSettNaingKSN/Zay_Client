import React, { useEffect, useRef, useState, useContext } from 'react'
import { postData, putData } from '../../utils/api'
import { useNavigate } from 'react-router-dom'
import { Mycontext } from '../../App'
import CircularProgress from '@mui/material/CircularProgress'

const VerifyAccount = () => {
  const [otp,        setOtp]        = useState(new Array(6).fill(''))
  const [isLoading,  setIsLoading]  = useState(false)
  const [resending,  setResending]  = useState(false)
  const [cooldown,   setCooldown]   = useState(0)   // seconds remaining
  const inputsRef  = useRef([])
  const timerRef   = useRef(null)
  const context    = useContext(Mycontext)
  const history    = useNavigate()

  const actionType = localStorage.getItem('actionType')
  const userEmail  = localStorage.getItem('userEmail') || 'your email'

  useEffect(() => { inputsRef.current[0]?.focus() }, [])

  // ── Cooldown ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => setCooldown(c => c <= 1 ? 0 : c - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [cooldown])

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleChange = (e, index) => {
    const value = e.target.value
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      inputsRef.current[index - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newOtp = [...otp]
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    inputsRef.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ── Verify ────────────────────────────────────────────────────────────────
  const verifyOtp = async (e) => {
    e.preventDefault()
    const enteredOtp = otp.join('')
    if (enteredOtp.length !== 6) {
      context.openAlertBox('error', 'Please enter the complete 6-digit code')
      return
    }
    setIsLoading(true)
    try {
      if (actionType !== 'forgot-password') {
        const res = await postData('/api/user/verifyEmail', {
          email: localStorage.getItem('userEmail'),
          otp:   enteredOtp,
        })
        context.openAlertBox('success', res.message)
        localStorage.removeItem('userEmail')
        history('/login')
      } else {
        const res = await putData('/api/user/verify-forgot-password-otp', {
          email: localStorage.getItem('userEmail'),
          otp:   enteredOtp,
        })
        context.openAlertBox('success', res.message)
        localStorage.removeItem('actionType')
        history('/forgotPassword')
      }
    } catch (error) {
      context.openAlertBox('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    try {
      await postData('/api/user/resend-otp', {
        email:      localStorage.getItem('userEmail'),
        actionType: actionType === 'forgot-password' ? 'forgot-password' : 'verify-email',
      })
      context.openAlertBox('success', 'New code sent to your email')
      setOtp(new Array(6).fill(''))
      inputsRef.current[0]?.focus()
      setCooldown(60) // 60-second cooldown
    } catch (error) {
      context.openAlertBox('error', error.message || 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  const filled = otp.filter(d => d !== '').length

  return (
    <section className='bg-gray-50 flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8 sm:p-10'>

        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f51111]/10 mb-4'>
            <img
              src='https://ecommerce-frontend-view.netlify.app/verify3.png'
              alt='verify'
              className='w-8 h-8 object-contain'
            />
          </div>
          <h1 className='text-[22px] sm:text-[26px] font-[800] text-gray-900 tracking-tight'>
            Verify your email
          </h1>
          <p className='text-[13px] text-gray-400 mt-1.5 leading-relaxed'>
            Enter the 6-digit code sent to<br />
            <span className='font-[600] text-gray-600'>{userEmail}</span>
          </p>
        </div>

        <form onSubmit={verifyOtp} className='flex flex-col gap-6'>

          {/* OTP inputs */}
          <div className='flex justify-center gap-2 sm:gap-3' onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputsRef.current[index] = el)}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                className={`w-[42px] h-[50px] sm:w-[50px] sm:h-[58px]
                            text-center text-[20px] sm:text-[22px] font-[700]
                            border-2 rounded-xl outline-none
                            transition-all duration-200 caret-[#f51111]
                            ${digit
                              ? 'border-[#f51111] bg-[#f51111]/5 text-[#f51111]'
                              : 'border-gray-200 bg-white text-gray-800 focus:border-[#f51111] focus:ring-2 focus:ring-[#f51111]/10'
                            }`}
              />
            ))}
          </div>

          {/* Progress dots */}
          <div className='flex justify-center gap-1.5'>
            {otp.map((_, i) => (
              <div key={i}
                className={`h-1 rounded-full transition-all duration-300
                            ${i < filled ? 'w-5 bg-[#f51111]' : 'w-2 bg-gray-200'}`} />
            ))}
          </div>

          {/* Submit */}
          <button
            type='submit'
            disabled={filled < 6 || isLoading}
            className='w-full h-[48px] rounded-xl font-[700] text-[14px] text-white
                       flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
                       transition-all duration-200'
            style={{
              background:  'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)',
              boxShadow:   '0 4px 14px rgba(255,82,82,0.35)',
            }}
          >
            {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Verify Code'}
          </button>

        </form>

        {/* Resend section */}
        <div className='text-center mt-6'>
          <p className='text-[12px] text-gray-400'>
            Didn't receive the code?
          </p>

          {cooldown > 0 ? (
            /* Countdown ring */
            <div className='flex items-center justify-center gap-2 mt-2'>
              <div className='relative w-7 h-7'>
                <svg className='w-7 h-7 -rotate-90' viewBox='0 0 28 28'>
                  <circle cx='14' cy='14' r='11' fill='none' stroke='#f3f4f6' strokeWidth='2.5' />
                  <circle
                    cx='14' cy='14' r='11' fill='none'
                    stroke='#f51111' strokeWidth='2.5'
                    strokeDasharray={`${2 * Math.PI * 11}`}
                    strokeDashoffset={`${2 * Math.PI * 11 * (1 - cooldown / 60)}`}
                    strokeLinecap='round'
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className='absolute inset-0 flex items-center justify-center text-[9px] font-[700] text-[#f51111]'>
                  {cooldown}
                </span>
              </div>
              <span className='text-[12px] text-gray-400'>
                Resend in <span className='font-[600] text-gray-600'>{cooldown}s</span>
              </span>
            </div>
          ) : (
            <button
              type='button'
              onClick={handleResend}
              disabled={resending}
              className='mt-1.5 flex items-center justify-center gap-1.5 mx-auto
                         text-[13px] font-[700] text-[#f51111] hover:text-[#e03f3f]
                         disabled:opacity-50 transition-colors'
            >
              {resending
                ? <><CircularProgress size={13} color='inherit' /> Sending…</>
                : '↻ Resend Code'
              }
            </button>
          )}
        </div>

      </div>
    </section>
  )
}

export default VerifyAccount