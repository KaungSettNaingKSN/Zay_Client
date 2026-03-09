import React from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SideBar from '../../components/SideBar'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Pagination from '@mui/material/Pagination';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import ProductItem from '../../components/ProductItem';
import ProductItemListView from '../../components/ProductItemListView';
import { IoGridSharp } from 'react-icons/io5';
import { LuMenu } from 'react-icons/lu';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { fetchData } from '../../utils/api';

const SORT_OPTIONS = [
  { label: 'Default',           value: 'default'    },
  { label: 'Name, A → Z',       value: 'name_asc'   },
  { label: 'Name, Z → A',       value: 'name_desc'  },
  { label: 'Price: Low → High', value: 'price_asc'  },
  { label: 'Price: High → Low', value: 'price_desc' },
];

const PER_PAGE = 12;

const GridSkeleton = () => (
  <div className='rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm'>
    <Skeleton variant="rectangular" width="100%" height={150} />
    <div className='p-3 flex flex-col gap-2'>
      <Skeleton width="35%" height={12} />
      <Skeleton width="85%" height={16} />
      <Skeleton width="30%" height={20} />
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className='flex rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm'>
    <Skeleton variant="rectangular" width={120} height={110} sx={{ flexShrink: 0 }} />
    <div className='flex-1 p-3 flex flex-col gap-2'>
      <Skeleton width="25%" height={12} />
      <Skeleton width="70%" height={18} />
      <Skeleton width="90%" height={13} />
      <Skeleton width="20%" height={22} />
    </div>
  </div>
);

function buildApiUrl(params, page) {
  const base = `page=${page}&perPage=${PER_PAGE}`;

  const q           = params.get('q')?.trim()       || '';
  const catIds      = params.get('catIds')           || '';
  const catId       = params.get('catId')            || '';
  const catName     = params.get('catName')          || '';
  const subCatId    = params.get('subCatId')         || '';
  const subCat      = params.get('subCat')           || '';
  const thirdSubCatId = params.get('thirdSubCatId')  || '';
  const thirdSubCat   = params.get('thirdSubCat')    || '';
  const hasMinPrice = params.has('minPrice');
  const hasMaxPrice = params.has('maxPrice');
  const minPrice    = hasMinPrice ? params.get('minPrice') : '';
  const maxPrice    = hasMaxPrice ? params.get('maxPrice') : '';
  const rating      = params.get('rating')           || '';

  if (q) {
    const parts = [
      `q=${encodeURIComponent(q)}`,
      base,
      hasMinPrice ? `minPrice=${minPrice}` : '',
      hasMaxPrice ? `maxPrice=${maxPrice}` : '',
      rating      ? `rating=${rating}`     : '',
    ].filter(Boolean).join('&')
    return `/api/user/search?${parts}`
  }

  const filterParts = [
    hasMinPrice   ? `minPrice=${minPrice}`                 : '',
    hasMaxPrice   ? `maxPrice=${maxPrice}`                 : '',
    rating        ? `rating=${rating}`                     : '',
    catIds        ? `catIds=${encodeURIComponent(catIds)}` : '',
    catId         ? `catId=${catId}`                       : '',
    subCatId      ? `subCatId=${subCatId}`                 : '',
    thirdSubCatId ? `thirdsubCatId=${thirdSubCatId}`       : '',
  ].filter(Boolean).join('&');

  const qs = filterParts ? `${base}&${filterParts}` : base;

  if (rating)                     return `/api/product/byRating?${qs}`;
  if (hasMinPrice || hasMaxPrice) return `/api/product/byPrice?${qs}`;
  if (catIds)                     return `/api/product/byMultipleCategories?catIds=${encodeURIComponent(catIds)}&${base}`;
  if (thirdSubCatId)              return `/api/product/byThirdSubCategoryId/${thirdSubCatId}?${base}`;
  if (thirdSubCat)                return `/api/product/byThirdSubCategoryName?thirdsubCat=${encodeURIComponent(thirdSubCat)}&${base}`;
  if (subCatId)                   return `/api/product/bySubCategoryId/${subCatId}?${base}`;
  if (subCat)                     return `/api/product/bySubCategoryName?subCat=${encodeURIComponent(subCat)}&${base}`;
  if (catId)                      return `/api/product/byCategoryId/${catId}?${base}`;
  if (catName)                    return `/api/product/byCategoryName?catName=${encodeURIComponent(catName)}&${base}`;

  return `/api/product/?${base}`;
}

const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const q           = searchParams.get('q')           || '';
  const catId       = searchParams.get('catId')       || '';
  const catName     = searchParams.get('catName')     || '';
  const subCatId    = searchParams.get('subCatId')    || '';
  const subCat      = searchParams.get('subCat')      || '';
  const thirdSubCat = searchParams.get('thirdSubCat') || '';
  const catNames    = searchParams.get('catNames')    || '';
  const minPrice    = searchParams.get('minPrice')    || '';
  const maxPrice    = searchParams.get('maxPrice')    || '';
  const rating      = searchParams.get('rating')      || '';

  const removeQ = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('minPrice')
    next.delete('maxPrice')
    next.delete('rating')
    const qs = next.toString()
    navigate(qs ? `/productListing?${qs}` : '/productListing')
  }

  const displayLabel = q
    ? `"${q}"`
    : thirdSubCat || subCat || catName || catNames.replace(/,/g, ', ');

  const activeFilters = [
    rating                 && `⭐ ${rating}+ stars`,
    (minPrice || maxPrice) && `$${minPrice || 0} – $${maxPrice || '∞'}`,
  ].filter(Boolean);

  const [itemView,   setItemView]   = React.useState('grid');
  const [anchorEl,   setAnchorEl]   = React.useState(null);
  const [sortValue,  setSortValue]  = React.useState('default');
  const [products,   setProducts]   = React.useState([]);
  const [loading,    setLoading]    = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page,       setPage]       = React.useState(1);

  const open     = Boolean(anchorEl);
  const paramKey = searchParams.toString();

  React.useEffect(() => { setPage(1); }, [paramKey]);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const url = buildApiUrl(searchParams, page);
        const res = await fetchData(url);
        if (!cancelled) {
          setProducts(res.data?.product || []);
          setTotalPages(res.data?.totalPages || 1);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, page]);

  const sorted = React.useMemo(() => {
    const arr = [...products];
    switch (sortValue) {
      case 'name_asc':   return arr.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':  return arr.sort((a, b) => b.name.localeCompare(a.name));
      case 'price_asc':  return arr.sort((a, b) => a.price - b.price);
      case 'price_desc': return arr.sort((a, b) => b.price - a.price);
      default:           return arr;
    }
  }, [products, sortValue]);

  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortValue)?.label || 'Sort by';

  return (
    <section className='py-4 md:py-8 bg-gray-50 min-h-screen'>
      <div className='container px-3 md:px-4'>

        {/* ── Breadcrumb — full width on mobile ── */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 !mb-3'>
          <Breadcrumbs aria-label="breadcrumb" className='text-[12px]'>
            <Link to="/" className='text-gray-500 hover:text-[#f51111] text-[12px] transition-colors'>
              Home
            </Link>
            {q && (
              <span className='text-gray-900 font-[600] text-[12px] line-clamp-1'>Search: "{q}"</span>
            )}
            {!q && catName && !subCat && !thirdSubCat && (
              <span className='text-gray-900 font-[600] text-[12px]'>{catName}</span>
            )}
            {!q && catName && subCat && (
              <Link to={`/productListing?catId=${encodeURIComponent(catId)}&catName=${encodeURIComponent(catName)}`}
                className='text-gray-500 hover:text-[#f51111] text-[12px] transition-colors'>
                {catName}
              </Link>
            )}
            {!q && subCat && !thirdSubCat && (
              <span className='text-gray-900 font-[600] text-[12px]'>{subCat}</span>
            )}
            {!q && subCat && thirdSubCat && (
              <Link to={`/productListing?catId=${encodeURIComponent(catId)}&catName=${encodeURIComponent(catName)}&subCatId=${encodeURIComponent(subCatId)}&subCat=${encodeURIComponent(subCat)}`}
                className='text-gray-500 hover:text-[#f51111] text-[12px] transition-colors'>
                {subCat}
              </Link>
            )}
            {!q && thirdSubCat && (
              <span className='text-gray-900 font-[600] text-[12px]'>{thirdSubCat}</span>
            )}
            {!q && catNames && !catName && (
              <span className='text-gray-900 font-[600] text-[12px]'>{catNames.replace(/,/g, ', ')}</span>
            )}
          </Breadcrumbs>
        </div>

        {/* ── Layout: sidebar hidden on mobile (drawer instead), flex on md+ ── */}
        <div className='flex gap-4'>

          {/* Desktop sidebar */}
          <div className='hidden md:block w-[22%] flex-shrink-0'>
            <SideBar />
          </div>

          {/* Main content — full width on mobile */}
          <div className='flex-1 min-w-0'>

            {/* Toolbar */}
            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm
                            px-3 md:px-4 py-2.5 !mb-3 flex flex-col gap-2'>

              {/* Row 1: view toggles + product count + sort */}
              <div className='flex items-center justify-between gap-2'>

                {/* Left: view toggles + count */}
                <div className='flex items-center gap-2 min-w-0'>
                  <button
                    onClick={() => setItemView('grid')}
                    className={`w-[32px] h-[32px] rounded-xl flex items-center justify-center transition-colors duration-200 flex-shrink-0
                                ${itemView === 'grid' ? 'bg-[#f51111] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title="Grid view"
                  >
                    <IoGridSharp size={14} />
                  </button>
                  <button
                    onClick={() => setItemView('list')}
                    className={`w-[32px] h-[32px] rounded-xl flex items-center justify-center transition-colors duration-200 flex-shrink-0
                                ${itemView === 'list' ? 'bg-[#f51111] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title="List view"
                  >
                    <LuMenu size={16} />
                  </button>

                  {!loading && (
                    <span className='text-[11px] text-gray-400 truncate min-w-0 max-w-[160px] md:max-w-none'>
                      <span className='font-[600] text-gray-600'>{sorted.length}</span>
                      {' '}product{sorted.length !== 1 ? 's' : ''}
                      {displayLabel
                        ? <span className='hidden md:inline'> for {displayLabel}</span>
                        : null}
                    </span>
                  )}
                </div>

                {/* Right: sort button — always visible, full label on sm+ */}
                <button
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  className='flex items-center gap-1.5 px-3 py-[6px] rounded-xl bg-gray-100 text-gray-700
                             text-[12px] font-[600] hover:bg-gray-200 transition-colors duration-200 flex-shrink-0'
                >
                  <span className='hidden md:inline max-w-[140px] truncate'>{activeSortLabel}</span>
                  <span className='md:hidden'>Sort</span>
                  <MdKeyboardArrowDown size={16} className={`transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
                </button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { borderRadius: '12px', mt: 0.5, minWidth: 180 } }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <MenuItem
                      key={opt.value}
                      onClick={() => { setSortValue(opt.value); setAnchorEl(null); }}
                      selected={sortValue === opt.value}
                      sx={{
                        fontSize: '13px',
                        fontWeight: sortValue === opt.value ? 700 : 400,
                        color:     sortValue === opt.value ? '#f51111' : 'inherit',
                      }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Menu>
              </div>

              {/* Row 2: active filter chips — only shown when there are chips */}
              {(q || activeFilters.length > 0) && (
                <div className='flex items-center gap-1.5 flex-wrap'>
                  {q && (
                    <span className='flex items-center gap-1 text-[11px] font-[600] bg-red-50
                                     text-[#f51111] border border-red-100 px-2 py-[3px] rounded-full'>
                      🔍 <span className='max-w-[100px] md:max-w-[200px] truncate'>{q}</span>
                      <button
                        onClick={removeQ}
                        className='ml-0.5 hover:text-red-700 transition-colors leading-none'
                        aria-label='Remove search'
                      >✕</button>
                    </span>
                  )}
                  {activeFilters.map((f) => (
                    <span key={f} className='text-[11px] font-[600] bg-red-50 text-[#f51111] border border-red-100 px-2 py-[3px] rounded-full'>
                      {f}
                    </span>
                  ))}
                </div>
              )}

            </div>

            {/* Product count on mobile (below toolbar) */}
            {!loading && (
              <p className='sm:hidden text-[11px] text-gray-400 mb-2 px-1 line-clamp-1'>
                {sorted.length} product{sorted.length !== 1 ? 's' : ''}
                {displayLabel ? ` for ${displayLabel}` : ''}
              </p>
            )}

            {/* Product grid / list / states */}
            {loading ? (
              <div className={`grid gap-3 ${
                itemView === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: PER_PAGE }).map((_, i) =>
                  itemView === 'grid' ? <GridSkeleton key={i} /> : <ListSkeleton key={i} />
                )}
              </div>
            ) : sorted.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-[300px] md:h-[400px]
                              bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 gap-3'>
                <span className='text-[40px] md:text-[48px]'>📦</span>
                <p className='text-[14px] md:text-[15px] font-[600]'>
                  {q ? `No results for "${q}"` : 'No products found'}
                </p>
                <p className='text-[12px] md:text-[13px] text-center px-4'>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={`grid gap-2 md:gap-3 ${
                itemView === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {sorted.map(product =>
                  itemView === 'grid'
                    ? <ProductItem         key={product._id} product={product} />
                    : <ProductItemListView key={product._id} product={product} />
                )}
              </div>
            )}

            {/* Pagination — add bottom padding on mobile for floating filter button */}
            {!loading && totalPages > 1 && (
              <div className='flex items-center justify-center !mt-6 md:!mt-8 pb-20 md:pb-0'>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  showFirstButton
                  showLastButton
                  size='small'
                  sx={{
                    '& .MuiPaginationItem-root': { borderRadius: '10px' },
                    '& .Mui-selected': { backgroundColor: '#f51111 !important', color: '#fff !important' },
                  }}
                />
              </div>
            )}

            {/* Bottom padding on mobile for floating filter button */}
            <div className='h-20 md:h-0' />
          </div>
        </div>

        {/* Mobile sidebar (drawer-based, rendered outside the layout flow) */}
        <div className='md:hidden'>
          <SideBar />
        </div>
      </div>
    </section>
  );
};

export default ProductListing;