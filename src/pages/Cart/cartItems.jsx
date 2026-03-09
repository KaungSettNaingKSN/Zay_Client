import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { IoCloseSharp } from 'react-icons/io5'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { MdCheck } from 'react-icons/md'
import { Mycontext } from '../../App'
import { putData } from '../../utils/api'

const CartItems = ({ item }) => {
  const context = useContext(Mycontext)

  const prod          = item?.productId || {}
  const cartId        = item?._id
  const name          = prod.name    || 'Product'
  const brand         = prod.brand   || ''
  const price         = prod.price   ?? 0
  const images        = prod.images  || []
  const img           = images[0]    || null
  const prodId        = prod._id     || ''

  const variantSize   = item?.size          || null
  const variantRam    = item?.productRam    || null
  const variantWeight = item?.productWeight || null
  const variantColor  = item?.productColor  || null

  const [localQty, setLocalQty] = React.useState(item?.quantity || 1)
  const [updating, setUpdating] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)
  const [updated,  setUpdated]  = React.useState(false)

  const savedQty = item?.quantity || 1
  const isDirty  = localQty !== savedQty
  const subtotal = (price * localQty).toFixed(2)

  const decrement = () => setLocalQty(q => Math.max(1, q - 1))
  const increment = () => setLocalQty(q => q + 1)

  const handleUpdate = async () => {
    if (!isDirty || updating) return
    setUpdating(true)
    try {
      await putData('/api/cart/update', { _id: cartId, quantity: localQty })
      context?.setCartItems?.(prev =>
        prev.map(i => i._id === cartId ? { ...i, quantity: localQty } : i)
      )
      setUpdated(true)
      setTimeout(() => setUpdated(false), 1800)
    } catch {
      context?.openAlertBox?.('error', 'Could not update quantity')
      setLocalQty(savedQty)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (removing) return
    setRemoving(true)
    await new Promise(r => setTimeout(r, 180))
    context?.removeFromCart?.(cartId)
  }

  return (
    <div className={`group relative flex gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-100 last:border-0
                     transition-all duration-300 hover:bg-gray-50/60
                     ${removing ? 'opacity-0 -translate-x-2 pointer-events-none' : 'opacity-100 translate-x-0'}`}>

      {/* ── Product image ── */}
      <Link to={`/product/${prodId}`}
        className='flex-shrink-0 w-[75px] h-[75px] sm:w-[88px] sm:h-[88px] rounded-xl overflow-hidden
                   bg-gray-100 border border-gray-100 block'>
        {img
          ? <img src={img} alt={name}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-400' />
          : <div className='w-full h-full flex items-center justify-center text-gray-300 text-[10px]'>No Image</div>
        }
      </Link>

      {/* ── Details ── */}
      <div className='flex-1 min-w-0 flex flex-col gap-1.5'>

        {/* Top row: brand + remove */}
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            {brand && (
              <p className='text-[9px] sm:text-[10px] font-[700] uppercase tracking-widest text-gray-400 leading-none mb-0.5'>
                {brand}
              </p>
            )}
            <Link to={`/product/${prodId}`}>
              <h3 className='text-[12px] sm:text-[13px] font-[600] text-gray-800 leading-snug line-clamp-2
                             hover:text-[#f51111] transition-colors duration-150'>
                {name}
              </h3>
            </Link>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            disabled={removing}
            aria-label="Remove item"
            className={`flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center
                        transition-all duration-200 mt-0.5
                        ${removing
                          ? 'bg-gray-100 text-gray-300 cursor-wait'
                          : 'text-gray-300 hover:bg-[#f51111] hover:text-white'}`}
          >
            {removing
              ? <span className='w-[8px] h-[8px] rounded-full border-2 border-gray-300 border-t-transparent animate-spin block' />
              : <IoCloseSharp size={13} />
            }
          </button>
        </div>

        {/* Variant badges */}
        {(variantSize || variantRam || variantWeight || variantColor) && (
          <div className='flex flex-wrap gap-1'>
            {variantColor && (
              <span className='flex items-center gap-1 text-[9px] sm:text-[10px] font-[600]
                               px-1.5 sm:px-2 py-[2px] rounded-full bg-gray-100 text-gray-500'>
                <span className='w-[6px] h-[6px] rounded-full border border-gray-300 flex-shrink-0'
                      style={{ backgroundColor: variantColor?.color || '#ccc' }} />
                {variantColor?.name || 'Color'}
              </span>
            )}
            {variantSize && (
              <span className='text-[9px] sm:text-[10px] font-[600] px-1.5 sm:px-2 py-[2px] rounded-full bg-gray-100 text-gray-500'>
                {variantSize}
              </span>
            )}
            {variantRam && (
              <span className='text-[9px] sm:text-[10px] font-[600] px-1.5 sm:px-2 py-[2px] rounded-full bg-gray-100 text-gray-500'>
                {variantRam}
              </span>
            )}
            {variantWeight && (
              <span className='text-[9px] sm:text-[10px] font-[600] px-1.5 sm:px-2 py-[2px] rounded-full bg-gray-100 text-gray-500'>
                {variantWeight}
              </span>
            )}
          </div>
        )}

        {/* Bottom row: stepper + price */}
        <div className='flex items-center justify-between gap-2 mt-auto pt-0.5'>

          {/* Qty stepper */}
          <div className='flex items-center gap-1.5'>
            <div className={`flex items-center rounded-lg overflow-hidden border-2 transition-colors duration-200
                             ${isDirty ? 'border-[#f51111]' : 'border-gray-200'}`}>
              <button
                onClick={decrement}
                disabled={localQty <= 1 || updating}
                className='w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] flex items-center justify-center
                           text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <FaMinus size={7} />
              </button>
              <span className={`w-[28px] sm:w-[32px] text-center text-[12px] sm:text-[13px] font-[700] select-none transition-colors
                                ${isDirty ? 'text-[#f51111]' : 'text-gray-800'}`}>
                {localQty}
              </span>
              <button
                onClick={increment}
                disabled={updating}
                className='w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] flex items-center justify-center
                           text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <FaPlus size={7} />
              </button>
            </div>

            {/* Update pill */}
            <button
              onClick={handleUpdate}
              disabled={updating || !isDirty}
              className={`flex items-center gap-1 py-1 rounded-lg text-[10px] sm:text-[11px] font-[700]
                          overflow-hidden whitespace-nowrap transition-all duration-200
                          ${isDirty && !updated
                            ? 'px-2 sm:px-2.5 max-w-[80px] opacity-100 bg-[#f51111] text-white'
                            : updated
                              ? 'px-2 sm:px-2.5 max-w-[80px] opacity-100 bg-emerald-500 text-white'
                              : 'px-0 max-w-0 opacity-0 pointer-events-none'}`}
            >
              {updating
                ? <><span className='w-[7px] h-[7px] rounded-full border-2 border-white border-t-transparent animate-spin inline-block mr-0.5' />Saving</>
                : updated
                  ? <><MdCheck size={12} />Saved</>
                  : 'Update'
              }
            </button>
          </div>

          {/* Price */}
          <div className='text-right flex-shrink-0'>
            <p className='text-[14px] sm:text-[15px] font-[800] text-[#f51111] leading-none'>${subtotal}</p>
            {localQty > 1 && (
              <p className='text-[10px] text-gray-400 mt-0.5'>${Number(price).toFixed(2)} ea</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItems