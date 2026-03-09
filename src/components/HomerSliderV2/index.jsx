import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { Link } from 'react-router-dom';
import { fetchData } from '../../utils/api';
import { FaStar, FaFire } from 'react-icons/fa';

const SLIDE_BG = [
  'from-rose-50 to-orange-50',
  'from-blue-50 to-indigo-50',
  'from-emerald-50 to-teal-50',
  'from-purple-50 to-pink-50',
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SliderSkeleton = () => (
  <div className="w-full rounded-[10px] overflow-hidden slider-v2-skeleton bg-gray-100">
    {/* Mobile skeleton: stacked */}
    <div className="flex flex-col sm:flex-row h-full">
      <div className="w-full sm:w-1/2 skeleton-img-area">
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ transform: 'none' }} />
      </div>
      <div className="w-full sm:w-1/2 p-6 sm:p-10 flex flex-col gap-3 sm:gap-4 justify-center">
        <Skeleton width="40%"  height={18} />
        <Skeleton width="85%"  height={28} />
        <Skeleton width="65%"  height={22} />
        <Skeleton width="30%"  height={36} sx={{ borderRadius: '8px' }} />
      </div>
    </div>
  </div>
);

const HomeCatSliderV2 = () => {
  const [slides,   setSlides]   = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);
  const [imgReady, setImgReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const [topRes, bestRes] = await Promise.all([
          fetchData('/api/product/topRated?limit=3'),
          fetchData('/api/product/bestSellers?limit=3'),
        ]);
        if (cancelled) return;

        const topRated   = topRes.data?.product  || [];
        const bestSeller = bestRes.data?.product || [];

        const merged = [];
        const max = Math.max(topRated.length, bestSeller.length);
        for (let i = 0; i < max; i++) {
          if (topRated[i])   merged.push({ type: 'topRated',   product: topRated[i] });
          if (bestSeller[i]) merged.push({ type: 'bestSeller', product: bestSeller[i] });
        }
        setSlides(merged);

        const firstImg = merged[0]?.product?.images?.[0];
        if (firstImg) {
          const img = new Image();
          img.onload  = () => { if (!cancelled) setImgReady(true); };
          img.onerror = () => { if (!cancelled) setImgReady(true); };
          img.src = firstImg;
        } else {
          setImgReady(true);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setImgReady(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const showSkeleton = loading || (slides.length > 0 && !imgReady);
  if (!loading && slides.length === 0) return null;

  return (
    <>
      <div className="homeSliderV2Wrapper w-full">

        {showSkeleton && <SliderSkeleton />}

        <div style={{ display: showSkeleton ? 'none' : 'block' }}>
          <Swiper
            spaceBetween={0}
            effect="fade"
            loop={slides.length > 1}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation={true}
            pagination={{ clickable: true }}
            modules={[EffectFade, Navigation, Pagination, Autoplay]}
            className="homeSliderV2 rounded-[10px] overflow-hidden shadow-lg"
          >
            {slides.map((slide, index) => {
              const p          = slide.product;
              const img        = p?.images?.[0] || '';
              const bg         = SLIDE_BG[index % SLIDE_BG.length];
              const isTopRated = slide.type === 'topRated';

              return (
                <SwiperSlide key={p?._id || index}>
                  {/*
                    Layout:
                      mobile  → column: image on top, info below
                      sm+     → row: image left 50%, info right 50%
                  */}
                  <div className={`slide-inner flex flex-col sm:flex-row overflow-hidden relative bg-gradient-to-br ${bg}`}>

                    {/* ── Image side ── */}
                    <div className="img-side w-full sm:w-[50%] relative overflow-hidden flex items-center justify-center p-6 sm:p-8">
                      {p.discount && (
                        <span className="absolute top-3 left-3 z-10 bg-[#f51111] text-white
                                         text-[11px] font-[700] px-2 py-1 rounded-full shadow-md">
                          -{p.discount}%
                        </span>
                      )}
                      <img
                        src={img}
                        alt={p?.name}
                        className="slide-img w-full object-contain drop-shadow-xl"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>

                    {/* ── Info side ── */}
                    <div className="info w-full sm:w-[50%] flex flex-col gap-2 sm:gap-3 justify-center p-5 sm:p-8 sm:pr-14 pb-10 sm:pb-8">

                      {/* Tag badge */}
                      <div className={`slide-tag flex items-center gap-2 w-fit px-3 py-1 rounded-full text-[11px] font-[700] uppercase tracking-wider shadow-sm border ${isTopRated ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-red-50 border-red-200 text-[#f51111]'}`}>
                        {isTopRated
                          ? <><FaStar className="text-amber-500" /> Top Rated</>
                          : <><FaFire className="text-[#f51111]" /> Best Seller</>
                        }
                      </div>

                      {/* Sub headline */}
                      <h3 className="slide-sub text-gray-500 text-[12px] sm:text-[13px] font-[500]">
                        {p?.catName || 'Special Offer'}
                      </h3>

                      {/* Product name */}
                      <h1 className="slide-title text-gray-900 text-[18px] sm:text-[22px] font-[800]
                                     leading-tight line-clamp-2">
                        {p?.name}
                      </h1>

                      {/* Price */}
                      <div className="slide-price flex items-baseline gap-2 sm:gap-3">
                        <span className="text-[#f51111] text-[20px] sm:text-[24px] font-[800]">
                          ${p?.price?.toLocaleString()}
                        </span>
                        {p?.oldPrice && (
                          <span className="text-gray-400 text-[13px] sm:text-[15px] line-through">
                            ${p.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {p?.rating > 0 && (
                        <div className="slide-rating flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={12}
                              className={i < Math.round(p.rating) ? 'text-amber-400' : 'text-gray-200'}
                            />
                          ))}
                          <span className="text-[11px] text-gray-400 ml-1">({p.rating})</span>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="slide-btn mt-1">
                        <Link to={`/product/${p?._id}`}>
                          <Button
                            variant="contained"
                            size="small"
                            className="!bg-[#f51111] !text-white !capitalize !font-[700]
                                       !rounded-lg !px-5 !py-1.5 !text-[13px]
                                       hover:!bg-[#e04040] !shadow-md !shadow-red-200"
                          >
                            Shop Now
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <style>{`
        /* ── Base skeleton (desktop default) ── */
        .slider-v2-skeleton            { height: 430px; }
        .slider-v2-skeleton
          .skeleton-img-area           { height: 430px; }

        /* ── Slide base sizing (desktop default) ── */
        .homeSliderV2                  { height: 430px; }
        .homeSliderV2 .swiper-wrapper,
        .homeSliderV2 .swiper-slide    { height: 100% !important; }
        .homeSliderV2 .slide-inner     { height: 100%; min-height: 430px; }
        .homeSliderV2 .img-side        { height: 100%; }
        .homeSliderV2 .slide-img       { max-height: 360px; }

        /* ── Slide-in animations — reset on inactive slides ── */
        .homeSliderV2 .swiper-slide .info > * {
          opacity: 0;
          transform: translateX(40px);
          transition: none;
        }
        .homeSliderV2 .swiper-slide .slide-img {
          opacity: 0;
          transform: scale(0.88);
          transition: none;
        }

        /* ── Animate each child in on the active slide ── */
        .homeSliderV2 .swiper-slide-active .slide-img {
          opacity: 1; transform: scale(1);
          transition: opacity 0.6s ease, transform 0.6s ease;
          transition-delay: 0.1s;
        }
        .homeSliderV2 .swiper-slide-active .slide-tag {
          opacity: 1; transform: translateX(0);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: 0.2s;
        }
        .homeSliderV2 .swiper-slide-active .slide-sub {
          opacity: 1; transform: translateX(0);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: 0.3s;
        }
        .homeSliderV2 .swiper-slide-active .slide-title {
          opacity: 1; transform: translateX(0);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: 0.4s;
        }
        .homeSliderV2 .swiper-slide-active .slide-price {
          opacity: 1; transform: translateX(0);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: 0.5s;
        }
        .homeSliderV2 .swiper-slide-active .slide-rating {
          opacity: 1; transform: translateX(0);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: 0.55s;
        }
        .homeSliderV2 .swiper-slide-active .slide-btn {
          opacity: 1; transform: translateX(0);
          transition: opacity 0.5s ease, transform 0.5s ease;
          transition-delay: 0.65s;
        }

        /* ── Swiper nav arrows (desktop base) ── */
        .homeSliderV2 .swiper-button-next,
        .homeSliderV2 .swiper-button-prev {
          color: #f51111;
          width: 36px;
          height: 36px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .homeSliderV2 .swiper-button-next::after,
        .homeSliderV2 .swiper-button-prev::after {
          font-size: 14px;
          font-weight: 900;
        }
        .homeSliderV2 .swiper-pagination-bullet-active { background: #f51111; }
        .homeSliderV2 .swiper-pagination               { bottom: 6px; }
      `}</style>
    </>
  );
};

export default HomeCatSliderV2;