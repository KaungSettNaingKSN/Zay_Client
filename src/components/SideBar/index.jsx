import React, { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Rating from '@mui/material/Rating';
import Drawer from '@mui/material/Drawer';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { MdFilterAltOff, MdFilterAlt, MdClose } from 'react-icons/md';
import { Mycontext } from '../../App';

const PRICE_MIN = 0;
const PRICE_MAX = 10000;
const fmt = (v) => `$${v.toLocaleString()}`;

const RangeSlider = ({ min, max, value, onChange, onCommit }) => {
  const trackRef    = React.useRef(null);
  const draggingRef = React.useRef(null);
  const [activeThumb, setActiveThumb] = React.useState(null);

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const valueFromClient = (clientX) => {
    const rect  = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round((min + ratio * (max - min)) / 10) * 10;
  };

  const onPointerDown = (thumb) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = thumb;
    setActiveThumb(thumb);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const v = valueFromClient(e.clientX);
    if (draggingRef.current === 'min') onChange([Math.min(v, value[1] - 10), value[1]]);
    else                               onChange([value[0], Math.max(v, value[0] + 10)]);
  };

  const onPointerUp = (e) => {
    if (!draggingRef.current) return;
    const v    = valueFromClient(e.clientX);
    const next = draggingRef.current === 'min'
      ? [Math.min(v, value[1] - 10), value[1]]
      : [value[0], Math.max(v, value[0] + 10)];
    draggingRef.current = null;
    setActiveThumb(null);
    onCommit(next);
  };

  const left  = pct(value[0]);
  const right = pct(value[1]);

  return (
    <div className="relative select-none py-3">
      <div ref={trackRef} className="relative h-[4px] rounded-full bg-gray-200" style={{ userSelect: 'none' }}>
        <div className="absolute h-full rounded-full bg-[#f51111]"
          style={{ left: `${left}%`, right: `${100 - right}%`, pointerEvents: 'none' }} />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[22px] h-[22px]
                        rounded-full bg-white border-2 border-[#f51111] shadow-md cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${left}%`, zIndex: activeThumb === 'min' ? 3 : 2 }}
          onPointerDown={onPointerDown('min')} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[22px] h-[22px]
                        rounded-full bg-white border-2 border-[#f51111] shadow-md cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${right}%`, zIndex: activeThumb === 'max' ? 3 : 2 }}
          onPointerDown={onPointerDown('max')} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
      </div>
    </div>
  );
};

const FilterSection = ({ title, open, onToggle, children }) => (
  <div className='border-b border-gray-100 last:border-0'>
    <button onClick={onToggle}
      className='w-full flex items-center justify-between px-4 py-3 text-[13px] font-[700]
                 text-gray-800 hover:text-[#f51111] transition-colors duration-200
                 bg-transparent border-0 cursor-pointer'>
      <span>{title}</span>
      {open ? <FaAngleUp size={12} /> : <FaAngleDown size={12} />}
    </button>
    <Collapse in={open} timeout="auto">
      <div className='px-4 pb-4'>{children}</div>
    </Collapse>
  </div>
);

// Inner sidebar content shared between desktop and mobile drawer
const SideBarContent = ({ onClose }) => {
  const context = React.useContext(Mycontext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [openSections, setOpenSections] = useState({ category: true, price: true, rating: true });
  const toggle = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const currentQ = searchParams.get('q') || '';

  const navCatId   = searchParams.get('catId')   || '';
  const navCatName = searchParams.get('catName') || '';

  const selectedCatIds = useMemo(() => {
    const fromSidebar = (searchParams.get('catIds') || '').split(',').filter(Boolean);
    if (navCatId && !fromSidebar.includes(navCatId)) return [...fromSidebar, navCatId];
    return fromSidebar;
  }, [searchParams, navCatId]);

  const selectedCatNames = useMemo(() => {
    const fromSidebar = (searchParams.get('catNames') || '').split(',').filter(Boolean);
    if (navCatName && !fromSidebar.includes(navCatName)) return [...fromSidebar, navCatName];
    return fromSidebar;
  }, [searchParams, navCatName]);

  const selectedRating = parseInt(searchParams.get('rating') || '0', 10);
  const urlMinPrice    = parseInt(searchParams.get('minPrice') || String(PRICE_MIN), 10);
  const urlMaxPrice    = parseInt(searchParams.get('maxPrice') || String(PRICE_MAX), 10);

  const isDragging = React.useRef(false);
  const [priceDraft, setPriceDraft] = useState([urlMinPrice, urlMaxPrice]);

  React.useEffect(() => {
    if (!isDragging.current) setPriceDraft([urlMinPrice, urlMaxPrice]);
  }, [urlMinPrice, urlMaxPrice]);

  const hasActiveFilters =
    selectedCatIds.length > 0 ||
    selectedRating > 0 ||
    urlMinPrice > PRICE_MIN ||
    urlMaxPrice < PRICE_MAX;

  React.useEffect(() => {
    if ((context.categories || []).length === 0) context.reloadCategories?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topLevelCats = (context.categories || []).filter((c) => !c.parentId);

  const pushFilters = useCallback(
    (overrides = {}) => {
      const catIds   = overrides.catIds   ?? selectedCatIds;
      const catNames = overrides.catNames ?? selectedCatNames;
      const minPrice = overrides.minPrice !== undefined ? overrides.minPrice : urlMinPrice;
      const maxPrice = overrides.maxPrice !== undefined ? overrides.maxPrice : urlMaxPrice;
      const rating   = overrides.rating   !== undefined ? overrides.rating   : selectedRating;

      const params = new URLSearchParams();

      if (currentQ) params.set('q', currentQ);

      if (!currentQ) {
        if (catIds.length > 0)   params.set('catIds',   catIds.join(','));
        if (catNames.length > 0) params.set('catNames', catNames.join(','));
      }

      if (minPrice > PRICE_MIN) params.set('minPrice', minPrice);
      if (maxPrice < PRICE_MAX) params.set('maxPrice', maxPrice);
      if (rating > 0)           params.set('rating',   rating);

      navigate(`/productListing?${params.toString()}`);
      onClose?.();
    },
    [currentQ, selectedCatIds, selectedCatNames, urlMinPrice, urlMaxPrice, selectedRating, navigate, onClose]
  );

  const handleCategoryChange = useCallback(
    (cat) => {
      const isSelected = selectedCatIds.includes(cat._id);
      const nextIds   = isSelected ? selectedCatIds.filter((id) => id !== cat._id) : [...selectedCatIds, cat._id];
      const nextNames = isSelected ? selectedCatNames.filter((n) => n !== cat.name) : [...selectedCatNames, cat.name];
      pushFilters({ catIds: nextIds, catNames: nextNames });
    },
    [selectedCatIds, selectedCatNames, pushFilters]
  );

  const handleRatingChange = useCallback(
    (star) => pushFilters({ rating: star === selectedRating ? 0 : star }),
    [selectedRating, pushFilters]
  );

  const clearAll = useCallback(() => {
    setPriceDraft([PRICE_MIN, PRICE_MAX]);
    if (currentQ) navigate(`/productListing?q=${encodeURIComponent(currentQ)}`);
    else          navigate('/productListing');
    onClose?.();
  }, [navigate, currentQ, onClose]);

  return (
    <aside className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
        <span className='text-[13px] font-[800] text-gray-800 tracking-wide uppercase'>Filters</span>
        <div className='flex items-center gap-2'>
          {hasActiveFilters && (
            <button onClick={clearAll}
              className='flex items-center gap-1 text-[11px] font-[600] text-[#f51111]
                         hover:text-red-700 transition-colors border-0 bg-transparent cursor-pointer'>
              <MdFilterAltOff size={14} />
              Clear all
            </button>
          )}
          {/* Mobile close button */}
          {onClose && (
            <button onClick={onClose}
              className='flex items-center justify-center w-[28px] h-[28px] rounded-full
                         bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border-0 cursor-pointer md:hidden'>
              <MdClose size={16} />
            </button>
          )}
        </div>
      </div>

      {!currentQ && (
        <FilterSection
          title={`Shop By Category${selectedCatIds.length > 0 ? ` (${selectedCatIds.length})` : ''}`}
          open={openSections.category}
          onToggle={() => toggle('category')}
        >
          <div className='flex flex-col gap-[2px] max-h-[220px] overflow-y-auto pr-1'>
            {topLevelCats.length === 0 && (
              <span className='text-[12px] text-gray-400 italic'>Loading…</span>
            )}
            {topLevelCats.map((cat) => {
              const checked = selectedCatIds.includes(cat._id);
              return (
                <FormControlLabel
                  key={cat._id}
                  label={
                    <span className={`text-[12px] font-[500] ${checked ? 'text-[#f51111]' : 'text-gray-700'}`}>
                      {cat.name}
                    </span>
                  }
                  control={
                    <Checkbox
                      size='small'
                      checked={checked}
                      onChange={() => handleCategoryChange(cat)}
                      sx={{ color: '#d1d5db', '&.Mui-checked': { color: '#f51111' }, padding: '4px' }}
                    />
                  }
                  className={`!m-0 rounded-lg px-1 transition-colors w-full ${checked ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                />
              );
            })}
          </div>
          {selectedCatNames.length > 0 && (
            <div className='flex flex-wrap gap-1 pt-2 border-t border-gray-50'>
              {selectedCatNames.map((name, i) => (
                <span key={name}
                  onClick={() => handleCategoryChange({ _id: selectedCatIds[i], name })}
                  className='text-[10px] font-[600] bg-red-50 text-[#f51111] border border-red-100
                             px-2 py-[2px] rounded-full cursor-pointer hover:bg-red-100 transition-colors'>
                  {name} ✕
                </span>
              ))}
            </div>
          )}
        </FilterSection>
      )}

      <FilterSection title='Price Range' open={openSections.price} onToggle={() => toggle('price')}>
        <RangeSlider
          min={PRICE_MIN} max={PRICE_MAX} value={priceDraft}
          onChange={(v) => { isDragging.current = true; setPriceDraft(v); }}
          onCommit={(v) => { isDragging.current = false; pushFilters({ minPrice: v[0], maxPrice: v[1] }); }}
        />
        <div className='flex justify-between'>
          <span className='text-[11px] text-gray-500 font-[600]'>{fmt(priceDraft[0])}</span>
          <span className='text-[11px] text-gray-500 font-[600]'>{fmt(priceDraft[1])}</span>
        </div>
      </FilterSection>

      <FilterSection title='Customer Rating' open={openSections.rating} onToggle={() => toggle('rating')}>
        <div className='flex flex-col gap-1'>
          {[4, 3, 2, 1].map((star) => (
            <button key={star} onClick={() => handleRatingChange(star)}
              className={`flex items-center gap-2 px-2 py-[5px] rounded-lg w-full border text-left
                          transition-all duration-150 cursor-pointer
                          ${selectedRating === star ? 'border-[#f51111] bg-red-50' : 'border-transparent hover:bg-gray-50'}`}>
              <Rating value={star} readOnly size='small'
                sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
              <span className='text-[11px] text-gray-500 font-[500]'>& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
};

// Mobile filter trigger button + drawer wrapper
const SideBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Count active filters for badge
  const activeCount = [
    (searchParams.get('catIds') || searchParams.get('catId')) ? 1 : 0,
    searchParams.get('rating') ? 1 : 0,
    (searchParams.get('minPrice') || searchParams.get('maxPrice')) ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className='hidden md:block'>
        <SideBarContent />
      </div>

      {/* ── Mobile: floating filter button ── */}
      <div className='md:hidden'>
        <button
          onClick={() => setDrawerOpen(true)}
          className='fixed bottom-5 left-1/2 -translate-x-1/2 z-40
                     flex items-center gap-2 px-5 py-3 rounded-full
                     bg-[#f51111] text-white shadow-lg text-[13px] font-[700]
                     hover:bg-[#e04040] transition-colors active:scale-95'
        >
          <MdFilterAlt size={18} />
          Filters
          {activeCount > 0 && (
            <span className='w-[20px] h-[20px] rounded-full bg-white text-[#f51111]
                             text-[11px] font-[800] flex items-center justify-center'>
              {activeCount}
            </span>
          )}
        </button>

        <Drawer
          anchor='bottom'
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              maxHeight: '85vh',
              overflow: 'auto',
            }
          }}
        >
          <div className='p-2'>
            {/* Drag handle */}
            <div className='flex justify-center mb-2'>
              <div className='w-[36px] h-[4px] rounded-full bg-gray-200' />
            </div>
            <SideBarContent onClose={() => setDrawerOpen(false)} />
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default SideBar;