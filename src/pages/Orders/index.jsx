import React, { useContext, useEffect, useState } from 'react'
import { Button } from '@mui/material'
import AccountSlideBar from '../../components/AccountSlideBar'
import { FaAngleDown } from 'react-icons/fa'
import { MdOutlineShoppingBag } from 'react-icons/md'
import { Collapse } from 'react-collapse'
import { fetchData } from '../../utils/api'
import { Mycontext } from '../../App'
import { Link } from 'react-router-dom'

const StatusBadge = ({ status }) => {
  const map = {
    pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
    paid:       'bg-emerald-100 text-emerald-700 border-emerald-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped:    'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered:  'bg-green-100 text-green-700 border-green-200',
    cancelled:  'bg-red-100 text-red-600 border-red-200',
    refunded:   'bg-gray-100 text-gray-600 border-gray-200',
  }
  const cls = map[status?.toLowerCase()] || 'bg-gray-100 text-gray-500 border-gray-200'
  return (
    <span className={`text-[11px] font-[700] px-2.5 py-[3px] rounded-full border capitalize ${cls}`}>
      {status || 'Unknown'}
    </span>
  )
}

const SkeletonRow = () => (
  <tr className='border-b border-gray-100'>
    {[...Array(6)].map((_, i) => (
      <td key={i} className='p-4'>
        <div className='h-[14px] rounded bg-gray-100 animate-pulse w-[80%]' />
      </td>
    ))}
  </tr>
)

const SkeletonCard = () => (
  <div className='bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3'>
    <div className='flex justify-between'>
      <div className='h-[13px] rounded bg-gray-100 animate-pulse w-[40%]' />
      <div className='h-[22px] rounded-full bg-gray-100 animate-pulse w-[60px]' />
    </div>
    <div className='h-[13px] rounded bg-gray-100 animate-pulse w-[55%]' />
    <div className='flex gap-2'>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='w-[32px] h-[32px] rounded-full bg-gray-100 animate-pulse' />
      ))}
    </div>
    <div className='h-[36px] rounded-xl bg-gray-100 animate-pulse w-full' />
  </div>
)

const fmt = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const Orders = () => {
  const context = useContext(Mycontext)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [openRow, setOpenRow] = useState(null)

  useEffect(() => {
    if (!context?.isLogin) { setLoading(false); return }
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetchData('/api/order')
        const data = res?.data?.data ?? res?.data ?? res
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        context?.openAlertBox?.('error', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [context?.isLogin])

  const toggleRow = (index) => setOpenRow(openRow === index ? null : index)

  // Shared expanded detail panel
  const OrderDetail = ({ order }) => {
    const items  = order.items || []
    const addr   = order.delivery_address || {}
    const isCod  = order.paymentId === 'COD'
    return (
      <div className='p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-4'>
        {/* Items */}
        <div>
          <p className='text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-2'>
            Order Items ({items.length})
          </p>
          <div className='flex flex-col gap-2'>
            {items.map((item, i) => {
              const details = item.product_details || {}
              const prod    = item.productId       || {}
              const img     = details.image?.[0]   || prod.images?.[0] || null
              return (
                <div key={i} className='flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100'>
                  <div className='w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
                    {img
                      ? <img src={img} alt={details.name} className='w-full h-full object-cover' />
                      : <div className='w-full h-full flex items-center justify-center text-gray-300 text-[10px]'>No img</div>
                    }
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[12px] sm:text-[13px] font-[600] text-gray-800 truncate'>
                      {details.name || prod.name || 'Product'}
                    </p>
                    <div className='flex flex-wrap gap-1 mt-0.5'>
                      {details.size          && <span className='text-[9px] bg-gray-100 text-gray-500 px-1.5 py-[1px] rounded-full'>{details.size}</span>}
                      {details.productRam    && <span className='text-[9px] bg-gray-100 text-gray-500 px-1.5 py-[1px] rounded-full'>{details.productRam}</span>}
                      {details.productWeight && <span className='text-[9px] bg-gray-100 text-gray-500 px-1.5 py-[1px] rounded-full'>{details.productWeight}</span>}
                      {details.productColor  && <span className='text-[9px] bg-gray-100 text-gray-500 px-1.5 py-[1px] rounded-full'>{details.productColor}</span>}
                    </div>
                  </div>
                  <div className='text-right flex-shrink-0'>
                    <p className='text-[11px] text-gray-400'>×{item.quantity || 1}</p>
                    <p className='text-[12px] sm:text-[13px] font-[700] text-[#f51111]'>
                      ${Number(item.sub_total ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className='flex gap-3 flex-col sm:flex-row'>
          {(addr.address_line || addr.city) && (
            <div className='flex-1'>
              <p className='text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-2'>Delivery Address</p>
              <div className='bg-white rounded-xl p-3 border border-gray-100 text-[12px] text-gray-600 leading-relaxed'>
                <p className='font-[700] text-[10px] uppercase tracking-widest text-gray-400 mb-1'>{addr.address_name || 'Home'}</p>
                <p>{addr.address_line}</p>
                <p>{addr.city}, {addr.state}</p>
                <p>{addr.country} — {addr.pincode}</p>
                {addr.mobile && <p className='text-gray-400 mt-1'>📞 {addr.mobile}</p>}
              </div>
            </div>
          )}
          <div className='flex-1'>
            <p className='text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-2'>Payment Info</p>
            <div className='bg-white rounded-xl p-3 border border-gray-100 text-[12px] text-gray-600'>
              <div className='flex justify-between mb-1.5'>
                <span className='text-gray-400'>Method</span>
                <span className='font-[600]'>{isCod ? 'Cash on Delivery' : 'Card'}</span>
              </div>
              <div className='flex justify-between mb-1.5'>
                <span className='text-gray-400'>Status</span>
                <StatusBadge status={order.payment_status} />
              </div>
              <div className='flex justify-between border-t border-gray-100 pt-1.5 mt-1.5'>
                <span className='text-gray-400'>Total</span>
                <span className='font-[800] text-[#f51111]'>${Number(order.total_amount ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty / not logged in states
  const EmptyState = ({ icon, title, sub, link, linkLabel }) => (
    <div className='flex flex-col items-center py-12 sm:py-16 gap-3 text-center px-4'>
      {icon}
      <p className='text-[14px] sm:text-[15px] font-[600] text-gray-500'>{title}</p>
      {sub && <p className='text-[12px] sm:text-[13px] text-gray-400'>{sub}</p>}
      {link && (
        <Link to={link} className='mt-1 px-5 py-2.5 bg-[#f51111] text-white rounded-xl text-[13px] font-[700] hover:bg-[#e03f3f] transition-colors'>
          {linkLabel}
        </Link>
      )}
    </div>
  )

  return (
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
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

              {/* Header */}
              <div className='border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between'>
                <div>
                  <h2 className='text-[16px] sm:text-[18px] font-[700] text-gray-900'>My Orders</h2>
                  {!loading && (
                    <p className='text-[12px] sm:text-[13px] text-gray-400 mt-0.5'>
                      {orders.length > 0
                        ? `${orders.length} order${orders.length !== 1 ? 's' : ''}`
                        : 'No orders yet'}
                    </p>
                  )}
                </div>
                <MdOutlineShoppingBag size={22} className='text-gray-300' />
              </div>

              {!context?.isLogin ? (
                <EmptyState
                  icon={<MdOutlineShoppingBag size={44} className='text-gray-200' />}
                  title='Please log in to view your orders'
                  link='/login' linkLabel='Log In'
                />

              ) : loading ? (
                <>
                  {/* Desktop skeleton */}
                  <div className='hidden sm:block overflow-x-auto'>
                    <table className='w-full text-left'>
                      <thead>
                        <tr className='border-b border-gray-100 bg-gray-50'>
                          <th className='p-4 w-[50px]' />
                          {['Order ID','Date','Items','Total','Payment','Status'].map(h => (
                            <th key={h} className='p-4 text-[11px] font-[600] text-gray-400 uppercase tracking-wide'>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
                    </table>
                  </div>
                  {/* Mobile skeleton */}
                  <div className='sm:hidden p-3 flex flex-col gap-3'>
                    {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                </>

              ) : orders.length === 0 ? (
                <EmptyState
                  icon={<MdOutlineShoppingBag size={44} className='text-gray-200' />}
                  title='No orders yet'
                  sub='Your orders will appear here after checkout'
                  link='/productListing' linkLabel='Start Shopping'
                />

              ) : (
                <>
                  {/* ── Desktop table (sm+) ── */}
                  <div className='hidden sm:block overflow-x-auto'>
                    <table className='w-full text-left'>
                      <thead>
                        <tr className='border-b border-gray-100 bg-gray-50'>
                          <th className='p-4 w-[50px]' />
                          {['Order ID','Date','Items','Total','Payment','Status'].map(h => (
                            <th key={h} className='p-4 text-[11px] font-[600] text-gray-400 uppercase tracking-wide'>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => {
                          const isOpen      = openRow === index
                          const items       = order.items || []
                          const isCod       = order.paymentId === 'COD'
                          const previewImgs = items.slice(0, 3).map(it =>
                            it.product_details?.image?.[0] || it.productId?.images?.[0] || null
                          )
                          return (
                            <React.Fragment key={order._id || index}>
                              <tr className={`border-b border-gray-100 transition-colors
                                              ${isOpen ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}>
                                <td className='p-4'>
                                  <Button onClick={() => toggleRow(index)}
                                    className='!text-gray-500 !rounded-full !w-[34px] !min-w-[34px] !h-[34px] hover:!bg-gray-100'>
                                    <FaAngleDown className={`transition-transform duration-200 text-[12px] ${isOpen ? 'rotate-180' : ''}`} />
                                  </Button>
                                </td>
                                <td className='p-4'>
                                  <span className='text-[12px] font-[600] text-gray-700 font-mono'>
                                    #{order.orderId?.slice(0, 8).toUpperCase() || '—'}
                                  </span>
                                </td>
                                <td className='p-4 text-[13px] text-gray-500 whitespace-nowrap'>{fmt(order.createdAt)}</td>
                                <td className='p-4'>
                                  <div className='flex items-center gap-2'>
                                    <div className='flex -space-x-2'>
                                      {previewImgs.map((img, i) => (
                                        <div key={i} className='w-[26px] h-[26px] rounded-full overflow-hidden bg-gray-200 border-2 border-white flex-shrink-0'>
                                          {img ? <img src={img} alt='' className='w-full h-full object-cover' /> : <div className='w-full h-full bg-gray-200' />}
                                        </div>
                                      ))}
                                    </div>
                                    <span className='text-[12px] text-gray-500'>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                                  </div>
                                </td>
                                <td className='p-4'>
                                  <span className='text-[13px] font-[700] text-gray-800'>
                                    ${Number(order.total_amount ?? 0).toFixed(2)}
                                  </span>
                                </td>
                                <td className='p-4'>
                                  <span className={`text-[11px] font-[600] px-2 py-[3px] rounded-full
                                    ${isCod ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {isCod ? '💵 COD' : '💳 Card'}
                                  </span>
                                </td>
                                <td className='p-4'><StatusBadge status={order.payment_status} /></td>
                              </tr>
                              <tr>
                                <td colSpan={7} className='p-0'>
                                  <Collapse isOpened={isOpen}>
                                    <OrderDetail order={order} />
                                  </Collapse>
                                </td>
                              </tr>
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Mobile cards ── */}
                  <div className='sm:hidden flex flex-col divide-y divide-gray-100'>
                    {orders.map((order, index) => {
                      const isOpen      = openRow === index
                      const items       = order.items || []
                      const previewImgs = items.slice(0, 3).map(it =>
                        it.product_details?.image?.[0] || it.productId?.images?.[0] || null
                      )
                      return (
                        <div key={order._id || index} className={`transition-colors ${isOpen ? 'bg-red-50/30' : ''}`}>
                          {/* Card summary row */}
                          <div className='p-3 flex items-center gap-3'
                               onClick={() => toggleRow(index)}>
                            {/* Product thumbnails */}
                            <div className='flex -space-x-2 flex-shrink-0'>
                              {previewImgs.map((img, i) => (
                                <div key={i} className='w-[32px] h-[32px] rounded-full overflow-hidden bg-gray-200 border-2 border-white'>
                                  {img ? <img src={img} alt='' className='w-full h-full object-cover' /> : <div className='w-full h-full bg-gray-200' />}
                                </div>
                              ))}
                            </div>

                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-1.5 flex-wrap'>
                                <span className='text-[12px] font-[700] text-gray-700 font-mono'>
                                  #{order.orderId?.slice(0, 8).toUpperCase() || '—'}
                                </span>
                                <StatusBadge status={order.payment_status} />
                              </div>
                              <p className='text-[11px] text-gray-400 mt-0.5'>
                                {fmt(order.createdAt)} · {items.length} item{items.length !== 1 ? 's' : ''}
                              </p>
                            </div>

                            <div className='flex items-center gap-2 flex-shrink-0'>
                              <span className='text-[14px] font-[800] text-[#f51111]'>
                                ${Number(order.total_amount ?? 0).toFixed(2)}
                              </span>
                              <FaAngleDown className={`text-gray-400 text-[12px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* Expandable detail */}
                          <Collapse isOpened={isOpen}>
                            <OrderDetail order={order} />
                          </Collapse>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Orders