import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { FcGoogle } from 'react-icons/fc'
import { CircularProgress } from '@mui/material'
import { Mycontext } from '../../App'
import { fetchData, postData, putData } from '../../utils/api'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { firebaseApp } from '../../../firebase'

const auth           = getAuth(firebaseApp)
const googleProvider = new GoogleAuthProvider()

const Login = () => {
  const [isLoading,      setIsLoading]      = React.useState(false)
  const [isShowPassword, setIsPasswordShow] = React.useState(false)
  const [formFields,     setFormFields]     = React.useState({ email: '', password: '' })

  const context = useContext(Mycontext)
  const history = useNavigate()

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setFormFields(prev => ({ ...prev, [name]: value }))
  }

  const valideValue = Object.values(formFields).every(el => el)

  const forgetPassword = async () => {
    if (!formFields.email.trim()) return context.openAlertBox('error', 'Please enter your email first')
    try {
      await putData('/api/user/forgot-password', { email: formFields.email })
      localStorage.setItem('userEmail',  formFields.email)
      localStorage.setItem('actionType', 'forgot-password')
      context.openAlertBox('success', 'Check your email to reset your password')
      history('/verifyAccount')
    } catch (error) {
      context.openAlertBox('error', error.message || 'Failed to send reset email')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formFields.email.trim())    return context.openAlertBox('error', 'Please enter your email')
    if (!formFields.password.trim()) return context.openAlertBox('error', 'Please enter your password')
    setIsLoading(true)
    try {
      const response = await postData('/api/user/login', formFields, { withCredentials: true })
      localStorage.setItem('accessToken',  response?.data?.accessToken  || '')
      localStorage.setItem('refreshToken', response?.data?.refreshToken || '')
      const userRes = await fetchData('/api/user/get-user', { withCredentials: true })
      context.setUserData(userRes.data.data)
      context.setIsLogin(true)
      context.openAlertBox('success', response.message)
      setFormFields({ email: '', password: '' })
      history('/')
    } catch (error) {
      context.openAlertBox('error', error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const authWithGoogle = async () => {
    setIsLoading(true)
    try {
      const result   = await signInWithPopup(auth, googleProvider)
      const user     = result.user
      const response = await postData('/api/user/google-auth', {
        name: user.displayName, email: user.email, image: user.photoURL,
      })
      if (response?.data?.accessToken) {
        localStorage.setItem('accessToken',  response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken || '')
      }
      context.setIsLogin(true)
      context.setUserData(response?.data?.user || null)
      context.openAlertBox('success', response.message || 'Signed in with Google')
      history('/')
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') return
      context.openAlertBox('error', error.message || 'Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className=' bg-gray-50 flex items-center justify-center px-4 py-12'>

      {/* Card */}
      <div className='w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8 sm:p-10'>

        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f51111]/10 mb-4'>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f51111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className='text-[22px] sm:text-[26px] font-[800] text-gray-900 tracking-tight leading-tight'>
            Welcome back
          </h1>
          <p className='text-[13px] text-gray-400 mt-1'>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

          {/* Email */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-[12px] font-[700] text-gray-600 uppercase tracking-wider'>Email</label>
            <input
              disabled={isLoading}
              value={formFields.email}
              onChange={onChangeInput}
              name='email'
              type='email'
              placeholder='you@example.com'
              className='w-full h-[46px] border border-gray-200 rounded-xl px-4 text-[14px]
                         text-gray-800 placeholder-gray-300 outline-none
                         focus:border-[#f51111] focus:ring-2 focus:ring-[#f51111]/10
                         transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400'
            />
          </div>

          {/* Password */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-[12px] font-[700] text-gray-600 uppercase tracking-wider'>Password</label>
              <button
                type='button'
                onClick={forgetPassword}
                className='text-[12px] text-[#f51111] font-[600] hover:text-[#e03f3f] transition-colors'
              >
                Forgot password?
              </button>
            </div>
            <div className='relative'>
              <input
                disabled={isLoading}
                value={formFields.password}
                onChange={onChangeInput}
                name='password'
                type={isShowPassword ? 'text' : 'password'}
                placeholder='••••••••'
                className='w-full h-[46px] border border-gray-200 rounded-xl px-4 pr-12 text-[14px]
                           text-gray-800 placeholder-gray-300 outline-none
                           focus:border-[#f51111] focus:ring-2 focus:ring-[#f51111]/10
                           transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400'
              />
              <button
                type='button'
                onClick={() => setIsPasswordShow(p => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center
                           text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100'
              >
                {isShowPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={!valideValue || isLoading}
            type='submit'
            className='mt-1 w-full h-[48px] rounded-xl font-[700] text-[14px] text-white
                       transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.98]'
            style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #f51111 100%)', boxShadow: '0 4px 14px rgba(255,82,82,0.35)' }}
          >
            {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Sign In'}
          </button>

          {/* Divider */}
          <div className='flex items-center gap-3 my-1'>
            <div className='flex-1 h-px bg-gray-100' />
            <span className='text-[11px] text-gray-400 font-[500] uppercase tracking-wider'>or</span>
            <div className='flex-1 h-px bg-gray-100' />
          </div>

          {/* Google */}
          <button
            type='button'
            onClick={authWithGoogle}
            disabled={isLoading}
            className='w-full h-[46px] rounded-xl border border-gray-200 bg-white text-[13px] font-[600]
                       text-gray-700 flex items-center justify-center gap-2.5
                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

        </form>

        {/* Footer */}
        <p className='text-center text-[13px] text-gray-400 mt-6'>
          Don't have an account?{' '}
          <Link to='/register' className='text-[#f51111] font-[700] hover:text-[#e03f3f] transition-colors'>
            Sign up free
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Login