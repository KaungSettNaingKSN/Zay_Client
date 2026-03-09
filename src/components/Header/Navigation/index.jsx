import React, { useState, useRef } from 'react'
import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import { RiMenu2Fill } from 'react-icons/ri'
import { LiaAngleDownSolid } from 'react-icons/lia'
import { Link } from 'react-router-dom'
import { GoRocket } from 'react-icons/go'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import CategoryPanel from './CategoryPanel'
import { Mycontext } from '../../../App'

const NavSkeleton = () => (
  <div className='flex items-center gap-2 px-1'>
    {[80, 60, 100, 70, 90, 65, 85].map((w, i) => (
      <Skeleton key={i} variant="rounded" width={w} height={30}
        sx={{ borderRadius: '9999px', flexShrink: 0 }} />
    ))}
  </div>
)

// Navigation always shows "Shop By Categories" on desktop.
// On mobile it is hidden via CSS (shown instead in the Header's side drawer).
const Navigation = () => {
  const context = React.useContext(Mycontext)
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false)
  const [showLeftArrow,  setShowLeftArrow]  = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const scrollRef = useRef(null)

  React.useEffect(() => {
    if ((context.categories || []).length === 0) context.reloadCategories()
  }, [context])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowLeftArrow(el.scrollLeft > 10)
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    setShowRightArrow(el.scrollWidth > el.clientWidth)
    handleScroll()
  }, [context.categories])

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  200, behavior: 'smooth' })

  const topLevelCats      = (context.categories || []).filter(c => !c.parentId)
  const categoriesLoading = context.categoriesLoading ?? (context.categories === null)

  return (
    <>
      <nav className="py-2 border-b border-[rgba(0,0,0,0.07)] bg-white shadow-sm hidden sm:block">
        <div className="container flex items-center gap-3">

          {/* Shop By Categories — visible on desktop nav bar only, hidden on mobile */}
          <div className="flex-shrink-0 hidden sm:block">
            {categoriesLoading ? (
              <Skeleton variant="rounded" width={170} height={34} sx={{ borderRadius: '9999px' }} />
            ) : (
              <Button
                onClick={() => setIsOpenCatPanel(true)}
                className="!text-black !gap-2 !normal-case !font-[500] !text-[13px]
                           !bg-[#f5f5f5] !rounded-full !px-4 !py-1.5
                           hover:!bg-[#ebebeb] !transition-colors !whitespace-nowrap"
              >
                <RiMenu2Fill className="text-[16px]" />
                Shop By Categories
                <LiaAngleDownSolid className="text-[12px]" />
              </Button>
            )}
          </div>

          {/* Scrollable nav links */}
          <div className="relative flex-1 flex items-center overflow-hidden">

            {showLeftArrow && !categoriesLoading && (
              <>
                <div className="absolute left-0 top-0 h-full w-10 z-10 pointer-events-none
                                bg-gradient-to-r from-white to-transparent" />
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 z-20 flex items-center justify-center
                             w-7 h-7 rounded-full bg-white shadow-md border border-gray-200
                             hover:bg-gray-50 transition-all text-gray-600"
                  aria-label="Scroll left"
                >
                  <MdChevronLeft size={18} />
                </button>
              </>
            )}

            {categoriesLoading ? (
              <NavSkeleton />
            ) : (
              <ul
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex items-center gap-1 overflow-x-auto scroll-smooth scrollbar-hide px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <li className="flex-shrink-0">
                  <Link to="/">
                    <Button className="!normal-case !text-[13px] !text-gray-700 !font-[500]
                                       !rounded-full !px-3 hover:!bg-gray-100 !transition-colors">
                      Home
                    </Button>
                  </Link>
                </li>
                {topLevelCats.map((cat, index) => (
                  <li key={cat._id} className="flex-shrink-0 list-none">
                    <Link to={`/productListing?catId=${cat._id}&catName=${encodeURIComponent(cat.name)}`}>
                      <Button
                        className="!normal-case !text-[13px] !text-gray-700 !font-[500]
                                   !rounded-full !px-3 hover:!bg-gray-100 !transition-colors !whitespace-nowrap"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {cat.name}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {showRightArrow && !categoriesLoading && (
              <>
                <div className="absolute right-0 top-0 h-full w-10 z-10 pointer-events-none
                                bg-gradient-to-l from-white to-transparent" />
                <button
                  onClick={scrollRight}
                  className="absolute right-0 z-20 flex items-center justify-center
                             w-7 h-7 rounded-full bg-white shadow-md border border-gray-200
                             hover:bg-gray-50 transition-all text-gray-600"
                  aria-label="Scroll right"
                >
                  <MdChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Free delivery badge */}
          {categoriesLoading ? (
            <Skeleton variant="rounded" width={120} height={30} sx={{ borderRadius: '9999px', flexShrink: 0 }} />
          ) : (
            <div className="flex-shrink-0">
              <p className="flex items-center gap-2 text-[13px] text-gray-600 font-[500]
                            bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <GoRocket className="text-green-600" />
                Free Delivery
              </p>
            </div>
          )}

        </div>
      </nav>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

      <CategoryPanel isOpenCatPanel={isOpenCatPanel} setIsOpenCatPanel={setIsOpenCatPanel} />
    </>
  )
}

export default Navigation