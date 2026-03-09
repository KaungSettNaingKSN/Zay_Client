import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IoCloseSharp } from 'react-icons/io5'
import { MdOutlineShoppingCart, MdCheckCircle } from 'react-icons/md'
import Rating from '@mui/material/Rating'
import { Mycontext } from '../../App'
import { deleteData, postData } from '../../utils/api'

const MyListItems = ({ item }) => {
  const context  = useContext(Mycontext)
  const navigate = useNavigate()

  const [removing,    setRemoving]    = React.useState(false)
  const [cartLoading, setCartLoading] = React.useState(false)

  // item shape: { _id, productId: { _id, name, images, price, rating, brand, size, productRam, productWeight, productColor } }
  const prod    = item?.productId || {}
  const listId  = item?._id
  const prodId  = prod._id        || ''
  const name    = prod.name       || 'Product'
  const brand   = prod.brand      || ''
  const price   = prod.price      ?? 0
  const rating  = Number(prod.rating ?? 0)
  const images  = prod.images     || []
  const img     = images[0]       || null

  // Auto-pick first available variant (same pattern as ProductItem / ProductItemListView)
  const firstSize   = prod.size?.[0]                                              || null
  const firstRam    = prod.productRam?.[0]                                        || null
  const firstWeight = prod.productWeight?.[0]                                     || null
  const firstColor  = prod.productColor?.[0]?._id
                   || (typeof prod.productColor?.[0] === 'string'
                       ? prod.productColor[0] : null)

  const variantHint = [firstSize, firstRam, firstWeight].filter(Boolean).join(' · ')

  // FIX: renamed inner var to 'cartItem' to avoid shadowing the 'item' prop
  const cartEntry = (context?.cartItems || []).find(
    cartItem => String(cartItem.productId?._id || cartItem.productId) === String(prodId)
  )
  const isInCart = !!cartEntry

  /* ── Remove from list ── */
  const handleRemove = async (e) => {
    e.preventDefault()
    if (removing) return
    setRemoving(true)
    try {
      await deleteData(`/api/mylist/${listId}`)
      await context?.reloadWishlist?.()
    } catch {
      context?.openAlertBox?.('error', 'Could not remove item')
    } finally {
      setRemoving(false)
    }
  }

  /* ── Add to cart / Go to cart ── */
  const handleCartButton = async (e) => {
    e.preventDefault()
    // Already in cart → navigate
    if (isInCart) { navigate('/cart'); return }

    if (!context?.isLogin) {
      context?.openAlertBox?.('error', 'Please log in to add items to cart')
      return
    }

    setCartLoading(true)
    try {
      const res = await postData('/api/cart/create', {
        productId:     prodId,
        quantity:      1,
        size:          firstSize,
        productRam:    firstRam,
        productWeight: firstWeight,
        productColor:  firstColor,
      })
      if (res?.data?.error) throw new Error(res.data.message)
      await context?.fetchCartItems?.()
      context?.openAlertBox?.('success', 'Added to cart!')
    } catch (err) {
      context?.openAlertBox?.('error', err?.message || 'Could not add to cart')
    } finally {
      setCartLoading(false)
    }
  }

  return (
    <div className='group flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-150'>

      {/* Image */}
      <div className='w-[90px] h-[90px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200'>
        <Link to={`/product/${prodId}`} className='block w-full h-full'>
          {img
            ? <img src={img} alt={name} className='w-full h-full object-cover hover:scale-105 transition-transform duration-300' />
            : <div className='w-full h-full flex items-center justify-center text-gray-300 text-[11px]'>No Image</div>
          }
        </Link>
      </div>

      {/* Details */}
      <div className='flex-1 min-w-0 relative pr-6'>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className='absolute top-0 right-0 w-[22px] h-[22px] rounded-full flex items-center justify-center
                     text-gray-300 hover:text-white hover:bg-[#f51111] transition-all duration-200 disabled:opacity-40'
          aria-label="Remove from list"
        >
          {removing
            ? <span className='w-[8px] h-[8px] rounded-full border-2 border-gray-400 border-t-transparent animate-spin block' />
            : <IoCloseSharp size={14} />
          }
        </button>

        {/* Brand */}
        {brand && (
          <p className='text-[10px] font-[700] uppercase tracking-widest text-gray-400 mb-0.5'>
            {brand}
          </p>
        )}

        {/* Name */}
        <Link to={`/product/${prodId}`}>
          <h3 className='text-[13px] font-[600] text-gray-800 leading-snug line-clamp-2
                         hover:text-[#f51111] transition-colors duration-150 mb-1'>
            {name}
          </h3>
        </Link>

        {/* Variant info — saved cart variants (green) or hint of what will be added (gray) */}
        {isInCart && (cartEntry?.size || cartEntry?.productRam || cartEntry?.productWeight || cartEntry?.productColor) ? (
          <div className='flex flex-wrap gap-1 mb-1'>
            {cartEntry?.productColor && (
              <span className='flex items-center gap-1 text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
                <span className='w-[6px] h-[6px] rounded-full flex-shrink-0'
                      style={{ backgroundColor: cartEntry.productColor?.color || '#ccc' }} />
                {cartEntry.productColor?.name || 'Color'}
              </span>
            )}
            {cartEntry?.size && (
              <span className='text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
                {cartEntry.size}
              </span>
            )}
            {cartEntry?.productRam && (
              <span className='text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
                {cartEntry.productRam}
              </span>
            )}
            {cartEntry?.productWeight && (
              <span className='text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
                {cartEntry.productWeight}
              </span>
            )}
          </div>
        ) : !isInCart && variantHint ? (
          <p className='text-[10px] text-gray-400 mb-1'>{variantHint}</p>
        ) : null}

        <Rating value={rating} precision={0.5} size='small' readOnly sx={{ fontSize: '13px' }} />

        {/* Price + Cart button */}
        <div className='flex items-center justify-between mt-2 flex-wrap gap-2'>
          <span className='text-[15px] font-[800] text-[#f51111]'>
            ${Number(price).toFixed(2)}
          </span>

          {/* FIX: single button — no nested <Link> inside <button> */}
          <button
            onClick={handleCartButton}
            disabled={cartLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-[700]
                        transition-all duration-200
                        ${isInCart
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : cartLoading
                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                            : 'bg-[#f51111] text-white hover:bg-[#e03f3f]'}`}
          >
            {isInCart
              ? <><MdCheckCircle size={14} /> Go to Cart</>
              : cartLoading
                ? 'Adding…'
                : <><MdOutlineShoppingCart size={14} /> Add to Cart</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyListItems