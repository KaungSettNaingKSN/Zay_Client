import React, { useContext, useEffect, useRef, useState } from 'react'
import { CircularProgress } from '@mui/material'
import AccountSlideBar from '../../components/AccountSlideBar'
import { deleteData, fetchData, postData, putData } from '../../utils/api'
import { Mycontext } from '../../App'
import Drawer from '@mui/material/Drawer'
import { IoCloseSharp } from 'react-icons/io5'
import Button from '@mui/material/Button'
import { MdOutlineDeleteOutline, MdOutlineEdit, MdMoreVert } from 'react-icons/md'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

const EMPTY_FORM = {
  address_name: 'Home',
  address_line: '',
  city:         '',
  state:        '',
  pincode:      '',
  country:      '',
  mobile:       '',
  status:       false,
}

const TEXT_FIELDS = [
  { label: 'Address Label (e.g. Home, Work)', name: 'address_name' },
  { label: 'Address Line',                    name: 'address_line' },
  { label: 'City',                            name: 'city'         },
  { label: 'State',                           name: 'state'        },
  { label: 'Pincode',                         name: 'pincode'      },
  { label: 'Country',                         name: 'country'      },
]

const Address = () => {
  const context = useContext(Mycontext)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId,  setEditingId]  = useState(null)
  const [formFields, setFormFields] = useState(EMPTY_FORM)
  const [status,     setStatus]     = useState(false)
  const [isLoading,  setIsLoading]  = useState(false)

  const [selectedValue,      setSelectedValue]      = useState('')
  const [selectingAddressId, setSelectingAddressId] = useState(null)
  const [openMenuId,         setOpenMenuId]         = useState(null)
  const menuRef = useRef(null)

  const mobileValue = typeof formFields.mobile === 'string'
    ? formFields.mobile : String(formFields.mobile ?? '')

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const def = context?.userData?.address_details?.find(a => a.status)
    if (def?._id) setSelectedValue(def._id)
  }, [context?.userData?.address_details])

  const openAddDrawer = () => {
    setEditingId(null)
    setFormFields(EMPTY_FORM)
    setStatus(false)
    setDrawerOpen(true)
  }

  const openEditDrawer = (address) => {
    setOpenMenuId(null)
    setEditingId(address._id)
    setFormFields({
      address_name: address.address_name || 'Home',
      address_line: address.address_line || '',
      city:         address.city         || '',
      state:        address.state        || '',
      pincode:      address.pincode      || '',
      country:      address.country      || '',
      mobile:       address.mobile       || '',
      status:       address.status       ?? false,
    })
    setStatus(address.status ?? false)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => { setEditingId(null); setFormFields(EMPTY_FORM); setStatus(false) }, 300)
  }

  const onChangeInput = (e) => {
    const { name, value } = e.target
    setFormFields(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (e) => {
    const val = e.target.value === true || e.target.value === 'true'
    setStatus(val)
    setFormFields(prev => ({ ...prev, status: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const digits = String(formFields.mobile || '').replace(/\D/g, '')
    if (!formFields.address_line) { context.openAlertBox('error', 'Please enter address line'); setIsLoading(false); return }
    if (digits.length < 7)        { context.openAlertBox('error', 'Please enter a valid mobile'); setIsLoading(false); return }
    if (!formFields.city)         { context.openAlertBox('error', 'Please enter city');    setIsLoading(false); return }
    if (!formFields.country)      { context.openAlertBox('error', 'Please enter country'); setIsLoading(false); return }
    if (!formFields.pincode)      { context.openAlertBox('error', 'Please enter pincode'); setIsLoading(false); return }
    if (!formFields.state)        { context.openAlertBox('error', 'Please enter state');   setIsLoading(false); return }
    try {
      let response
      if (editingId) response = await putData('/api/address/edit', { _id: editingId, ...formFields })
      else           response = await postData('/api/address/create', formFields)
      const userRes = await fetchData('/api/user/get-user')
      context.setUserData(userRes.data.data)
      closeDrawer()
      context.openAlertBox('success', response.data?.message || (editingId ? 'Address updated' : 'Address added'))
    } catch (error) {
      context.openAlertBox('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAddress = async (addressId) => {
    if (addressId === selectedValue || selectingAddressId) return
    const prev = selectedValue
    try {
      setSelectingAddressId(addressId)
      setSelectedValue(addressId)
      context.setUserData(p => ({
        ...p,
        address_details: (p?.address_details || []).map(a => ({ ...a, status: a._id === addressId }))
      }))
      await putData(`/api/address/select/${addressId}`, {})
      context.openAlertBox('success', 'Default address updated')
    } catch (error) {
      setSelectedValue(prev)
      context.setUserData(p => ({
        ...p,
        address_details: (p?.address_details || []).map(a => ({ ...a, status: a._id === prev }))
      }))
      context.openAlertBox('error', error.message)
    } finally {
      setSelectingAddressId(null)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    setOpenMenuId(null)
    try {
      await deleteData('/api/address/delete', { _id: addressId })
      const userRes = await fetchData('/api/user/get-user')
      context.setUserData(userRes.data.data)
      context.openAlertBox('success', 'Address deleted')
    } catch (error) {
      context.openAlertBox('error', error.message)
    }
  }

  return (
    <>
      <section className='py-5 sm:py-10 w-full bg-gray-50 min-h-screen'>
        <div className='container px-3 sm:px-4'>

          <div className='md:hidden'>
            <AccountSlideBar />
          </div>

          <div className='flex gap-5 items-start'>

            <div className='hidden md:block w-[28%] flex-shrink-0'>
              <AccountSlideBar />
            </div>

            <div className='flex-1 min-w-0 pb-20 md:pb-0'>
              <div className='flex items-center justify-between !mb-4 !mt-5'>
                <h2 className='text-[18px] sm:text-[20px] font-[700] text-gray-900'>My Addresses</h2>
              </div>

              <div className='flex flex-col gap-3'>
                {context?.userData?.address_details?.map((address, index) => {
                  const isSelected  = selectedValue      === address._id
                  const isSelecting = selectingAddressId === address._id
                  const menuOpen    = openMenuId         === address._id

                  return (
                    <div
                      key={address._id || index}
                      onClick={() => handleSelectAddress(address._id)}
                      className={`rounded-xl p-3 sm:p-4 pr-10 transition-all duration-200 relative
                        ${selectingAddressId ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                        ${isSelected
                          ? 'border-2 border-[#f51111] bg-red-50 shadow-sm'
                          : 'border border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'}`}
                    >
                      <span className='text-[9px] sm:text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-1 block'>
                        {address.address_name || 'Home'}
                      </span>
                      <p className='text-[13px] sm:text-[14px] text-gray-800 font-[500] leading-relaxed'>
                        {address.address_line}, {address.city}, {address.state}, {address.country} — {address.pincode}
                      </p>
                      <p className='text-[12px] sm:text-[13px] text-gray-500 mt-0.5'>
                        📞 {address.mobile}
                      </p>
                      {isSelected && !isSelecting && (
                        <span className='text-[11px] text-[#f51111] font-[700] mt-1 inline-block'>✓ Default</span>
                      )}
                      {isSelecting && (
                        <span className='text-[11px] text-gray-500 font-[500] mt-1 inline-flex items-center gap-1'>
                          <CircularProgress size={9} /> Selecting…
                        </span>
                      )}

                      {/* More menu */}
                      <div className='absolute top-2.5 right-2.5' ref={menuOpen ? menuRef : null}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : address._id) }}
                          className='w-[28px] h-[28px] rounded-full flex items-center justify-center
                                     text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors'>
                          <MdMoreVert size={17} />
                        </button>
                        {menuOpen && (
                          <div className='absolute right-0 top-[32px] z-50 w-[130px] bg-white rounded-xl
                                          shadow-xl border border-gray-100 overflow-hidden py-1'>
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditDrawer(address) }}
                              className='w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-[600]
                                         text-gray-700 hover:bg-gray-50 transition-colors'>
                              <MdOutlineEdit size={14} className='text-blue-500' /> Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address._id) }}
                              className='w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-[600]
                                         text-red-500 hover:bg-red-50 transition-colors'>
                              <MdOutlineDeleteOutline size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {!context?.userData?.address_details?.length && (
                  <div className='text-center py-10 text-gray-400 text-[13px] border border-dashed border-gray-200 rounded-xl bg-white'>
                    No addresses saved yet
                  </div>
                )}
              </div>

              <button
                onClick={openAddDrawer}
                className='flex items-center w-full bg-blue-50 border border-blue-200 !mt-3
                           rounded-xl justify-center cursor-pointer hover:bg-blue-100
                           transition-colors duration-200 py-3.5 sm:py-4'>
                <span className='text-[13px] sm:text-[14px] font-[600] text-blue-600'>+ Add New Address</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add / Edit Drawer — full width on mobile */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        anchor='right'
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        <div className='flex items-center justify-between p-4 sm:p-5 border-b border-gray-100'>
          <h4 className='text-[15px] sm:text-[16px] font-[700] text-gray-900'>
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h4>
          <IoCloseSharp size={21} className='cursor-pointer text-gray-500 hover:text-black transition-colors'
            onClick={closeDrawer} />
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col flex-1 min-h-0'>
          <div className='flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 pb-4'>
            {TEXT_FIELDS.map(({ label, name }) => (
              <div key={name}>
                <h3 className='text-[12px] sm:text-[13px] font-[600] text-gray-700 mb-1.5'>{label}</h3>
                <input
                  onChange={onChangeInput}
                  value={formFields[name]}
                  disabled={isLoading}
                  name={name}
                  type='text'
                  placeholder={label}
                  className='w-full h-[42px] border border-gray-200 focus:outline-none
                             focus:border-[#f51111] rounded-lg px-3 text-[13px]
                             transition-colors disabled:bg-gray-50 disabled:text-gray-400'
                />
              </div>
            ))}

            <div>
              <h3 className='text-[12px] sm:text-[13px] font-[600] text-gray-700 mb-1.5'>Mobile</h3>
              <PhoneInput
                defaultCountry='mm'
                value={mobileValue}
                onChange={(mobile) => setFormFields(prev => ({ ...prev, mobile: mobile ?? '' }))}
                disabled={isLoading}
                className='w-full'
                inputClassName='!w-full !h-[42px] !text-[13px] !px-3 !border-gray-200 !rounded-r-lg'
                countrySelectorStyleProps={{ buttonClassName: '!h-[42px] !px-3 !border-gray-200 !rounded-l-lg' }}
              />
            </div>

            <div>
              <h3 className='text-[12px] sm:text-[13px] font-[600] text-gray-700 mb-1.5'>Set as Default Address</h3>
              <Select value={status} onChange={handleStatusChange} disabled={isLoading} className='w-full !h-[42px] !text-[13px]'>
                <MenuItem value={true}>Yes — make this my default</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </div>
          </div>

          <div className='flex-shrink-0 bg-white border-t border-gray-100 p-3 sm:p-4'>
            <div className='flex gap-2 sm:gap-3'>
              <Button onClick={closeDrawer} variant='outlined' disabled={isLoading}
                className='!flex-1 !capitalize !border-gray-300 !text-gray-600 !rounded-xl !py-2 sm:!py-2.5 !text-[13px]'>
                Cancel
              </Button>
              <Button type='submit' variant='contained' disabled={isLoading}
                className='!flex-1 !bg-[#f51111] !capitalize !rounded-xl !py-2 sm:!py-2.5 !text-[13px] sm:!text-[14px] !font-[700] !shadow-none'>
                {isLoading
                  ? <CircularProgress size={20} color='inherit' />
                  : editingId ? 'Save Changes' : 'Add Address'
                }
              </Button>
            </div>
          </div>
        </form>
      </Drawer>
    </>
  )
}

export default Address