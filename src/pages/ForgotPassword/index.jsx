import React from 'react'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { Mycontext } from '../../App'
import { putData } from '../../utils/api'
import CircularProgress from '@mui/material/CircularProgress'

const ForgotPassword = () => {
  const [isLoading,       setIsLoading]      = React.useState(false)
  const [showPassword,    setShowPassword]   = React.useState(false)
  const [showConfirm,     setShowConfirm]    = React.useState(false)
  const [formFields,      setFormFields]     = React.useState({ password: '', confirmpassword: '' })

  const context = React.useContext(Mycontext)
  const history = useNavigate()

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setFormFields(prev => ({ ...prev, [name]: value }))
  }

  const valideValue = Object.values(formFields).every(el => el)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formFields.password)        return context.openAlertBox('error', 'Please enter your password')
    if (!formFields.confirmpassword) return context.openAlertBox('error', 'Please enter confirm password')
    if (formFields.password !== formFields.confirmpassword)
                                     return context.openAlertBox('error', 'Passwords must match')
    setIsLoading(true)
    try {
      const res = await putData('/api/user/reset-password', {
        email:           localStorage.getItem('userEmail'),
        newPassword:     formFields.password,
        confirmPassword: formFields.confirmpassword,
      })
      context.openAlertBox('success', res.message)
      localStorage.removeItem('userEmail')
      history('/login')
    } catch (error) {
      context.openAlertBox('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='bg-gray-50 flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8 sm:p-10'>

        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f51111]/10 mb-4'>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f51111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className='text-[22px] sm:text-[26px] font-[800] text-gray-900 tracking-tight'>Reset Password</h1>
          <p className='text-[13px] text-gray-400 mt-1'>Choose a strong new password</p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

          {/* New Password */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-[12px] font-[700] text-gray-600 uppercase tracking-wider'>New Password</label>
            <div className='relative'>
              <input
                disabled={isLoading}
                value={formFields.password}
                onChange={onChangeInput}
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                className='w-full h-[46px] border border-gray-200 rounded-xl px-4 pr-12 text-[14px]
                           text-gray-800 placeholder-gray-300 outline-none
                           focus:border-[#f51111] focus:ring-2 focus:ring-[#f51111]/10
                           transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400'
              />
              <button type='button' onClick={() => setShowPassword(p => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8
                           flex items-center justify-center rounded-full
                           text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'>
                {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-[12px] font-[700] text-gray-600 uppercase tracking-wider'>Confirm Password</label>
            <div className='relative'>
              <input
                disabled={isLoading}
                value={formFields.confirmpassword}
                onChange={onChangeInput}
                name='confirmpassword'
                type={showConfirm ? 'text' : 'password'}
                placeholder='••••••••'
                className='w-full h-[46px] border border-gray-200 rounded-xl px-4 pr-12 text-[14px]
                           text-gray-800 placeholder-gray-300 outline-none
                           focus:border-[#f51111] focus:ring-2 focus:ring-[#f51111]/10
                           transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400'
              />
              <button type='button' onClick={() => setShowConfirm(p => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8
                           flex items-center justify-center rounded-full
                           text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'>
                {showConfirm ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
              </button>
            </div>
          </div>

          {/* Match indicator */}
          {formFields.confirmpassword && (
            <p className={`text-[12px] font-[600] -mt-1 ${
              formFields.password === formFields.confirmpassword ? 'text-emerald-500' : 'text-red-400'
            }`}>
              {formFields.password === formFields.confirmpassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          {/* Submit */}
          <button
            disabled={!valideValue || isLoading}
            type='submit'
            className='mt-1 w-full h-[48px] rounded-xl font-[700] text-[14px] text-white
                       flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
                       transition-all duration-200'
            style={{ background: 'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)', boxShadow: '0 4px 14px rgba(255,82,82,0.35)' }}
          >
            {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Reset Password'}
          </button>

        </form>
      </div>
    </section>
  )
}

export default ForgotPassword