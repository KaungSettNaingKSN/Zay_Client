// ─── MyList.jsx ──────────────────────────────────────────────────────────────
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { MdFavoriteBorder } from 'react-icons/md'
import Skeleton from '@mui/material/Skeleton'
import AccountSlideBar from '../../components/AccountSlideBar'
import MyListItems from './myListItems'
import { Mycontext } from '../../App'

const MyListSkeleton = () => (
  <div className='flex gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-100'>
    <Skeleton variant="rounded" sx={{ width: { xs: 75, sm: 90 }, height: { xs: 75, sm: 90 }, borderRadius: '12px', flexShrink: 0 }} />
    <div className='flex-1 flex flex-col gap-2 pt-1'>
      <Skeleton width="30%" height={12} />
      <Skeleton width="70%" height={15} />
      <Skeleton width="40%" height={13} />
      <div className='flex justify-between mt-1'>
        <Skeleton width={55} height={20} />
        <Skeleton variant="rounded" width={90} height={28} />
      </div>
    </div>
  </div>
)

const MyList = () => {
  const context   = useContext(Mycontext)
  const myList    = context?.myListItems   || []
  const isLoading = context?.isLoginLoading ?? false
  const isEmpty   = !isLoading && myList.length === 0

  return (
    <section className='py-5 sm:py-10 w-full bg-gray-50 min-h-screen'>
      <div className='container px-3 sm:px-4'>

        <div className='md:hidden !mb-2'>
          <AccountSlideBar />
        </div>

        <div className='flex gap-5 items-start'>

          <div className='hidden md:block w-[28%] flex-shrink-0'>
            <AccountSlideBar />
          </div>

          <div className='flex-1 min-w-0 pb-20 md:pb-0'>
            <div className='bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden'>

              <div className='border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between'>
                <div>
                  <h2 className='text-[16px] sm:text-[18px] font-[800] text-gray-900'>My Wishlist</h2>
                  {!isLoading && myList.length > 0 && (
                    <p className='text-[12px] text-gray-400 mt-0.5'>
                      {myList.length} saved item{myList.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <MyListSkeleton key={i} />)
              ) : isEmpty ? (
                <div className='flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center gap-4'>
                  <div className='w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-full bg-gray-100 flex items-center justify-center'>
                    <MdFavoriteBorder size={28} className='text-gray-300' />
                  </div>
                  <div>
                    <p className='text-[14px] sm:text-[15px] font-[700] text-gray-700'>Your list is empty</p>
                    <p className='text-[12px] sm:text-[13px] text-gray-400 mt-1'>Save items you love to find them later</p>
                  </div>
                  <Link to='/productListing'
                    className='px-5 py-2 bg-[#f51111] text-white text-[13px] font-[700] rounded-xl hover:bg-[#e03f3f] transition-colors'>
                    Browse Products
                  </Link>
                </div>
              ) : (
                myList.map(item => <MyListItems key={item._id} item={item} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyList