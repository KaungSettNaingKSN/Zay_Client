import React, { useEffect } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import AccountSlideBar from '../../components/AccountSlideBar'
import { Mycontext } from '../../App'
import { useNavigate } from 'react-router-dom'
import { fetchData, putData } from '../../utils/api'
import { CircularProgress } from '@mui/material'
import { Collapse } from 'react-collapse'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

const MyAccount = () => {
  const context   = React.useContext(Mycontext)
  const history   = useNavigate()

  const [isLoading,              setIsLoading]              = React.useState(false)
  const [isLoading2,             setIsLoading2]             = React.useState(false)
  const [userId,                 setUserId]                 = React.useState(false)
  const [isChangePasswordShow,   setIsChangePasswordShow]   = React.useState(false)

  const [formFields, setFormFields] = React.useState({ email: '', name: '', mobile: '' })
  const [changePassword, setChangePassword] = React.useState({
    email: '', oldPassword: '', newPassword: '', confirmPassword: ''
  })

  const mobileValue = typeof formFields.mobile === 'string'
    ? formFields.mobile : String(formFields.mobile ?? '')

  const valideValue = Object.values(changePassword).every(el => el)

  useEffect(() => {
    if (!context.isLogin) history('/login')
  }, [context.isLogin, history])

  useEffect(() => {
    if (context?.userData?._id) {
      setUserId(context.userData._id)
      setFormFields({
        name:   context.userData.name   ?? '',
        email:  context.userData.email  ?? '',
        mobile: context.userData.mobile ?? '',
      })
      setChangePassword(prev => ({ ...prev, email: context.userData.email ?? '' }))
    }
  }, [context?.userData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formFields.name)  { context.openAlertBox('error', 'Please enter your name');  return }
    if (!formFields.email) { context.openAlertBox('error', 'Please enter your email'); return }
    setIsLoading(true)
    try {
      const response = await putData(`/api/user/${userId}`, formFields, { withCredentials: true })
      const userRes  = await fetchData('/api/user/get-user', { withCredentials: true })
      context.setUserData(userRes.data.data)
      context.openAlertBox('success', response.message)
    } catch (error) {
      context.openAlertBox('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault()
    setIsLoading2(true)
    try {
      const response = await putData('/api/user/reset-password', changePassword, { withCredentials: true })
      setChangePassword({ email: context.userData.email ?? '', newPassword: '', confirmPassword: '', oldPassword: '' })
      context.openAlertBox('success', response.message)
    } catch (error) {
      context.openAlertBox('error', error.message)
    } finally {
      setIsLoading2(false)
    }
  }

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setFormFields(prev => ({ ...prev, [name]: value }))
  }

  const onChangePassword = (e) => {
    const { name, value } = e.target
    setChangePassword(prev => ({ ...prev, [name]: value }))
  }

  return (
    <section className='py-5 sm:py-10 w-full bg-gray-50 min-h-screen'>
      <div className='container px-3 sm:px-4'>

        {/* Mobile: avatar bar sits above content */}
        <div className='md:hidden'>
          <AccountSlideBar />
        </div>

        <div className='flex gap-5 items-start'>

          {/* Desktop sidebar */}
          <div className='hidden md:block w-[28%] flex-shrink-0'>
            <AccountSlideBar />
          </div>

          {/* Main content */}
          <div className='flex-1 min-w-0 pb-20 md:pb-0 flex flex-col gap-4'>

            {/* Profile card */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 !mb-4'>
                <h2 className='text-[18px] sm:text-[20px] font-[700] text-gray-900'>My Account</h2>
                {(context.userData?.signInWithGoogle === false || context.userData?.signInWithGoogle == null) && (
                  <Button
                    onClick={() => setIsChangePasswordShow(p => !p)}
                    variant='outlined'
                    size='small'
                    className='!border-[#f51111] !text-[#f51111] !capitalize !rounded-xl !text-[12px] !font-[600] self-start sm:self-auto'
                  >
                    {isChangePasswordShow ? 'Hide' : 'Change Password'}
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                {/* Name + Email stack on mobile, row on sm+ */}
                <div className='flex flex-col sm:flex-row gap-4'>
                  <TextField
                    onChange={onChangeInput}
                    disabled={isLoading}
                    value={formFields.name}
                    name='name'
                    label='Full Name'
                    variant='outlined'
                    size='small'
                    className='w-full'
                  />
                  <TextField
                    disabled
                    value={formFields.email}
                    name='email'
                    label='Email'
                    variant='outlined'
                    size='small'
                    className='w-full'
                  />
                </div>

                <PhoneInput
                  defaultCountry='mm'
                  value={mobileValue}
                  onChange={(mobile) => setFormFields(prev => ({ ...prev, mobile: mobile ?? '' }))}
                  className='w-full sm:w-[calc(33.333%-8px)]'
                  inputClassName='!w-full !h-[40px] !text-sm !px-[14px]'
                  countrySelectorStyleProps={{ buttonClassName: '!h-[40px] !text-sm !px-[14px]' }}
                  disabled={isLoading}
                />

                <div>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isLoading}
                    className='!bg-[#f51111] !capitalize !px-8 !py-2 !text-white !rounded-xl !text-[13px] !font-[700] !shadow-none'
                  >
                    {isLoading ? <CircularProgress size={22} color='inherit' /> : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Change password */}
            {isChangePasswordShow && (
              <Collapse isOpened={isChangePasswordShow}>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5'>
                  <h2 className='text-[16px] sm:text-[18px] font-[700] text-gray-900 mb-4'>Change Password</h2>
                  <form onSubmit={handleSubmitChangePassword} className='flex flex-col gap-4'>
                    <div className='flex flex-col sm:flex-row gap-4'>
                      <TextField
                        onChange={onChangePassword}
                        disabled={isLoading2}
                        value={changePassword.oldPassword}
                        name='oldPassword'
                        label='Old Password'
                        type='password'
                        variant='outlined'
                        size='small'
                        className='w-full'
                      />
                      <TextField
                        onChange={onChangePassword}
                        disabled={isLoading2}
                        value={changePassword.newPassword}
                        name='newPassword'
                        label='New Password'
                        type='password'
                        variant='outlined'
                        size='small'
                        className='w-full'
                      />
                      <TextField
                        onChange={onChangePassword}
                        disabled={isLoading2}
                        value={changePassword.confirmPassword}
                        name='confirmPassword'
                        label='Confirm Password'
                        type='password'
                        variant='outlined'
                        size='small'
                        className='w-full'
                      />
                    </div>
                    <div>
                      <Button
                        disabled={!valideValue || isLoading2}
                        type='submit'
                        variant='contained'
                        className='!bg-[#f51111] !capitalize !px-8 !py-2 !text-white !rounded-xl !text-[13px] !font-[700] !shadow-none'
                      >
                        {isLoading2 ? <CircularProgress size={22} color='inherit' /> : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              </Collapse>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyAccount