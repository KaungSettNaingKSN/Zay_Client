import React, { useContext, useReducer, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { Mycontext } from '../../App';

// Vivid, punchy themes — magazine/lookbook feel, different from both other banner components
const THEMES = [
  { bg: '#f51111', text: '#ffffff', muted: 'rgba(255,255,255,0.65)', shape: '#ff000033', tag: 'rgba(255,255,255,0.18)' },
  { bg: '#1e293b', text: '#ffffff', muted: 'rgba(255,255,255,0.55)', shape: '#ffffff0d', tag: 'rgba(255,255,255,0.12)' },
  { bg: '#f59e0b', text: '#1c1008', muted: 'rgba(28,16,8,0.55)',    shape: '#ffffff22',  tag: 'rgba(28,16,8,0.12)'    },
  { bg: '#0ea5e9', text: '#ffffff', muted: 'rgba(255,255,255,0.65)', shape: '#ffffff1a', tag: 'rgba(255,255,255,0.18)' },
  { bg: '#10b981', text: '#ffffff', muted: 'rgba(255,255,255,0.65)', shape: '#ffffff1a', tag: 'rgba(255,255,255,0.18)' },
  { bg: '#8b5cf6', text: '#ffffff', muted: 'rgba(255,255,255,0.65)', shape: '#ffffff1a', tag: 'rgba(255,255,255,0.18)' },
];

const SliderSkeleton = ({ count }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex-shrink-0" style={{ width: `calc(100% / ${count} - 10px)` }}>
        <Skeleton variant="rectangular" height={220}
          sx={{ borderRadius: '20px', transform: 'none' }} />
      </div>
    ))}
  </>
);

const AdsBannerSlider = ({ items = 3 }) => {
  const context  = useContext(Mycontext);
  const [state, dispatch] = useReducer((prevState, action) => {
    switch (action.type) {
      case 'SET_SLIDES':
        return { slides: action.payload.slides, ready: action.payload.ready };
      default:
        return prevState;
    }
  }, { slides: [], ready: false });

  useEffect(() => {
    const allCats = context.categories || [];
    
    let newSlides = [];
    let isReady = false;

    if (allCats.length) {
      // Collect ALL third-level categories with parent image + full URL params
      const all = [];
      allCats.forEach(parent => {
        parent.children?.forEach(sub => {
          sub.children?.forEach(third => {
            all.push({
              ...third,
              displayImage: parent?.images?.[0] || parent?.image || null,
              parentName:   parent?.name  || '',
              parentCatId:  parent._id,
              subName:      sub?.name     || '',
              subCatId:     sub._id,
            });
          });
        });
      });

      if (all.length) {
        // Shuffle and pick 3 distinct items
        const shuffled = [...all].sort(() => Math.random() - 0.5);
        newSlides = shuffled.slice(0, 3);
        isReady = true;
      }
    }

    // Dispatch action instead of calling setState directly
    dispatch({ type: 'SET_SLIDES', payload: { slides: newSlides, ready: isReady } });
  }, [context.categories]);

  const loading = !state.ready && (context.categoriesLoading ?? (context.categories === null));

  if (loading) {
    return (
      <div className="flex gap-3 py-5 !mt5 !mt-5">
        <SliderSkeleton count={items} />
      </div>
    );
  }

  if (!state.slides.length) return null;

  return (
    <>
      <Swiper
        slidesPerView={items}
        spaceBetween={14}
        navigation
        loop={state.slides.length > items}
        autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        modules={[Navigation, Autoplay]}
        className="adsBannerSwiperV1 py-5 !!mt5 !!mt-5"
        breakpoints={{
          0:    { slidesPerView: 1 },
          640:  { slidesPerView: Math.min(2, items) },
          1024: { slidesPerView: items },
        }}
      >
        {state.slides.map((item, index) => {
          const t     = THEMES[index % THEMES.length];
          const isEven = index % 2 === 0;

          return (
            <SwiperSlide key={`${item._id}-${index}`}>
              <Link
                to={`/productListing?catId=${item.parentCatId}&catName=${encodeURIComponent(item.parentName)}&subCatId=${item.subCatId}&subCat=${encodeURIComponent(item.subName)}&thirdSubCatId=${item._id}&thirdSubCat=${encodeURIComponent(item.name)}`}
                className="block group"
              >
                <div
                  className="relative w-full overflow-hidden rounded-[20px] h-[220px]
                             transition-all duration-500 group-hover:-translate-y-[4px]"
                  style={{
                    background: t.bg,
                    boxShadow: `0 4px 20px ${t.bg}44`,
                  }}
                >
                  {/* Large geometric circle — decorative */}
                  <div
                    className="absolute rounded-full transition-transform duration-700
                               group-hover:scale-110"
                    style={{
                      width: 260, height: 260,
                      background: t.shape,
                      top: -80,
                      right: isEven ? -80 : 'auto',
                      left:  isEven ? 'auto' : -80,
                    }}
                  />
                  {/* Small circle */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 80, height: 80,
                      background: t.shape,
                      bottom: -20,
                      left:  isEven ? -20 : 'auto',
                      right: isEven ? 'auto' : -20,
                    }}
                  />

                  {/* Category image — floats on one side */}
                  {item.displayImage && (
                    <div
                      className={`absolute bottom-0 top-0 w-[48%] flex items-center justify-end
                                  ${isEven ? 'right-0 pr-3' : 'left-0 pl-3'}`}
                    >
                      <img
                        src={item.displayImage}
                        alt={item.parentName}
                        className="h-[85%] w-auto object-contain drop-shadow-2xl
                                   transition-all duration-700
                                   group-hover:scale-110 group-hover:rotate-3"
                      />
                    </div>
                  )}

                  {/* Text content */}
                  <div
                    className={`absolute top-0 bottom-0 w-[55%] flex flex-col
                                justify-center gap-[6px] px-5 z-10
                                ${isEven ? 'left-0 items-start' : 'right-0 items-end text-right'}`}
                  >
                    {/* Tag */}
                    <span
                      className="text-[9px] font-[800] uppercase tracking-[0.18em]
                                 px-2 py-[3px] rounded-sm w-fit"
                      style={{ background: t.tag, color: t.text }}
                    >
                      {item.parentName}
                    </span>

                    {/* Sub-name */}
                    <span
                      className="text-[11px] font-[500]"
                      style={{ color: t.muted }}
                    >
                      {item.subName}
                    </span>

                    {/* Third-level name — big and bold */}
                    <h2
                      className="font-[900] text-[20px] leading-tight line-clamp-2"
                      style={{ color: t.text, maxWidth: 150 }}
                    >
                      {item.name}
                    </h2>

                    {/* CTA */}
                    <span
                      className="!mt2 inline-flex items-center gap-[6px] text-[11px] font-[800]
                                 uppercase tracking-[0.08em] transition-all duration-300
                                 group-hover:gap-[10px] w-fit"
                      style={{ color: t.text }}
                    >
                      Shop Now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        className="transition-transform duration-300 group-hover:translate-x-[4px]"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>

                  {/* Bottom sweep line */}
                  <div
                    className="absolute bottom-0 left-0 h-[3px] w-0 rounded-b-[20px]
                               group-hover:w-full transition-all duration-500"
                    style={{ background: `rgba(255,255,255,0.4)` }}
                  />
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style>{`
        .adsBannerSwiperV1 .swiper-button-next,
        .adsBannerSwiperV1 .swiper-button-prev {
          width: 34px;
          height: 34px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 2px 12px rgba(0,0,0,0.14);
          border: 1px solid #f0f0f0;
          color: #1e293b;
          top: 50%;
        }
        .adsBannerSwiperV1 .swiper-button-next::after,
        .adsBannerSwiperV1 .swiper-button-prev::after {
          font-size: 11px;
          font-weight: 900;
        }
        .adsBannerSwiperV1 .swiper-button-disabled { opacity: 0.25; }
      `}</style>
    </>
  );
};

export default AdsBannerSlider;