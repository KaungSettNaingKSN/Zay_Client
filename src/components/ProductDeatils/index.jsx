import React, { useState, useContext, useEffect, useRef, useMemo } from 'react'
import Rating from '@mui/material/Rating';
import { MdOutlineShoppingCart, MdLocalShipping, MdVerified, MdCheckCircle, MdEdit } from 'react-icons/md';
import { FaRegHeart, FaHeart, FaMinus, FaPlus } from 'react-icons/fa';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { postData, deleteData, putData } from '../../utils/api';
import { Mycontext } from '../../App';
import { useNavigate } from 'react-router-dom';

/* ─── Pill Selector ──────────────────────────────────────────────────────── */
const PillSelector = ({ label, options, selected, onSelect, savedIndex, required }) => {
  if (!options?.length) return null;
  const showRequired = required && selected === null;
  return (
    <div className={`pt-3 sm:pt-4 border-t transition-colors duration-200
                     ${showRequired ? 'border-red-200' : 'border-gray-100'}`}>
      <p className={`text-[11px] font-[700] uppercase tracking-widest mb-2 sm:mb-2.5
                     flex items-center gap-1.5 flex-wrap
                     ${showRequired ? 'text-red-500' : 'text-gray-400'}`}>
        {label}
        {selected !== null && (
          <span className="text-gray-700 normal-case tracking-normal font-[600]">
            : {options[selected]}
          </span>
        )}
        {showRequired && (
          <span className="text-[10px] text-red-500 font-[600] ml-1 normal-case tracking-normal">← required</span>
        )}
        {savedIndex !== null && savedIndex !== undefined && selected === savedIndex && (
          <span className="text-[10px] text-emerald-600 font-[600] ml-1">✓ saved</span>
        )}
      </p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {options.map((opt, i) => (
          <button key={i} onClick={() => onSelect(i === selected ? null : i)}
            className={`min-w-[40px] sm:min-w-[44px] h-[30px] sm:h-[34px]
                        px-2.5 sm:px-3.5 rounded-lg text-[11px] sm:text-[12px]
                        font-[600] border-2 transition-all duration-150 relative
                        ${selected === i
                          ? 'bg-[#f51111] text-white border-[#f51111] shadow-sm scale-[1.04]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#f51111] hover:text-[#f51111]'}`}>
            {opt}
            {savedIndex === i && selected !== i && (
              <span className="absolute -top-1 -right-1 w-[8px] h-[8px] rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const ProductDetailsComponent = ({ product }) => {
  const context = useContext(Mycontext);
  const history = useNavigate();

  const [sizeIndex,   setSizeIndex]   = useState(null);
  const [ramIndex,    setRamIndex]    = useState(null);
  const [weightIndex, setWeightIndex] = useState(null);
  const [colorIndex,  setColorIndex]  = useState(null);
  const [qty,         setQty]         = useState(1);
  const [cartState,   setCartState]   = useState('idle');
  const [wishState,   setWishState]   = useState('idle');

  const name         = product?.name          || 'Product Name';
  const brand        = product?.brand         || '';
  const price        = product?.price         ?? 0;
  const oldPrice     = product?.oldPrice      ?? 0;
  const rating       = Number(product?.rating ?? 0);
  const numReviews   = product?.numReviews    ?? 0;
  const countInStock = product?.countInStock  ?? 0;
  const description  = product?.description   || '';
  const sizes        = useMemo(() => product?.size          || [], [product?.size]);
  const colors       = useMemo(() => product?.productColor  || [], [product?.productColor]);
  const rams         = useMemo(() => product?.productRam    || [], [product?.productRam]);
  const weights      = useMemo(() => product?.productWeight || [], [product?.productWeight]);
  const discount     = product?.discount ?? (oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0);
  const inStock      = countInStock > 0;

  const cartEntry   = (context?.cartItems || []).find(
    item => String(item.productId?._id || item.productId) === String(product?._id)
  );
  const isInCart    = !!cartEntry;
  const cartEntryId = cartEntry?._id || null;

  const initialized = useRef(false);
  useEffect(() => {
    if (!cartEntry || initialized.current) return;
    initialized.current = true;
    if (cartEntry.size) {
      const idx = sizes.indexOf(cartEntry.size);
      if (idx !== -1) setSizeIndex(idx);
    }
    if (cartEntry.productRam) {
      const idx = rams.indexOf(cartEntry.productRam);
      if (idx !== -1) setRamIndex(idx);
    }
    if (cartEntry.productWeight) {
      const idx = weights.indexOf(cartEntry.productWeight);
      if (idx !== -1) setWeightIndex(idx);
    }
    if (cartEntry.productColor) {
      const savedColorId = cartEntry.productColor?._id || cartEntry.productColor;
      const idx = colors.findIndex(c => String(c._id || c) === String(savedColorId));
      if (idx !== -1) setColorIndex(idx);
    }
  }, [cartEntry, sizes, rams, weights, colors]);

  useEffect(() => { initialized.current = false; }, [product?._id]);

  const savedSize    = cartEntry?.size          || null;
  const savedRam     = cartEntry?.productRam    || null;
  const savedWeight  = cartEntry?.productWeight || null;
  const savedColorId = cartEntry?.productColor?._id || cartEntry?.productColor || null;

  const currentSize    = sizeIndex   !== null ? sizes[sizeIndex]    : null;
  const currentRam     = ramIndex    !== null ? rams[ramIndex]       : null;
  const currentWeight  = weightIndex !== null ? weights[weightIndex] : null;
  const currentColorId = colorIndex  !== null ? (colors[colorIndex]?._id || null) : null;

  const variantsDirty = isInCart && (
    currentSize    !== savedSize   ||
    currentRam     !== savedRam    ||
    currentWeight  !== savedWeight ||
    String(currentColorId || '') !== String(savedColorId || '')
  );

  const savedSizeIndex   = sizes.indexOf(savedSize);
  const savedRamIndex    = rams.indexOf(savedRam);
  const savedWeightIndex = weights.indexOf(savedWeight);
  const savedColorIndex  = colors.findIndex(c => String(c._id || c) === String(savedColorId));

  const myListEntry  = (context?.myListItems || []).find(
    item => String(item.productId?._id || item.productId) === String(product?._id)
  );
  const isWishlisted = !!myListEntry;
  const myListItemId = myListEntry?._id || null;

  const missingVariant = (() => {
    if (!isInCart) {
      if (sizes.length   > 0 && currentSize    === null) return 'Size';
      if (rams.length    > 0 && currentRam     === null) return 'RAM';
      if (weights.length > 0 && currentWeight  === null) return 'Weight';
      if (colors.length  > 0 && currentColorId === null) return 'Color';
    }
    return null;
  })();

  const handleAddToCart = async () => {
    if (!inStock || cartState === 'loading') return;
    if (!context?.isLogin) { context?.openAlertBox?.('error', 'Please log in to add items to cart'); return; }
    if (missingVariant) { context?.openAlertBox?.('error', `Please select a ${missingVariant} before adding to cart`); return; }
    setCartState('loading');
    try {
      const res = await postData('/api/cart/create', {
        productId: product?._id, quantity: qty,
        size: currentSize, productRam: currentRam,
        productWeight: currentWeight, productColor: currentColorId,
      });
      if (res?.data?.error) throw new Error(res.data.message);
      await context?.fetchCartItems?.();
      initialized.current = false;
      setCartState('idle');
    } catch (err) {
      context?.openAlertBox?.('error', err?.message || 'Could not add to cart');
      setCartState('error');
      setTimeout(() => setCartState('idle'), 2500);
    }
  };

  const handleUpdateCart = async () => {
    if (!cartEntryId || cartState === 'updating') return;
    setCartState('updating');
    try {
      await putData('/api/cart/update-variants', {
        _id: cartEntryId, size: currentSize, productRam: currentRam,
        productWeight: currentWeight, productColor: currentColorId,
      });
      await context?.fetchCartItems?.();
      initialized.current = false;
      context?.openAlertBox?.('success', 'Cart updated!');
      setCartState('idle');
    } catch (err) {
      context?.openAlertBox?.('error', err?.message || 'Could not update cart');
      setCartState('error');
      setTimeout(() => setCartState('idle'), 2500);
    }
  };

  const handleGoToCart = () => { context?.setOpenProductModal?.(false); history('/cart'); };

  const handleWishlist = async () => {
    if (wishState === 'loading') return;
    if (!context?.isLogin) { context?.openAlertBox?.('error', 'Please log in to save items'); return; }
    setWishState('loading');
    try {
      if (isWishlisted && myListItemId) { await deleteData(`/api/mylist/${myListItemId}`); }
      else { await postData('/api/mylist/create', { productId: product?._id }); }
      await context?.reloadWishlist?.();
    } catch { context?.openAlertBox?.('error', 'Something went wrong. Please try again.'); }
    finally { setWishState('idle'); }
  };

  const cartLabel = !isInCart
    ? (cartState === 'loading' ? 'Adding…' : cartState === 'error' ? 'Try Again' : missingVariant ? `Select ${missingVariant}` : 'Add to Cart')
    : variantsDirty
      ? (cartState === 'updating' ? 'Updating…' : 'Update Cart')
      : 'Go to Cart';

  const cartBg = !isInCart
    ? (cartState === 'loading' ? 'bg-[#f51111] opacity-75 cursor-wait'
      : cartState === 'error' ? 'bg-orange-500'
      : missingVariant ? 'bg-gray-300 cursor-not-allowed text-gray-500'
      : inStock ? 'bg-[#f51111] hover:bg-[#e03f3f] active:scale-95 shadow-md hover:shadow-lg'
      : 'bg-gray-200 cursor-not-allowed text-gray-400')
    : variantsDirty
      ? (cartState === 'updating' ? 'bg-amber-400 opacity-75 cursor-wait' : 'bg-amber-400 hover:bg-amber-500 active:scale-95 shadow-md')
      : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-md';

  const cartIcon = variantsDirty ? <MdEdit size={16} /> : isInCart ? <MdCheckCircle size={16} /> : <MdOutlineShoppingCart size={16} />;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 font-sans">

      {/* Brand */}
      {brand && (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-[700] uppercase tracking-widest text-gray-400">{brand}</span>
          <MdVerified className="text-blue-500 text-[13px]" />
        </div>
      )}

      {/* Title */}
      <h1 className="text-[18px] sm:text-[22px] font-[800] text-gray-900 leading-snug line-clamp-3 -mt-1">
        {name}
      </h1>

      {/* Rating + Stock */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Rating value={rating} precision={0.5} size="small" readOnly sx={{ fontSize: { xs: '14px', sm: '16px' } }} />
        <span className="text-[12px] sm:text-[13px] text-gray-400">
          {rating.toFixed(1)} · {numReviews} review{numReviews !== 1 ? 's' : ''}
        </span>
        <span className={`text-[10px] sm:text-[11px] font-[700] px-2 py-[2px] rounded-full
          ${inStock ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
          {inStock ? `✓ In Stock (${countInStock})` : '✗ Out of Stock'}
        </span>
        {isInCart && (
          <span className="text-[10px] sm:text-[11px] font-[700] px-2 py-[2px] rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            🛒 In Your Cart
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
        <span className="text-[24px] sm:text-[30px] font-[800] text-[#f51111] leading-none">
          ${Number(price).toFixed(2)}
        </span>
        {oldPrice > price && (<>
          <span className="text-[14px] sm:text-[16px] line-through text-gray-400">
            ${Number(oldPrice).toFixed(2)}
          </span>
          <span className="text-[10px] sm:text-[11px] font-[800] bg-[#f51111] text-white px-2 py-[2px] rounded-full tracking-wide">
            {discount}% OFF
          </span>
        </>)}
      </div>

      {/* Description */}
      {description && (
        <p className="text-[12px] sm:text-[13px] text-gray-500 leading-relaxed line-clamp-4
                      border-t border-gray-100 pt-3 whitespace-pre-line">
          {description}
        </p>
      )}

      {/* Variant dirty notice */}
      {variantsDirty && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200
                        rounded-xl text-[11px] sm:text-[12px] text-amber-700 font-[600]">
          <MdEdit size={13} />
          Variant changed — click "Update Cart" to save
        </div>
      )}

      {/* Color selector */}
      {colors.length > 0 && (
        <div className="pt-3 sm:pt-4 border-t border-gray-100">
          {(() => {
            const showColorRequired = !isInCart && colors.length > 0 && colorIndex === null;
            return (
              <p className={`text-[11px] font-[700] uppercase tracking-widest mb-2 sm:mb-2.5
                             flex items-center gap-1.5 flex-wrap
                             ${showColorRequired ? 'text-red-500' : 'text-gray-400'}`}>
                Color
                {showColorRequired && <span className="text-[10px] text-red-500 font-[600] ml-1 normal-case">← required</span>}
                {colorIndex !== null && (
                  <span className="text-gray-700 normal-case tracking-normal font-[600]">: {colors[colorIndex]?.name}</span>
                )}
                {savedColorIndex !== -1 && colorIndex === savedColorIndex && (
                  <span className="text-[10px] text-emerald-600 font-[600] ml-1">✓ saved</span>
                )}
              </p>
            );
          })()}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {colors.map((c, i) => (
              <button key={c._id || i} onClick={() => setColorIndex(i === colorIndex ? null : i)}
                title={c.name} aria-label={`Color: ${c.name}`}
                className={`relative w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full transition-all duration-150
                  ${colorIndex === i ? 'ring-2 ring-offset-2 ring-[#f51111] scale-110' : 'hover:scale-105'}
                  ${c.color === '#ffffff' ? 'ring-1 ring-gray-200' : ''}`}
                style={{ backgroundColor: c.color || '#ccc' }}>
                {colorIndex === i && (
                  <MdCheckCircle className="absolute inset-0 m-auto text-white drop-shadow" size={13} />
                )}
                {savedColorIndex === i && colorIndex !== i && (
                  <span className="absolute -top-1 -right-1 w-[7px] h-[7px] rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pill selectors */}
      <PillSelector label="Size"   options={sizes}   selected={sizeIndex}   onSelect={setSizeIndex}   savedIndex={savedSizeIndex   >= 0 ? savedSizeIndex   : null} required={!isInCart && sizes.length   > 0} />
      <PillSelector label="RAM"    options={rams}    selected={ramIndex}    onSelect={setRamIndex}    savedIndex={savedRamIndex    >= 0 ? savedRamIndex    : null} required={!isInCart && rams.length    > 0} />
      <PillSelector label="Weight" options={weights} selected={weightIndex} onSelect={setWeightIndex} savedIndex={savedWeightIndex >= 0 ? savedWeightIndex : null} required={!isInCart && weights.length > 0} />

      {/* Qty + CTA */}
      <div className="border-t border-gray-100 pt-3 sm:pt-4 flex items-center gap-2 sm:gap-3 flex-wrap">

        {/* Qty stepper */}
        {!isInCart && (
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
              className="w-[32px] sm:w-[38px] h-[38px] sm:h-[42px] flex items-center justify-center
                         text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <FaMinus size={9} />
            </button>
            <span className="w-[36px] sm:w-[42px] text-center text-[14px] sm:text-[15px] font-[700] text-gray-800 select-none">
              {qty}
            </span>
            <button onClick={() => setQty(q => Math.min(countInStock, q + 1))}
              disabled={!inStock || qty >= countInStock}
              className="w-[32px] sm:w-[38px] h-[38px] sm:h-[42px] flex items-center justify-center
                         text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <FaPlus size={9} />
            </button>
          </div>
        )}

        {/* Main cart button */}
        <button
          onClick={!isInCart ? handleAddToCart : variantsDirty ? handleUpdateCart : handleGoToCart}
          disabled={(!inStock && !isInCart) || !!missingVariant || cartState === 'loading' || cartState === 'updating'}
          className={`flex items-center gap-2 px-4 sm:px-5 py-[9px] sm:py-[11px]
                      rounded-xl text-[12px] sm:text-[13px] font-[700] text-white
                      transition-all duration-200 ${cartBg}`}
        >
          {cartIcon}
          {cartLabel}
        </button>

        {/* Go to Cart secondary when variants dirty */}
        {isInCart && variantsDirty && (
          <button onClick={handleGoToCart}
            className="flex items-center gap-2 px-3 sm:px-4 py-[9px] sm:py-[11px]
                       rounded-xl text-[12px] sm:text-[13px] font-[700]
                       border-2 border-emerald-400 text-emerald-600
                       hover:bg-emerald-50 transition-all duration-200">
            <MdCheckCircle size={15} />
            Go to Cart
          </button>
        )}

        {/* Wishlist */}
        <button onClick={handleWishlist} disabled={wishState === 'loading'}
          className={`flex items-center gap-2 px-4 sm:px-5 py-[9px] sm:py-[11px]
                      rounded-xl text-[12px] sm:text-[13px] font-[700] border-2
                      transition-all duration-200
                      ${isWishlisted ? 'bg-[#f51111] text-white border-[#f51111]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#f51111] hover:text-[#f51111]'}
                      ${wishState === 'loading' ? 'opacity-60 cursor-wait' : ''}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
          {isWishlisted ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
          {wishState === 'loading' ? '…' : isWishlisted ? 'Wishlisted' : 'Wishlist'}
        </button>
      </div>

      {/* Trust badges */}
      <div className="flex items-center gap-3 sm:gap-5 pt-3 border-t border-gray-100 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-gray-500">
          <MdLocalShipping className="text-emerald-500 text-[15px] sm:text-[17px]" /> Free Shipping (2–3 Days)
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-gray-500">
          <IoShieldCheckmarkOutline className="text-blue-500 text-[15px] sm:text-[17px]" /> Secure Payment
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsComponent;