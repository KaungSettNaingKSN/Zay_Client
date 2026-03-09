import React, { useContext, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaCloudUploadAlt, FaRegHeart } from 'react-icons/fa'
import { BsPersonBoundingBox } from 'react-icons/bs'
import { FaRegUser } from 'react-icons/fa'
import { BsFillBagCheckFill } from 'react-icons/bs'
import { IoIosLogOut } from 'react-icons/io'
import { LuMapPinPlus } from 'react-icons/lu'
import { CircularProgress } from '@mui/material'
import { Mycontext } from '../../App'
import { putData } from '../../utils/api'

const NAV_ITEMS = [
  { to: '/my-account', icon: <FaRegUser size={15} />,          label: 'Profile'   },
  { to: '/addresses',  icon: <LuMapPinPlus size={15} />,       label: 'Addresses' },
  { to: '/my-list',    icon: <FaRegHeart size={15} />,         label: 'Wishlist'  },
  { to: '/orders',     icon: <BsFillBagCheckFill size={14} />, label: 'Orders'    },
]

// ── Shared logout confirm dialog ──────────────────────────────────────────────
const LogoutConfirmDialog = ({ open, onConfirm, onCancel }) => {
  if (!open) return null
  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center px-4'
      onClick={onCancel}
    >
      <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px]' />
      <div
        className='relative bg-white rounded-3xl shadow-2xl w-full max-w-[340px] p-7
                   flex flex-col items-center gap-4'
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className='w-[60px] h-[60px] rounded-2xl bg-red-50 flex items-center justify-center'>
          <IoIosLogOut size={28} className='text-[#f51111]' />
        </div>

        {/* Text */}
        <div className='text-center'>
          <h3 className='text-[17px] font-[800] text-gray-900 mb-1'>Log out?</h3>
          <p className='text-[13px] text-gray-400 leading-relaxed'>
            You'll need to sign in again to access your account, cart, and orders.
          </p>
        </div>

        {/* Buttons */}
        <div className='flex gap-3 w-full mt-1'>
          <button
            onClick={onCancel}
            className='flex-1 h-[44px] rounded-xl border-2 border-gray-200 text-gray-600
                       text-[13px] font-[700] hover:bg-gray-50 transition-colors active:scale-[0.97]'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 h-[44px] rounded-xl text-white text-[13px] font-[700]
                       transition-all active:scale-[0.97]'
            style={{
              background: 'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)',
              boxShadow: '0 4px 14px rgba(245,17,17,0.35)',
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

const AccountSlideBar = () => {
  const context  = useContext(Mycontext)
  const navigate = useNavigate()

  const [preview,          setPreview]          = useState(context?.userData?.avatar ? [context.userData.avatar] : [])
  const [uploading,        setUploading]        = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  React.useEffect(() => {
    if (context?.userData?.avatar) setPreview([context.userData.avatar])
  }, [context?.userData?.avatar])

  const onChangeFile = async (e) => {
    try {
      const files    = e.target.files
      const formData = new FormData()
      setUploading(true)
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(f.type)) {
          context?.openAlertBox?.('error', 'Please use a valid image format')
          return
        }
        formData.append('avatar', f)
        const res = await putData('/api/user/user-avatar', formData)
        setPreview([res?.avatar])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const requestLogout = () => setLogoutDialogOpen(true)

  const confirmLogout = () => {
    setLogoutDialogOpen(false)
    context?.setIsLogin?.(false)
    context?.setUserData?.({})
    navigate('/login')
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className='hidden md:block rounded-xl shadow-sm border border-gray-100 bg-white sticky top-[10px] overflow-hidden'>

        {/* Avatar + info */}
        <div className='flex flex-col items-center justify-center p-6 gap-2'>
          <div className='w-[100px] h-[100px] rounded-full border-2 border-gray-100 overflow-hidden relative flex-shrink-0'>
            {preview.length > 0
              ? <img src={preview[0]} alt='avatar' className='w-full h-full object-cover' />
              : <div className='w-full h-full flex items-center justify-center bg-gray-50'>
                  <BsPersonBoundingBox size={48} className='text-gray-300' />
                </div>
            }
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/40
                             ${uploading ? 'opacity-90' : 'opacity-0 hover:opacity-90'}`}>
              {uploading
                ? <CircularProgress size={22} color='inherit' sx={{ color: '#fff' }} />
                : <>
                    <input type='file' accept='image/*' name='avatar' disabled={uploading}
                      onChange={onChangeFile}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
                    <FaCloudUploadAlt size={32} color='white' />
                  </>
              }
            </div>
          </div>
          <h2 className='text-[15px] font-[700] text-gray-900 text-center leading-tight'>
            {context?.userData?.name || 'User'}
          </h2>
          <p className='text-[12px] text-gray-400 text-center truncate max-w-full'>
            {context?.userData?.email}
          </p>
        </div>

        {/* Nav */}
        <ul className='border-t border-gray-100 list-none p-0 m-0'>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 text-[13px] font-[600] transition-colors duration-150
                   ${isActive
                     ? 'bg-red-50 text-[#f51111] border-r-2 border-[#f51111]'
                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }>
                {icon} {label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={requestLogout}
              className='w-full flex items-center gap-3 px-5 py-3 text-[13px] font-[600]
                         text-gray-600 hover:bg-red-50 hover:text-[#f51111] transition-colors'
            >
              <IoIosLogOut size={15} /> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* ── Mobile: compact avatar row ── */}
      <div className='md:hidden flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-4'>
        <div className='w-[44px] h-[44px] rounded-full border-2 border-gray-100 overflow-hidden relative flex-shrink-0'>
          {preview.length > 0
            ? <img src={preview[0]} alt='avatar' className='w-full h-full object-cover' />
            : <div className='w-full h-full flex items-center justify-center bg-gray-50'>
                <BsPersonBoundingBox size={22} className='text-gray-300' />
              </div>
          }
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/40 rounded-full
                           ${uploading ? 'opacity-90' : 'opacity-0 hover:opacity-90'}`}>
            {uploading
              ? <CircularProgress size={14} color='inherit' sx={{ color: '#fff' }} />
              : <>
                  <input type='file' accept='image/*' name='avatar' disabled={uploading}
                    onChange={onChangeFile}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
                  <FaCloudUploadAlt size={16} color='white' />
                </>
            }
          </div>
        </div>
        <div className='min-w-0'>
          <p className='text-[14px] font-[700] text-gray-900 truncate'>{context?.userData?.name || 'User'}</p>
          <p className='text-[11px] text-gray-400 truncate'>{context?.userData?.email}</p>
        </div>
      </div>

      {/* ── Mobile: sticky bottom nav bar ── */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg'>
        <div className='flex items-center justify-around'>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1 text-center transition-colors
                 ${isActive ? 'text-[#f51111]' : 'text-gray-400 hover:text-gray-700'}`
              }>
              {icon}
              <span className='text-[9px] font-[600]'>{label}</span>
            </NavLink>
          ))}
          <button
            onClick={requestLogout}
            className='flex flex-col items-center gap-0.5 py-2.5 px-3 flex-1
                       text-gray-400 hover:text-[#f51111] transition-colors'
          >
            <IoIosLogOut size={15} />
            <span className='text-[9px] font-[600]'>Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Logout confirm dialog ── */}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </>
  )
}

export default AccountSlideBar