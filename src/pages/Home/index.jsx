import React from 'react'
import HomeSlider from '../../components/HomeSlider'
import HomeCatSlider from '../../components/HomeCatSlider'
import AdsBannerSlider from '../../components/AdsBannerSlider'
import AdsBannerSliderV2 from '../../components/AdsBannerSliderV2'
import { LiaShippingFastSolid } from 'react-icons/lia';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ProductsSlider from '../../components/ProductsSlider';
import BlogItem from '../../components/BlogItem';
import HomeCatSliderV2 from '../../components/HomerSliderV2';
import BannerBox from '../../components/BannerBox';
import { Mycontext } from '../../App';

const Home = () => {
  const context = React.useContext(Mycontext);
  const [value, setValue] = React.useState(0);

  const topLevel    = (context.categories || []).filter(c => !c.parentId);
  const selectedCat = topLevel[value] || null;
  const [bannerItems, setBannerItems] = React.useState([null, null]);

  React.useEffect(() => {
    const allCats = context.categories || [];
    if (!allCats.length) return;

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

    if (!all.length) return;
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    setBannerItems([shuffled[0] || null, shuffled[1] || null]);
  }, [context.categories]);

  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <>
      <HomeSlider />
      <HomeCatSlider />

      {/* ── Free shipping strip ── */}
      <section className='section py-4 sm:py-5'>
        <div className='container px-3 sm:px-4'>

          <div className='mt-4'>
            <AdsBannerSliderV2 items={4} into='right' />
          </div>
        </div>
      </section>

      {/* ── HomeCatSliderV2 + BannerBoxes ── */}
      <section className='py-4 sm:py-5'>
        <div className='container px-3 sm:px-4'>
          {/*
            Desktop: slider 70% | banners 30% side by side
            Mobile:  slider full width, banners below as a row
          */}
          <div className='flex flex-col lg:flex-row gap-4 lg:gap-5'>

            {/* Slider — full width on mobile, 70% on lg */}
            <div className='w-full lg:w-[70%]'>
              <HomeCatSliderV2 />
            </div>

            {/* Banner boxes — row on mobile (2 cols), column on lg */}
            <div className='hidden lg:flex w-full lg:w-[30%] flex-row lg:flex-col gap-3 lg:gap-0
                            justify-between items-stretch lg:items-center lg:justify-between'>
              <div className='flex-1 lg:w-full lg:h-[50%]'>
                <BannerBox into='right' fixedItem={bannerItems[0]} themeIndex={0} />
              </div>
              <div className='flex-1 lg:w-full lg:h-[50%]'>
                <BannerBox into='left'  fixedItem={bannerItems[1]} themeIndex={3} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className='py-2'>
        <div className='container px-3 sm:px-4'>

          {/* Section header */}
          <div className='!mt-4 sm:!mt-5'>

            {/* Title row — always visible */}
            <div className='flex items-center justify-between !mb-2'>
              <div>
                <h2 className='text-[18px] sm:text-2xl font-bold leading-tight'>Featured Products</h2>
                <p className='text-[12px] sm:text-[13px] text-gray-500 !mt-0.5'>
                  Do not miss out on our featured products
                </p>
              </div>
            </div>

            {/* Category tabs — scrollable strip, full width on all screens */}
            {topLevel.length > 0 && (
              <div className='w-full overflow-x-auto -mx-0'>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  aria-label="category tabs"
                  sx={{
                    minHeight: '36px',
                    '& .MuiTab-root': {
                      textTransform: 'capitalize',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#555',
                      minWidth: 'auto',
                      minHeight: '36px',
                      padding: '4px 10px',
                      whiteSpace: 'nowrap',
                    },
                    '& .Mui-selected':           { color: '#f51111 !important', fontWeight: 700 },
                    '& .MuiTabs-indicator':      { backgroundColor: '#f51111' },
                    '& .MuiTabs-scrollButtons':  { color: '#555' },
                    '& .MuiTabScrollButton-root': { width: '28px' },
                    '& .MuiTabs-scroller': {
                      overflowY: 'auto !important',
                      scrollbarWidth: 'none', // Firefox
                    },
                    '& .MuiTabs-scroller::-webkit-scrollbar': {
                      display: 'none', // Chrome / Safari
                    },
                  }}
                >
                  {topLevel.map((cat) => (
                    <Tab
                      key={cat._id}
                      label={cat.name}
                      icon={cat.images?.[0]
                        ? <img src={cat.images[0]} alt={cat.name}
                               className='w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] object-contain' />
                        : null}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </div>
            )}
          </div>

          <ProductsSlider items={6} catId={selectedCat?._id || ''} catName={selectedCat?.name || ''} />
        </div>

        <div className='container !mt-5 px-3 sm:px-4'>
          <AdsBannerSlider items={3} />
        </div>

        {/* ── New Arrivals ── */}
        <div className='container !mt-5 px-3 sm:px-4'>
          <div className='flex items-center justify-between !mt-4 sm:!mt-5'>
            <div className='leftSec'>
              <h2 className='text-xl sm:text-2xl font-bold'>New Arrivals</h2>
              <p className='text-[13px] text-gray-500'>Fresh picks just added to our store</p>
            </div>
          </div>
          <ProductsSlider items={6} />
        </div>
      </section>
    </>
  );
};

export default Home;