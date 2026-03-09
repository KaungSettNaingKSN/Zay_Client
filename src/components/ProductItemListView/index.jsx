import React from 'react'
import Rating from '@mui/material/Rating'
import { MdZoomOutMap, MdOutlineShoppingCart, MdCheckCircle } from 'react-icons/md'
import { FaRegHeart, FaHeart } from 'react-icons/fa'
import { Mycontext } from '../../App'
import { Link, useNavigate } from 'react-router-dom'
import { postData, deleteData } from '../../utils/api'

const ProductItemListView = ({ product }) => {
  const context  = React.useContext(Mycontext)
  const navigate = useNavigate()

  const [cartLoading, setCartLoading] = React.useState(false)
  const [cartError,   setCartError]   = React.useState(false)
  const [wishLoading, setWishLoading] = React.useState(false)

  if (!product) return null

  const id           = product._id          || ''
  const name         = product.name         || 'Product'
  const brand        = product.brand        || ''
  const price        = product.price        ?? 0
  const oldPrice     = product.oldPrice     ?? 0
  const rating       = product.rating       ?? 0
  const description  = product.description  || ''
  const discount     = product.discount     ?? (oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0)
  const countInStock = product.countInStock ?? 0
  const images       = product.images       || []
  const img1         = images[0]            || null
  const img2         = images[1]            || null
  const inStock      = countInStock > 0

  const firstSize   = product.size?.[0]          || null
  const firstRam    = product.productRam?.[0]    || null
  const firstWeight = product.productWeight?.[0] || null
  const firstColor  = product.productColor?.[0]?._id
                   || (typeof product.productColor?.[0] === 'string' ? product.productColor[0] : null)

  const variantHint = [firstSize, firstRam, firstWeight].filter(Boolean).join(' · ')

  const isInCart = (context?.cartItems || []).some(
    item => String(item.productId?._id || item.productId) === String(id)
  )
  const cartEntry = (context?.cartItems || []).find(
    item => String(item.productId?._id || item.productId) === String(id)
  )
  const myListEntry  = (context?.myListItems || []).find(
    item => String(item.productId?._id || item.productId) === String(id)
  )
  const isWishlisted = !!myListEntry
  const myListItemId = myListEntry?._id || null

  const handleCartButton = async (e) => {
    e.preventDefault()
    if (isInCart) { navigate('/cart'); return }
    if (!context?.isLogin) {
      context?.openAlertBox?.('error', 'Please log in to add items to cart')
      return
    }
    if (!inStock) return
    setCartLoading(true)
    setCartError(false)
    try {
      const res = await postData('/api/cart/create', {
        productId: id, quantity: 1,
        size: firstSize, productRam: firstRam,
        productWeight: firstWeight, productColor: firstColor,
      })
      if (res?.data?.error) throw new Error(res.data.message)
      await context?.fetchCartItems?.()
    } catch (err) {
      context?.openAlertBox?.('error', err?.message || 'Could not add to cart')
      setCartError(true)
      setTimeout(() => setCartError(false), 2500)
    } finally {
      setCartLoading(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (wishLoading) return
    if (!context?.isLogin) {
      context?.openAlertBox?.('error', 'Please log in to save items')
      return
    }
    setWishLoading(true)
    try {
      if (isWishlisted && myListItemId) await deleteData('/api/mylist/' + myListItemId)
      else                              await postData('/api/mylist/create', { productId: id })
      await context?.reloadWishlist?.()
    } catch {
      context?.openAlertBox?.('error', 'Something went wrong. Please try again.')
    } finally {
      setWishLoading(false)
    }
  }

  const cartClass = isInCart
    ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
    : cartError   ? 'bg-orange-500 text-white'
    : cartLoading ? 'bg-[#f51111] text-white opacity-70 cursor-wait'
    : inStock     ? 'bg-[#f51111] text-white hover:bg-[#e04040] active:scale-95'
    :               'bg-gray-200 text-gray-400 cursor-not-allowed'

  return (
    <div className='group flex overflow-hidden rounded-2xl bg-white
                    border border-gray-100 shadow-sm
                    hover:shadow-lg hover:-translate-y-[2px]
                    transition-all duration-300 ease-out
                    min-h-[110px] sm:min-h-[140px] md:min-h-[155px] lg:min-h-[175px]'>

      {/* Image col: fixed width per breakpoint, full card height */}
      <div className='relative flex-shrink-0 self-stretch overflow-hidden bg-gray-50
                      w-[110px] sm:w-[145px] md:w-[170px] lg:w-[205px]'>

        {img1 ? (
          <img src={img1} alt={name}
            className={'absolute inset-0 w-full h-full object-cover transition-all duration-500 ' +
              (img2 ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105')} />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center
                          bg-gradient-to-br from-gray-100 to-gray-200
                          text-gray-400 text-[11px] text-center px-2'>
            No Image
          </div>
        )}

        {img2 && (
          <img src={img2} alt={name}
            className='absolute inset-0 w-full h-full object-cover
                       opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100
                       transition-all duration-500' />
        )}

        {discount > 0 && (
          <div className='absolute top-2 left-2 z-10 bg-[#f51111] text-white
                          text-[9px] sm:text-[10px] font-[700]
                          px-1.5 py-[2px] rounded-full shadow-sm'>
            -{discount}%
          </div>
        )}

        {/* Stock badge — sm+ only */}
        <div className={'absolute bottom-2 left-2 z-10 hidden sm:block ' +
                        'text-[9px] font-[600] px-1.5 py-[2px] rounded-full ' +
                        (inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500')}>
          {inStock ? 'In Stock (' + countInStock + ')' : 'Out of Stock'}
        </div>

        {/* Hover actions — sm+ only */}
        <div className='absolute top-2 right-2 z-10 hidden sm:flex flex-col gap-1.5
                        translate-x-10 opacity-0
                        group-hover:translate-x-0 group-hover:opacity-100
                        transition-all duration-300 ease-out'>
          <button
            onClick={(e) => { e.preventDefault(); context?.setSelectedProduct?.(product); context?.setOpenProductModal?.(true) }}
            className='w-[28px] h-[28px] rounded-full bg-white shadow-md
                       flex items-center justify-center text-gray-700
                       hover:bg-[#f51111] hover:text-white transition-colors duration-200'
            title='Quick View'
          >
            <MdZoomOutMap size={13} />
          </button>
          <button
            onClick={handleWishlist}
            disabled={wishLoading}
            className={'w-[28px] h-[28px] rounded-full shadow-md ' +
                       'flex items-center justify-center transition-colors duration-200 ' +
                       (wishLoading   ? 'bg-gray-100 text-gray-400 cursor-wait' :
                        isWishlisted  ? 'bg-[#f51111] text-white' :
                                        'bg-white text-gray-700 hover:bg-[#f51111] hover:text-white')}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? <FaHeart size={11} /> : <FaRegHeart size={11} />}
          </button>
        </div>
      </div>

      {/* Info col */}
      <div className='flex flex-col flex-1 min-w-0 overflow-hidden
                      p-2 sm:p-2.5 md:p-3 lg:p-4'>

        <div className='flex-1 flex flex-col'>
          {/* Brand */}
          {brand && (
            <p className='text-[9px] font-[700] uppercase tracking-widest text-gray-400 truncate mb-0.5'>
              {brand}
            </p>
          )}

          {/* Name */}
          <Link to={'/product/' + id} state={{ product }}>
            <h3 className='text-[12px] sm:text-[13px] md:text-[13px] lg:text-[15px] font-[700]
                           text-gray-900 leading-snug line-clamp-1 sm:line-clamp-2
                           hover:text-[#f51111] transition-colors duration-200 mb-0.5'>
              {name}
            </h3>
          </Link>

          {/* Mobile: wishlist + stock row */}
          <div className='flex items-center gap-1.5 mb-1 sm:hidden'>
            <button
              onClick={handleWishlist}
              disabled={wishLoading}
              className={'w-[22px] h-[22px] rounded-full border flex items-center justify-center ' +
                         'flex-shrink-0 transition-colors duration-200 ' +
                         (wishLoading   ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-wait' :
                          isWishlisted  ? 'bg-red-50 text-[#f51111] border-red-200' :
                                          'bg-white text-gray-500 border-gray-200')}
            >
              {isWishlisted ? <FaHeart size={9} /> : <FaRegHeart size={9} />}
            </button>
            <span className={'text-[9px] font-[600] px-1.5 py-[1px] rounded-full ' +
                             (inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500')}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Cart variant badges */}
          {isInCart && (cartEntry?.size || cartEntry?.productRam || cartEntry?.productWeight || cartEntry?.productColor) && (
            <div className='flex flex-wrap gap-1 mb-1'>
              {cartEntry?.productColor && (
                <span className='flex items-center gap-1 text-[9px] font-[600] px-1.5 py-[1px]
                                 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
                  <span className='w-[5px] h-[5px] rounded-full border border-emerald-300 flex-shrink-0'
                        style={{ backgroundColor: cartEntry.productColor?.color || '#ccc' }} />
                  {cartEntry.productColor?.name || 'Color'}
                </span>
              )}
              {cartEntry?.size       && <span className='text-[9px] font-[600] px-1.5 py-[1px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>{cartEntry.size}</span>}
              {cartEntry?.productRam && <span className='text-[9px] font-[600] px-1.5 py-[1px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>{cartEntry.productRam}</span>}
              {cartEntry?.productWeight && <span className='text-[9px] font-[600] px-1.5 py-[1px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>{cartEntry.productWeight}</span>}
            </div>
          )}

          {/* Variant hint */}
          {!isInCart && variantHint && (
            <p className='text-[10px] text-gray-400 mb-0.5 hidden sm:block truncate'>{variantHint}</p>
          )}

          {/* Description — lg only to avoid clutter on iPad */}
          {description && (
            <p className='text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-1 hidden lg:block'>
              {description}
            </p>
          )}

          {/* Rating */}
          <div className='hidden sm:flex items-center gap-1 mt-0.5'>
            <Rating
              value={Number(rating)} precision={0.5} size='small' readOnly
              sx={{
                fontSize: { xs: '11px', sm: '13px', md: '14px', lg: '16px' },
                '& .MuiRating-iconFilled': { color: '#f59e0b' },
              }}
            />
            <span className='text-[9px] sm:text-[10px] text-gray-400'>
              ({Number(rating).toFixed(1)})
            </span>
          </div>
        </div>

        {/* Price + Cart button */}
        <div className='flex items-center justify-between gap-2
                        mt-1.5 pt-1.5 border-t border-gray-100'>

          {/* Price */}
          <div className='flex flex-col min-w-0 flex-shrink-0'>
            <div className='flex items-baseline gap-1 flex-wrap'>
              <span className='text-[13px] sm:text-[15px] md:text-[16px] font-[800]
                               text-[#f51111] leading-none whitespace-nowrap'>
                ${Number(price).toFixed(2)}
              </span>
              {oldPrice > price && (
                <span className='text-[10px] sm:text-[11px] text-gray-400
                                 line-through whitespace-nowrap hidden sm:inline'>
                  ${Number(oldPrice).toFixed(2)}
                </span>
              )}
            </div>
            {isInCart && (
              <span className='text-[9px] text-emerald-600 font-[600] mt-0.5'>✓ In cart</span>
            )}
          </div>

          {/* Cart button */}
          <button
            onClick={handleCartButton}
            disabled={(!inStock && !isInCart) || cartLoading}
            className={'flex-shrink-0 flex items-center justify-center gap-1 ' +
                       'h-[28px] sm:h-[32px] md:h-[34px] ' +
                       'px-2 sm:px-3 md:px-3.5 ' +
                       'rounded-xl text-[10px] sm:text-[11px] md:text-[12px] font-[700] ' +
                       'transition-all duration-200 ' +
                       'disabled:opacity-40 disabled:cursor-not-allowed ' +
                       cartClass}
          >
            {isInCart
              ? <MdCheckCircle size={13} />
              : cartLoading
                ? <span className='w-[9px] h-[9px] rounded-full border-2 border-white/60 border-t-transparent animate-spin block' />
                : <MdOutlineShoppingCart size={13} />
            }
            {/* mobile: short */}
            <span className='sm:hidden'>
              {isInCart ? 'Cart' : cartError ? 'Retry' : 'Add'}
            </span>
            {/* sm+: full */}
            <span className='hidden sm:inline'>
              {isInCart ? 'Go to Cart' : cartLoading ? 'Adding…' : cartError ? 'Retry' : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductItemListView