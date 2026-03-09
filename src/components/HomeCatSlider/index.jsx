import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Mycontext } from '../../App';
import Skeleton from '@mui/material/Skeleton';

const PlaceholderIcon = ({ name }) => (
  <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-blue-100 to-blue-200
                  flex items-center justify-center text-[20px] font-bold text-blue-500 select-none">
    {name?.charAt(0).toUpperCase()}
  </div>
);

const HomeCatSlider = () => {
  const context = React.useContext(Mycontext);
  const [swiperInstance, setSwiperInstance] = React.useState(null);
  const [showNav, setShowNav] = React.useState(false);

  const topLevel = (context.categories || []).filter(c => !c.parentId);
  const isLoading = topLevel.length === 0;
  const checkNav = React.useCallback((swiper) => {
    if (!swiper) return;
    setShowNav(swiper.slides.length > swiper.params.slidesPerView);
  }, []);

  React.useEffect(() => {
    if (swiperInstance) checkNav(swiperInstance);
  }, [swiperInstance, topLevel, checkNav]);

  return (
    <div className='homeCatSlider py-6'>
      <div className='container'>

        <div className='flex items-center justify-between !mt-4 !mb-2'>
          <h2 className='text-[18px] font-[700] text-gray-800'>Shop by Category</h2>
        </div>

        <Swiper
          onSwiper={(swiper) => {
            setSwiperInstance(swiper);
            checkNav(swiper);
          }}
          onBreakpoint={(swiper) => checkNav(swiper)} 
          slidesPerView={2}
          spaceBetween={12}
          navigation={showNav} 
          modules={[Navigation]}
          className="homeCatSwiper !pb-2"
          breakpoints={{
            480:  { slidesPerView: 3 },
            640:  { slidesPerView: 4 },
            768:  { slidesPerView: 5 },
            1024: { slidesPerView: 7 },
            1280: { slidesPerView: 9 },
          }}
        >
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <SwiperSlide key={i}>
                  <div className='flex flex-col items-center gap-2 p-3'>
                    <Skeleton variant="circular" width={70} height={70} />
                    <Skeleton width={60} height={14} />
                  </div>
                </SwiperSlide>
              ))
            : topLevel.map((cat) => (
                <SwiperSlide key={cat._id}>
                  <Link
                    to={`/productListing?catId=${cat._id}&catName=${encodeURIComponent(cat.name)}`}
                    className='group block'
                  >
                    <div className='item flex flex-col items-center justify-center gap-2 p-4
                                    rounded-xl bg-white border border-[rgba(0,0,0,0.07)]
                                    shadow-sm cursor-pointer
                                    transition-all duration-200
                                    group-hover:shadow-md group-hover:-translate-y-1
                                    group-hover:border-blue-200 group-hover:bg-[#f511110A]'>

                      <div className='w-[62px] h-[62px] flex items-center justify-center
                                      rounded-full bg-gray-50 overflow-hidden
                                      transition-transform duration-200 group-hover:scale-110'>
                        {cat.images?.[0]
                          ? <img src={cat.images[0]} alt={cat.name} className='w-[50px] h-[50px] object-contain' />
                          : <PlaceholderIcon name={cat.name} />
                        }
                      </div>

                      <h3 className='text-center text-[12px] font-[600] text-gray-700 leading-tight
                                     group-hover:text-[#f51111] transition-colors line-clamp-2'>
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
          }
        </Swiper>
      </div>
    </div>
  );
};

export default HomeCatSlider;