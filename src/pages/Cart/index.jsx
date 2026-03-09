import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Mycontext } from '../../App'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { BsFillBagCheckFill } from 'react-icons/bs'
import { MdOutlineShoppingCart } from 'react-icons/md'
import CartItems from './cartItems'

/* ── Skeleton row ── */
const CartItemSkeleton = () => (
  <div className='flex gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-100'>
    <Skeleton variant="rounded" width={88} height={88}
      sx={{ borderRadius: '12px', flexShrink: 0, width: { xs: 75, sm: 88 }, height: { xs: 75, sm: 88 } }} />
    <div className='flex-1 flex flex-col gap-2 pt-1'>
      <Skeleton width="50%" height={13} />
      <Skeleton width="80%" height={15} />
      <Skeleton width="35%" height={13} />
      <div className='flex justify-between items-center mt-1'>
        <Skeleton variant="rounded" width={88} height={28} />
        <Skeleton width={52} height={20} />
      </div>
    </div>
  </div>
)

/* ── Main page ── */
const CartPage = () => {
  const context     = useContext(Mycontext)
  const cartItems   = context?.cartItems   || []
  const cartLoading = context?.cartLoading ?? false

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const subtotal  = cartItems.reduce((sum, item) =>
    sum + (item.productId?.price ?? 0) * (item.quantity || 1), 0)

  const isEmpty = !cartLoading && cartItems.length === 0

  return (
    <section className='py-5 sm:py-8 pb-12 bg-gray-50 min-h-screen'>
      <div className='container px-3 sm:px-4'>

        {/* ── Page header ── */}
        <div className='!mb-4 sm:mb-6'>
          <h1 className='text-[20px] sm:text-[24px] font-[800] text-gray-900 leading-tight'>
            Shopping Cart
          </h1>
          {!cartLoading && cartItems.length > 0 && (
            <p className='text-[12px] sm:text-[13px] text-gray-400 mt-0.5'>
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
            </p>
          )}
        </div>

        {/* ── On mobile: summary floats to top on empty, stacks below items ── */}
        <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 items-start'>

          {/* ── Left: cart items ── */}
          <div className='w-full lg:flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            {cartLoading ? (
              Array.from({ length: 3 }).map((_, i) => <CartItemSkeleton key={i} />)
            ) : isEmpty ? (
              <div className='flex flex-col items-center justify-center py-14 sm:py-20 px-6 text-center gap-4'>
                <div className='w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-full bg-gray-100 flex items-center justify-center'>
                  <MdOutlineShoppingCart size={28} className='text-gray-300' />
                </div>
                <div>
                  <p className='text-[14px] sm:text-[15px] font-[700] text-gray-700'>Your cart is empty</p>
                  <p className='text-[12px] sm:text-[13px] text-gray-400 mt-1'>Add items to get started</p>
                </div>
                <Link to='/productListing'>
                  <Button variant="contained"
                    className='!bg-[#f51111] !text-white !capitalize !rounded-xl !px-6 !py-2 !text-[13px] !font-[700] !shadow-none'>
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              cartItems.map(item => <CartItems key={item._id} item={item} />)
            )}
          </div>

          {/* ── Right: order summary ── */}
          <div className='w-full lg:w-[320px] xl:w-[340px] flex-shrink-0
                          bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5
                          lg:sticky lg:top-[80px]'>
            <h3 className='text-[14px] sm:text-[15px] font-[800] text-gray-900 pb-3 sm:pb-4 border-b border-gray-100'>
              Order Summary
            </h3>

            {cartLoading ? (
              <div className='flex flex-col gap-3 mt-4'>
                <Skeleton width="100%" height={18} />
                <Skeleton width="75%"  height={18} />
                <Skeleton width="55%"  height={18} />
                <Skeleton variant="rounded" width="100%" height={44} sx={{ mt: 1.5 }} />
              </div>
            ) : (
              <>
                <div className='flex flex-col gap-2.5 mt-4'>
                  <div className='flex justify-between text-[12px] sm:text-[13px] text-gray-500'>
                    <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                    <span className='font-[600] text-gray-700'>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-[12px] sm:text-[13px] text-gray-500'>
                    <span>Shipping</span>
                    <span className='text-emerald-500 font-[600]'>Free</span>
                  </div>
                  <div className='flex justify-between text-[14px] sm:text-[15px] font-[800] text-gray-900
                                  border-t border-gray-100 pt-3 !mt-1'>
                    <span>Total</span>
                    <span className='text-[#f51111]'>${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className='!mt-4 flex flex-col gap-2.5'>
                  <Link to='/checkout' className='block'>
                    <Button
                      variant="contained"
                      disabled={isEmpty}
                      fullWidth
                      startIcon={<BsFillBagCheckFill />}
                      className='!bg-[#f51111] !text-white !capitalize !rounded-xl !py-2.5
                                 !text-[13px] sm:!text-[14px] !font-[700] !shadow-none
                                 hover:!shadow-md !transition-shadow'
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link to='/productListing' className='block'>
                    <Button
                      variant="outlined"
                      fullWidth
                      className='!border-gray-200 !text-gray-500 !capitalize !rounded-xl !text-[12px] sm:!text-[13px]'
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default CartPage