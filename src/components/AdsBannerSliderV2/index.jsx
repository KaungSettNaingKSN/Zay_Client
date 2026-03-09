import React, { useContext } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { Mycontext } from '../../App';

// Curated gradient pairs per slide index
const GRADIENTS = [
  { from: '#fff7ed', to: '#fce7d6', accent: '#f97316' },
  { from: '#fdf2f8', to: '#fce7f3', accent: '#ec4899' },
  { from: '#eff6ff', to: '#dbeafe', accent: '#3b82f6' },
  { from: '#f0fdf4', to: '#dcfce7', accent: '#22c55e' },
  { from: '#fefce8', to: '#fef9c3', accent: '#eab308' },
  { from: '#fdf4ff', to: '#f3e8ff', accent: '#a855f7' },
  { from: '#fff1f2', to: '#ffe4e6', accent: '#f51111' },
  { from: '#f0fdfa', to: '#ccfbf1', accent: '#14b8a6' },
];

// Skeleton cards for loading state
const BannerSkeleton = ({ count }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="rounded-2xl overflow-hidden flex-shrink-0"
        style={{ width: `calc(100% / ${count} - 8px)` }}
      >
        <Skeleton
          variant="rectangular"
          height={210}
          sx={{ transform: 'none', borderRadius: '16px' }}
        />
      </div>
    ))}
  </>
);

const AdsBannerSliderV2 = ({ items = 4, into = 'left' }) => {
  const context = useContext(Mycontext);
  const [latestSubCats, setLatestSubCats] = React.useState([]);

  // Load categories if not already loaded
  React.useEffect(() => {
    if ((context.categories || []).length === 0) {
      context.reloadCategories?.();
    }
  }, [context]);

  const categoriesLoading = context.categoriesLoading ?? (context.categories === null);

  // 4 random sub-categories — sub-cats live inside cat.children[], not flat in allCats
  React.useEffect(() => {
    const allCats = context.categories || [];
    const all = [];
    allCats.forEach(parent => {
      if (!parent.children?.length) return;
      parent.children.forEach(sub => {
        all.push({
          ...sub,
          displayImage: parent?.images?.[0] || parent?.image || null,
          parentName:   parent?.name || '',
          parentCatId:  parent._id,
        });
      });
    });
    setLatestSubCats([...all].sort(() => Math.random() - 0.5).slice(0, 4));
  }, [context.categories]);


  return (
    <>
      <div className="adsBannerSliderV2 !!mt5 !!mt-5">
        {categoriesLoading ? (
          <div className="flex gap-3 py-5">
            <BannerSkeleton count={items} />
          </div>
        ) : latestSubCats.length === 0 ? null : (
          <Swiper
            slidesPerView={Math.min(items, latestSubCats.length)}
            spaceBetween={12}
            navigation
            loop={latestSubCats.length > items}
            autoplay={{ delay: 3800, disableOnInteraction: false, pauseOnMouseEnter: true }}
            modules={[Navigation, Autoplay]}
            className="adsBannerSwiper py-5"
            breakpoints={{
              0:    { slidesPerView: 1 },
              640:  { slidesPerView: Math.min(2, items) },
              1024: { slidesPerView: Math.min(items, latestSubCats.length) },
            }}
          >
            {latestSubCats.map((sub, index) => {
              const g      = GRADIENTS[index % GRADIENTS.length];
              const isLeft = into === 'left';

              return (
                <SwiperSlide key={`${sub._id}-${index}`}>
                  <Link
                    to={`/productListing?catId=${sub.parentCatId}&catName=${encodeURIComponent(sub.parentName)}&subCatId=${sub._id}&subCat=${encodeURIComponent(sub.name)}`}
                    className="block group"
                  >
                    <div
                      className="relative w-full overflow-hidden h-[210px] rounded-2xl
                                 shadow-sm hover:shadow-lg transition-shadow duration-300"
                      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                    >
                      {/* Decorative circles */}
                      <div
                        className="absolute -bottom-8 rounded-full opacity-20 transition-transform
                                   duration-500 group-hover:scale-110"
                        style={{
                          width: 180, height: 180,
                          background: g.accent,
                          right: isLeft ? -30 : 'auto',
                          left:  isLeft ? 'auto' : -30,
                        }}
                      />
                      <div
                        className="absolute -top-6 rounded-full opacity-10"
                        style={{
                          width: 100, height: 100,
                          background: g.accent,
                          right: isLeft ? 10 : 'auto',
                          left:  isLeft ? 'auto' : 10,
                        }}
                      />

                      {/* Parent category image */}
                      {sub.displayImage ? (
                        <div
                          className={`absolute top-0 bottom-0 w-[52%] flex items-center
                                      justify-center p-3
                                      ${isLeft ? 'right-0' : 'left-0'}`}
                        >
                          <img
                            src={sub.displayImage}
                            alt={sub.parentName}
                            className="w-full h-full object-contain drop-shadow-md
                                       transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div
                          className={`absolute top-0 bottom-0 w-[52%] flex items-center
                                      justify-center ${isLeft ? 'right-0' : 'left-0'}`}
                        >
                          <span
                            className="text-[90px] font-[900] leading-none select-none
                                       transition-transform duration-500 group-hover:scale-110
                                       inline-block"
                            style={{ color: g.accent, opacity: 0.18 }}
                          >
                            {sub.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Text info */}
                      <div
                        className={`absolute top-0 bottom-0 w-[52%] flex flex-col justify-center
                                    gap-1 px-4 z-10
                                    ${isLeft ? 'left-0 items-start' : 'right-0 items-end text-right'}`}
                      >
                        {/* Parent name as label pill */}
                        <span
                          className="text-[10px] font-[800] uppercase tracking-[0.12em]
                                     px-2 py-[3px] rounded-full w-fit !mt-1"
                          style={{ background: g.accent + '22', color: g.accent }}
                        >
                          {sub.parentName || 'Category'}
                        </span>

                        {/* Sub-category name */}
                        <h2
                          className="text-gray-900 font-[800] text-[17px] leading-tight line-clamp-2"
                          style={{ maxWidth: 140 }}
                        >
                          {sub.name}
                        </h2>

                        <p className="text-gray-500 text-[11px] font-[500] !mt[2px]">
                          Explore collection
                        </p>

                        {/* Shop Now pill */}
                        <span
                          className="!mt2 inline-flex items-center gap-1 text-[11px] font-[700]
                                     px-3 py-[5px] rounded-full transition-all duration-300
                                     group-hover:gap-2 shadow-sm w-fit"
                          style={{
                            background: g.accent,
                            color: '#fff',
                            boxShadow: `0 4px 12px ${g.accent}55`,
                          }}
                        >
                          Shop Now
                          <svg
                            width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="3"
                            strokeLinecap="round" strokeLinejoin="round"
                            className="transition-transform duration-300 group-hover:translate-x-[3px]"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                      </div>

                      {/* Bottom accent border on hover */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: g.accent }}
                      />
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>

      <style>{`
        .adsBannerSwiper .swiper-button-next,
        .adsBannerSwiper .swiper-button-prev {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12);
          border: 1px solid #f1f1f1;
          color: #374151;
          top: 50%;
        }
        .adsBannerSwiper .swiper-button-next::after,
        .adsBannerSwiper .swiper-button-prev::after {
          font-size: 12px;
          font-weight: 900;
        }
        .adsBannerSwiper .swiper-button-disabled {
          opacity: 0.3;
        }
      `}</style>
    </>
  );
};

export default AdsBannerSliderV2;