import React from 'react'
import Rating from '@mui/material/Rating'
import { MdZoomOutMap, MdOutlineShoppingCart, MdCheckCircle } from 'react-icons/md'
import { FaRegHeart, FaHeart } from 'react-icons/fa'
import { Mycontext } from '../../App'
import { Link, useNavigate } from 'react-router-dom'
import { postData, deleteData } from '../../utils/api'

const ProductItem = ({ product }) => {
  const context  = React.useContext(Mycontext)
  const navigate = useNavigate()

  const [cartLoading, setCartLoading] = React.useState(false)
  const [cartError,   setCartError]   = React.useState(false)
  const [wishLoading, setWishLoading] = React.useState(false)
  const [isTouch,     setIsTouch]     = React.useState(false)

  React.useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  if (!product) return null

  const id       = product._id      || ''
  const name     = product.name     || 'Product'
  const brand    = product.brand    || ''
  const price    = product.price    ?? 0
  const oldPrice = product.oldPrice ?? 0
  const rating   = product.rating   ?? 0
  const discount = product.discount ?? (oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0)
  const images   = product.images   || []
  const img1     = images[0]        || null
  const img2     = images[1]        || null
  const inStock  = (product.countInStock ?? 1) > 0

  const firstSize   = product.size?.[0]          || null
  const firstRam    = product.productRam?.[0]    || null
  const firstWeight = product.productWeight?.[0] || null
  const firstColor  = product.productColor?.[0]?._id
                   || (typeof product.productColor?.[0] === 'string' ? product.productColor[0] : null)

  const isInCart = (context?.cartItems || []).some(
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
      if (isWishlisted && myListItemId) await deleteData(`/api/mylist/${myListItemId}`)
      else                              await postData('/api/mylist/create', { productId: id })
      await context?.reloadWishlist?.()
    } catch {
      context?.openAlertBox?.('error', 'Something went wrong. Please try again.')
    } finally {
      setWishLoading(false)
    }
  }

  return (
    <div className='group relative flex flex-col bg-white rounded-2xl overflow-hidden
                    border border-gray-100 shadow-sm
                    hover:shadow-xl hover:-translate-y-1
                    transition-all duration-300 ease-out h-full'>

      {/* ── Image area ── */}
      <div className='relative overflow-hidden bg-gray-50 aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3] flex-shrink-0'>

        {img1 ? (
          <img src={img1} alt={name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500
              ${img2 ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-110'}`} />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center text-gray-300 text-[12px] tracking-wide'>
            No Image
          </div>
        )}

        {img2 && (
          <img src={img2} alt={name}
            className='absolute inset-0 w-full h-full object-cover
                       opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100
                       transition-all duration-500' />
        )}

        {/* Gradient overlay on hover for depth */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />

        {/* Discount badge */}
        {discount > 0 && (
          <div className='absolute top-2.5 left-2.5 z-10'>
            <span className='bg-[#f51111] text-white text-[10px] font-[800]
                             px-2 py-[3px] rounded-full shadow-sm tracking-wide'>
              -{discount}%
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className='absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10'>
            <span className='text-[11px] font-[700] text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm'>
              Out of Stock
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className={`absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5
                         transition-all duration-300 ease-out
                         ${isTouch
                           ? 'opacity-100 translate-x-0'
                           : 'opacity-0 translate-x-3 group-hover:translate-x-0 group-hover:opacity-100'}`}>

          {/* Quick view */}
          <button
            onClick={(e) => {
              e.preventDefault()
              context?.setSelectedProduct?.(product)
              context?.setOpenProductModal?.(true)
            }}
            className='hidden sm:flex w-[32px] h-[32px] rounded-full bg-white/95 shadow-md
                       items-center justify-center text-gray-600
                       hover:bg-[#f51111] hover:text-white hover:scale-110
                       transition-all duration-200'
            title='Quick View'
          >
            <MdZoomOutMap size={15} />
          </button>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishLoading}
            className={`w-[32px] h-[32px] rounded-full shadow-md flex items-center justify-center
                        hover:scale-110 transition-all duration-200
                        ${wishLoading   ? 'bg-gray-100 text-gray-300 cursor-wait'
                        : isWishlisted  ? 'bg-[#f51111] text-white'
                        :                 'bg-white/95 text-gray-600 hover:bg-[#f51111] hover:text-white'}`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className='flex flex-col flex-1 p-2.5 sm:p-3 md:p-2.5 lg:p-3.5'>

        {/* Brand */}
        {brand && (
          <p className='text-[9px] font-[700] text-gray-400 uppercase tracking-widest mb-1 truncate'>
            {brand}
          </p>
        )}

        {/* Name */}
        <Link to={`/product/${id}`} state={{ product }}>
          <h3 className='text-[12px] font-[600] text-gray-800 leading-snug
                         line-clamp-2 hover:text-[#f51111] transition-colors duration-200
                         mb-1.5 min-h-[34px]'>
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className='flex items-center gap-1 mb-2'>
          <Rating
            value={Number(rating)}
            precision={0.5}
            size='small'
            readOnly
            sx={{ fontSize: { xs: '11px', sm: '13px' }, '& .MuiRating-iconFilled': { color: '#f59e0b' } }}
          />
          {rating > 0 && (
            <span className='text-[10px] text-gray-400'>({Number(rating).toFixed(1)})</span>
          )}
        </div>

        {/* Cart status hint */}
        {isInCart && (
          <p className='text-[10px] text-emerald-600 font-[600] mb-1.5 flex items-center gap-1'>
            <MdCheckCircle size={11} /> In your cart
          </p>
        )}


        <div className='mt-auto flex items-center justify-between gap-1 pt-2 border-t border-gray-50'>
          <div className='flex flex-col min-w-0'>
            <span className='text-[11px] md:text-[12px] lg:text-[15px] font-[800] text-[#f51111] leading-none'>
              ${Number(price).toFixed(2)}
            </span>
            {oldPrice > price && (
              <span className='text-[9px] md:text-[9px] lg:text-[10px] text-gray-400 line-through mt-0.5'>
                ${Number(oldPrice).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleCartButton}
            disabled={(!inStock && !isInCart) || cartLoading}
            className={`flex-shrink-0 flex items-center justify-center
                        w-[26px] h-[26px] md:w-[26px] md:h-[26px] lg:w-[32px] lg:h-[32px]
                        rounded-full text-[11px] font-[700]
                        transition-all duration-200 active:scale-95
                        disabled:opacity-40 disabled:cursor-not-allowed
                        ${isInCart
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : cartError
                            ? 'bg-orange-500 text-white'
                            : cartLoading
                              ? 'bg-gray-100 text-gray-400 cursor-wait'
                              : 'bg-[#f51111]/10 text-[#f51111] hover:bg-[#f51111] hover:text-white'}`}
            title={isInCart ? 'Go to Cart' : 'Add to Cart'}
          >
            {isInCart
              ? <MdCheckCircle size={13} />
              : cartLoading
                ? <span className='w-[10px] h-[10px] rounded-full border-2 border-gray-400 border-t-transparent animate-spin block' />
                : <MdOutlineShoppingCart size={13} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductItem