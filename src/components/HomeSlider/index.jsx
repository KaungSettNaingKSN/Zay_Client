import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import Skeleton from '@mui/material/Skeleton';
import { fetchData } from '../../utils/api';

const SliderSkeleton = () => (
  <div className="w-full overflow-hidden rounded-[12px] sm:rounded-[16px] lg:rounded-[20px]"
       style={{ aspectRatio: 'var(--slider-ratio)' }}>
    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ transform: 'none' }} />
  </div>
);

const HomeSlider = () => {
  const [slides,   setSlides]   = React.useState([]);
  const [loading,  setLoading]  = React.useState(true);
  const [imgReady, setImgReady] = React.useState(false);
  const [error,    setError]    = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchData('/api/homeSlider/');
        if (cancelled) return;

        const allImages = (res.data?.homeSlider || [])
          .flatMap(doc => doc.images || [])
          .filter(Boolean);

        setSlides(allImages);

        if (allImages.length > 0) {
          const img = new Image();
          img.onload  = () => { if (!cancelled) setImgReady(true); };
          img.onerror = () => { if (!cancelled) setImgReady(true); };
          img.src = allImages[0];
        } else {
          setImgReady(true);
        }
      } catch (e) {
        console.log(e)
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const showSkeleton = loading || (slides.length > 0 && !imgReady);

  if (!loading && !error && slides.length === 0) return null;
  if (error) return null;

  return (
    <div className='homeSlider py-3 sm:py-4 lg:py-5'>
      <div className='container px-3 sm:px-4'>

        {showSkeleton && <SliderSkeleton />}

        <div className="relative group" style={{ display: showSkeleton ? 'none' : 'block' }}>
          {slides.length > 0 && (
            <Swiper
              modules={[Navigation, Autoplay, Pagination]}
              navigation={{
                nextEl: '.swiper-btn-next',
                prevEl: '.swiper-btn-prev',
              }}
              pagination={{
                clickable: true,
                el: '.swiper-custom-pagination',
                bulletClass: 'swiper-custom-bullet',
                bulletActiveClass: 'swiper-custom-bullet-active',
              }}
              loop={slides.length > 1}
              autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              speed={700}
              spaceBetween={0}
              slidesPerView={1}
              className="sliderHome rounded-[12px] sm:rounded-[16px] lg:rounded-[20px] overflow-hidden shadow-xl"
            >
              {slides.map((img, i) => (
                <SwiperSlide key={i}>
                  {/*
                    Responsive aspect ratios:
                      mobile  (< 640px):  16:7  — taller crop so content stays readable
                      tablet  (640–1024): 16:6  — medium height
                      desktop (> 1024px): 16:5  — original wide banner
                  */}
                  <div className='relative w-full overflow-hidden bg-gray-100 slider-aspect'>
                    <img
                      src={img}
                      alt={`Banner ${i + 1}`}
                      className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]'
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {slides.length > 1 && (
            <>
              <button
                className="swiper-btn-prev absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10
                           w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-lg border border-gray-100
                           flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-all duration-300
                           hover:bg-white hover:scale-110 hover:shadow-xl"
                aria-label="Previous slide"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="swiper-btn-next absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10
                           w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-lg border border-gray-100
                           flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-all duration-300
                           hover:bg-white hover:scale-110 hover:shadow-xl"
                aria-label="Next slide"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {slides.length > 1 && (
            <div className="swiper-custom-pagination absolute bottom-2 sm:bottom-3 left-1/2
                            -translate-x-1/2 z-10 flex items-center gap-[5px] sm:gap-[6px]" />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeSlider;