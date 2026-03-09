import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
import ProductItem from '../ProductItem'
import { fetchData } from '../../utils/api'
import Skeleton from '@mui/material/Skeleton'

// ── Card skeleton ─────────────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <div className='rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm h-full'>
    <div className='w-full aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3] bg-gray-100 animate-pulse' />
    <div className='p-2.5 flex flex-col gap-1.5'>
      <Skeleton width="35%" height={12} />
      <Skeleton width="90%" height={14} />
      <Skeleton width="70%" height={14} />
      <Skeleton width="30%" height={18} />
    </div>
  </div>
)

const ProductsSlider = ({ items = 6, catId = '', catName = '', excludeId = '' }) => {
  const [products, setProducts] = React.useState([])
  const [loading,  setLoading]  = React.useState(true)
  const [showNav,  setShowNav]  = React.useState(false)
  const swiperRef               = React.useRef(null)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const url = catName
          ? `/api/product/featuredProduct?catName=${encodeURIComponent(catName)}&page=1&perPage=20`
          : `/api/product/?page=1&perPage=20`
        const res  = await fetchData(url)
        const all  = res.data?.product || []
        const list = excludeId ? all.filter(p => p._id !== excludeId) : all
        if (!cancelled) setProducts(list)
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [catName, catId, excludeId])

  const checkNav = React.useCallback((swiper) => {
    if (!swiper) return
    setShowNav(swiper.slides.length > swiper.params.slidesPerView)
  }, [])

  React.useEffect(() => {
    const t = setTimeout(() => checkNav(swiperRef.current), 120)
    return () => clearTimeout(t)
  }, [products, checkNav])

  return (
    <div className='productsSlider py-3 sm:py-4'>
      <Swiper
        onSwiper={(s)             => { swiperRef.current = s; checkNav(s) }}
        onBreakpoint={(s)         => checkNav(s)}
        onSlidesLengthChange={(s) => checkNav(s)}
        navigation={showNav}
        modules={[Navigation]}
        className="productSwiper !pb-1"
        breakpoints={{
          // Mobile portrait — 2 cards
          320:  { slidesPerView: 2,     spaceBetween: 8  },
          // Mobile landscape / large phones — 2 cards
          480:  { slidesPerView: 2,     spaceBetween: 10 },
          // Small tablets — 3 cards
          640:  { slidesPerView: 3,     spaceBetween: 12 },
          // iPad portrait (768–1023px) — 4 cards, tight but proportional
          768:  { slidesPerView: 4,     spaceBetween: 10 },
          // iPad landscape (900–1023px) — 4 cards, slightly more gap
          900:  { slidesPerView: 4,     spaceBetween: 12 },
          // Desktop — items prop (default 6)
          1024: { slidesPerView: items, spaceBetween: 16 },
        }}
      >
        {loading ? (
          Array.from({ length: items }).map((_, i) => (
            <SwiperSlide key={`sk-${i}`} className='!h-auto'>
              <ProductCardSkeleton />
            </SwiperSlide>
          ))
        ) : products.length === 0 ? (
          <SwiperSlide>
            <div className='flex flex-col items-center justify-center h-[200px] sm:h-[280px]
                            text-gray-400 text-[13px] gap-2 bg-gray-50 rounded-xl'>
              <span className='text-[32px]'>📦</span>
              <p>No related products found.</p>
            </div>
          </SwiperSlide>
        ) : (
          products.map((product) => (
            <SwiperSlide key={product._id} className='!h-auto'>
              <ProductItem product={product} />
            </SwiperSlide>
          ))
        )}
      </Swiper>

      <style>{`
        .productSwiper .swiper-button-next,
        .productSwiper .swiper-button-prev {
          width: 28px;
          height: 28px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          border: 1px solid #f0f0f0;
          color: #555;
          top: 38%;
        }
        .productSwiper .swiper-button-next::after,
        .productSwiper .swiper-button-prev::after {
          font-size: 11px;
          font-weight: 900;
        }
        @media (min-width: 640px) {
          .productSwiper .swiper-button-next,
          .productSwiper .swiper-button-prev {
            width: 34px;
            height: 34px;
          }
          .productSwiper .swiper-button-next::after,
          .productSwiper .swiper-button-prev::after {
            font-size: 13px;
          }
        }
        .productSwiper .swiper-button-prev { left: -2px; }
        .productSwiper .swiper-button-next { right: -2px; }
        @media (min-width: 640px) {
          .productSwiper .swiper-button-prev { left: -6px; }
          .productSwiper .swiper-button-next { right: -6px; }
        }
      `}</style>
    </div>
  )
}

export default ProductsSlider