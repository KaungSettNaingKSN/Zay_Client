import React, { useState } from 'react'
import InnerImageZoom from 'react-inner-image-zoom'
import 'react-inner-image-zoom/src/styles.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
import { FreeMode, Thumbs } from 'swiper/modules';

const FALLBACK = 'https://serviceapi.spicezgold.com/download/1742447215241_blubags-waterproof-school-backpack-36-l-laptop-bag-college-backpack-school-bag-product-images-rvxyzquw2b-0-202312201359.webp';

const ProductZoom = ({ images = [] }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [slideIndex,   setSlideIndex]   = useState(0);
  const imgs = images.length > 0 ? images : [FALLBACK];

  return (
    <div className='productZoom flex flex-col-reverse sm:flex-row gap-2 sm:gap-3
                    h-auto sm:h-[380px] md:h-[420px]'>

      {/*
        Thumbnails:
          Mobile  → horizontal strip below main image
          Desktop → vertical strip on the left
      */}
      <div className='w-full sm:w-[72px] md:w-[76px] flex-shrink-0
                      h-[64px] sm:h-full'>
        <Swiper
          onSwiper={setThumbsSwiper}
          direction='horizontal'
          slidesPerView='auto'
          freeMode
          watchSlidesProgress
          spaceBetween={6}
          modules={[FreeMode, Thumbs]}
          className='h-full w-full thumbSwiper'
          breakpoints={{
            // sm+ → switch to vertical
            640: { direction: 'vertical', spaceBetween: 8 },
          }}
        >
          {imgs.map((src, i) => (
            <SwiperSlide
              key={i}
              className='!h-[56px] !w-[56px] sm:!h-[80px] sm:!w-full cursor-pointer flex-shrink-0'
            >
              <div className={`h-full w-full overflow-hidden rounded-lg sm:rounded-xl border-2
                              transition-all duration-200
                              ${slideIndex === i
                                ? 'border-[#f51111] shadow-[0_0_0_2px_rgba(255,82,82,0.2)]'
                                : 'border-gray-200 hover:border-gray-400'}`}>
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  className='w-full h-full object-cover'
                  onError={(e) => { e.target.src = FALLBACK; }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main image */}
      <div className='flex-1 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm
                      bg-gradient-to-br from-gray-50 to-gray-100 relative
                      h-[280px] sm:h-full overflow-hidden'>

        {/* Slide counter badge */}
        <div className='absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20
                        bg-black/40 text-white text-[10px] sm:text-[11px] font-[600]
                        px-2 py-[2px] sm:py-[3px] rounded-full
                        backdrop-blur-sm select-none pointer-events-none'>
          {slideIndex + 1} / {imgs.length}
        </div>

        <Swiper
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          slidesPerView={1}
          spaceBetween={0}
          onSlideChange={(s) => setSlideIndex(s.activeIndex)}
          modules={[FreeMode, Thumbs]}
          className='h-full w-full'
        >
          {imgs.map((src, i) => (
            <SwiperSlide key={i}>
              <InnerImageZoom
                zoomType='hover'
                zoomScale={1.5}
                src={src}
                zoomSrc={src}
                className='w-full h-full'
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>{`
        /* Horizontal thumb strip on mobile */
        .thumbSwiper { overflow: visible; }
        @media (max-width: 639px) {
          .thumbSwiper .swiper-wrapper {
            flex-direction: row !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductZoom;