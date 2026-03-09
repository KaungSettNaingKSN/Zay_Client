import React, { useState, useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import ProductZoom from '../../components/ProductZoom';
import ProductsSlider from '../../components/ProductsSlider';
import ProductDetailsComponent from '../../components/ProductDeatils';
import { deleteData, fetchData, postData, putData } from '../../utils/api';
import Skeleton from '@mui/material/Skeleton';
import { Mycontext } from '../../App';

const ProductDetails = () => {
  const { id }       = useParams();
  const location     = useLocation();
  const context      = useContext(Mycontext);

  const [activeTab,       setActiveTab]       = useState(0);
  const [product,         setProduct]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [reviews,         setReviews]         = useState([]);
  const [reviewsLoading,  setReviewsLoading]  = useState(false);
  const [reviewText,      setReviewText]      = useState('');
  const [reviewRating,    setReviewRating]    = useState(5);
  const [submitting,      setSubmitting]      = useState(false);
  const [myReviewId,      setMyReviewId]      = useState(null);

  // ── Load product ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const stateProduct = location.state?.product;
      if (stateProduct?._id === id) { setProduct(stateProduct); setLoading(false); }
      try {
        if (!stateProduct || stateProduct._id !== id) setLoading(true);
        const res = await fetchData(`/api/product/${id}`);
        if (!cancelled) setProduct(res.data?.product || null);
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    setActiveTab(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { cancelled = true; };
  }, [id, location.state]);

  // ── Load reviews ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (activeTab !== 1 || !id) return;
    let cancelled = false;
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const res  = await fetchData(`/api/review/${id}`);
        if (cancelled) return;
        const data = res.data?.data || [];
        setReviews(data);
        const mine = data.find(r => r.userId?.toString() === context.userData?._id?.toString());
        if (mine) { setMyReviewId(mine._id); setReviewRating(Number(mine.rating)); setReviewText(mine.review || ''); }
        else       { setMyReviewId(null); setReviewRating(5); setReviewText(''); }
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setReviewsLoading(false); }
    };
    loadReviews();
    return () => { cancelled = true; };
  }, [activeTab, id, context.userData?._id]);

  const reloadReviews = async () => {
    try {
      const res  = await fetchData(`/api/review/${id}`);
      const data = res.data?.data || [];
      setReviews(data);
      const mine = data.find(r => r.userId?.toString() === context.userData?._id?.toString());
      if (mine) { setMyReviewId(mine._id); setReviewRating(Number(mine.rating)); setReviewText(mine.review || ''); }
      else       { setMyReviewId(null); setReviewRating(5); setReviewText(''); }
    } catch (e) { console.error('Failed to reload reviews', e); }
  };

  const handleReviewSubmit = async () => {
    if (!context.isLogin)         return context.openAlertBox('error', 'Please login to submit a review');
    if (!reviewText.trim())       return context.openAlertBox('error', 'Please write a review');
    setSubmitting(true);
    try {
      if (myReviewId) { await putData(`/api/review/${myReviewId}`, { rating: reviewRating, review: reviewText }); context.openAlertBox('success', 'Review updated'); }
      else            { await postData('/api/review/add', { productId: id, rating: reviewRating, review: reviewText }); context.openAlertBox('success', 'Review submitted!'); }
      await reloadReviews();
    } catch (e) { context.openAlertBox('error', e.message || 'Failed to submit review'); }
    finally     { setSubmitting(false); }
  };

  const handleDeleteReview = async () => {
    if (!myReviewId) return;
    setSubmitting(true);
    try { await deleteData(`/api/review/${myReviewId}`, {}); context.openAlertBox('success', 'Review deleted'); await reloadReviews(); }
    catch (e) { context.openAlertBox('error', e.message || 'Failed to delete review'); }
    finally   { setSubmitting(false); }
  };

  const safeReviews = reviews.filter(r => r && r._id);
  const ratingDist  = [5, 4, 3, 2, 1].map(star => {
    const count = safeReviews.filter(r => Number(r.rating) === star).length;
    return { star, count, pct: safeReviews.length ? Math.round((count / safeReviews.length) * 100) : 0 };
  });
  const avgRating = safeReviews.length
    ? (safeReviews.reduce((s, r) => s + Number(r.rating), 0) / safeReviews.length).toFixed(1)
    : 0;
  const sortedReviews = [...safeReviews].sort((a, b) => {
    const aMine = a._id?.toString() === myReviewId?.toString();
    const bMine = b._id?.toString() === myReviewId?.toString();
    if (aMine === bMine) return 0;
    return aMine ? -1 : 1;
  });

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="bg-gray-50 border-b border-gray-200 py-2 sm:py-3">
        <div className="container px-3 sm:px-4">
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: { xs: '11px', sm: '13px' } }}>
            <Link to="/" className="text-gray-500 hover:text-[#f51111] transition-colors">Home</Link>
            {product?.catName && (
              <Link to={`/productListing?catId=${encodeURIComponent(product.catId)}&catName=${encodeURIComponent(product.catName)}`}
                className="text-gray-500 hover:text-[#f51111] transition-colors">
                {product.catName}
              </Link>
            )}
            {product?.subCatName && (
              <Link to={`/productListing?catId=${encodeURIComponent(product.catId)}&catName=${encodeURIComponent(product.catName)}&subCatId=${encodeURIComponent(product.subCatId)}&subCat=${encodeURIComponent(product.subCatName)}`}
                className="text-gray-500 hover:text-[#f51111] transition-colors">
                {product.subCatName}
              </Link>
            )}
            <span className="text-gray-800 font-[500] line-clamp-1 max-w-[140px] sm:max-w-[200px]">
              {product?.name || '...'}
            </span>
          </Breadcrumbs>
        </div>
      </div>

      <section className="py-4 sm:py-8">
        <div className="container px-3 sm:px-4">

          {/* ── Product hero — stacks on mobile ── */}
          {loading ? (
            /* Loading skeleton */
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="w-full sm:w-[42%]">
                <Skeleton variant="rectangular" height={280} width="100%"
                  sx={{ borderRadius: '16px' }} className="sm:hidden" />
                <div className="hidden sm:flex gap-3">
                  <div className="flex flex-col gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} variant="rectangular" width={72} height={72} sx={{ borderRadius: '10px' }} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <Skeleton variant="rectangular" height={420} width="100%" sx={{ borderRadius: '16px' }} />
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-[58%] flex flex-col gap-3">
                <Skeleton width="30%" height={16} />
                <Skeleton width="90%" height={28} />
                <Skeleton width="60%" height={28} />
                <Skeleton width="40%" height={36} />
                <Skeleton width="100%" height={80} />
                <Skeleton width="70%" height={40} />
              </div>
            </div>
          ) : (
            /*
              Mobile:  stack vertically (zoom on top, details below)
              Desktop: side by side (42% / 58%)
            */
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              <div className="w-full sm:w-[42%] sm:sticky sm:top-4">
                <ProductZoom images={product?.images || []} />
              </div>
              <div className="w-full sm:w-[58%]">
                <ProductDetailsComponent product={product} />
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="container px-3 sm:px-4 mt-6 sm:mt-8">

          {/* Tab buttons */}
          <div className="flex items-center gap-0 border-b-2 border-gray-200 overflow-x-auto">
            {['Description', `Reviews (${reviews.length || product?.numReviews || 0})`].map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className={`relative px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px]
                            font-[600] transition-colors duration-200 whitespace-nowrap flex-shrink-0
                            ${activeTab === i ? 'text-[#f51111]' : 'text-gray-500 hover:text-gray-800'}`}>
                {tab}
                {activeTab === i && (
                  <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#f51111] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Description Tab ── */}
          {activeTab === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mt-4">
              {product?.description ? (
                <div className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              ) : (
                <p className="text-gray-400 text-[13px]">No description available.</p>
              )}

              {(product?.productRam?.length > 0 || product?.productWeight?.length > 0 ||
                product?.size?.length > 0 || product?.brand) && (
                <div className="pt-4 sm:pt-6 border-t border-gray-100 mt-4 sm:mt-6">
                  <h3 className="text-[14px] sm:text-[15px] font-[700] text-gray-800 mb-3">
                    Specifications
                  </h3>
                  {/* Responsive table — scrolls on mobile */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px] sm:text-[13px] min-w-[280px]">
                      <tbody>
                        {[
                          product?.brand          && ['Brand',        product.brand],
                          product?.catName        && ['Category',     product.catName],
                          product?.subCatName     && ['Sub Category', product.subCatName],
                          product?.productRam?.length > 0    && ['RAM Options', product.productRam.join(' / ')],
                          product?.productWeight?.length > 0 && ['Weight',      product.productWeight.join(' / ')],
                          product?.size?.length > 0          && ['Sizes',       product.size.join(' / ')],
                          product?.countInStock !== undefined && ['In Stock',    `${product.countInStock} units`],
                        ].filter(Boolean).map(([label, value]) => (
                          <tr key={label} className="border-b border-gray-50">
                            <td className="py-2 pr-4 sm:pr-6 font-[600] text-gray-500 w-[120px] sm:w-[160px] align-top">
                              {label}
                            </td>
                            <td className="py-2 text-gray-800">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Reviews Tab ── */}
          {activeTab === 1 && (
            /*
              Mobile:  stack — review form on top, list below
              Desktop: list left (flex-1) | form right (320px fixed)
            */
            <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-6 items-start mt-4">

              {/* Review list + summary */}
              <div className="flex-1 w-full">

                {/* Rating summary */}
                {reviews.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex gap-4 sm:gap-6 mb-4">
                    <div className="flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px]">
                      <span className="text-[36px] sm:text-[44px] font-[900] text-gray-900 leading-none">
                        {avgRating}
                      </span>
                      <Rating value={Number(avgRating)} precision={0.1} size="small" readOnly />
                      <span className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                        {reviews.length} reviews
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-[5px] sm:gap-[6px] justify-center">
                      {ratingDist.map(({ star, count, pct }) => (
                        <div key={star} className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-[10px] sm:text-[11px] text-gray-500 w-3">{star}</span>
                          <div className="flex-1 h-[5px] sm:h-[6px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#f51111] rounded-full transition-all duration-500"
                                 style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-gray-400 w-5">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-[14px] sm:text-[15px] font-[700] text-gray-800 mb-3 flex items-center gap-2">
                  Customer Reviews
                  {reviewsLoading && <CircularProgress size={13} sx={{ color: '#f51111' }} />}
                </h3>

                {reviewsLoading ? (
                  <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton variant="circular" width={44} height={44} />
                        <div className="flex-1">
                          <Skeleton width="40%" height={14} />
                          <Skeleton width="100%" height={48} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : safeReviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
                    <p className="text-gray-400 text-[13px] sm:text-[14px]">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:gap-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1">
                    {sortedReviews.map(review => {
                      const isMine = review._id?.toString() === myReviewId?.toString();
                      return (
                        <div key={review._id}
                          className={`bg-white rounded-2xl border shadow-sm p-3 sm:p-4 flex gap-3 sm:gap-4
                            ${isMine ? 'border-[#f5111130]' : 'border-gray-100'}`}>
                          {review.userAvatar ? (
                            <img src={review.userAvatar} alt={review.userName}
                              className="w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full object-cover flex-shrink-0 border-2 border-gray-100" />
                          ) : (
                            <div className="w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full bg-[#f5111120]
                                            flex items-center justify-center flex-shrink-0
                                            text-[#f51111] font-[800] text-[15px] sm:text-[16px]">
                              {review.userName?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <h4 className="text-[12px] sm:text-[13px] font-[700] text-gray-900">
                                  {review.userName}
                                  {isMine && <span className="ml-2 text-[10px] text-[#f51111] font-[600]">(You)</span>}
                                </h4>
                                <p className="text-[10px] sm:text-[11px] text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                              <Rating value={Number(review.rating)} size="small" readOnly
                                      sx={{ fontSize: { xs: '12px', sm: '14px' } }} />
                            </div>
                            <p className="text-[12px] sm:text-[13px] text-gray-600 leading-relaxed mt-1">
                              {review.review}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Write review form — full width on mobile, 300px on desktop */}
              <div className="w-full sm:w-[300px] md:w-[320px] flex-shrink-0
                              bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h3 className="text-[14px] sm:text-[15px] font-[700] text-gray-800 mb-1">
                  {myReviewId ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                <p className="text-[11px] sm:text-[12px] text-gray-400 mb-3">
                  {context.isLogin ? 'Share your experience' : 'Login to leave a review'}
                </p>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <div>
                    <p className="text-[11px] sm:text-[12px] font-[600] text-gray-500 mb-1">Your Rating</p>
                    <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)}
                            size="medium" disabled={!context.isLogin} />
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-[12px] font-[600] text-gray-500 mb-1">Your Review</p>
                    <TextField
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      disabled={!context.isLogin || submitting}
                      multiline rows={3}
                      placeholder={context.isLogin ? 'Tell others what you think...' : 'Login to write a review'}
                      fullWidth size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontSize: '13px',
                          '&.Mui-focused fieldset': { borderColor: '#f51111' },
                        },
                      }}
                    />
                  </div>

                  <button onClick={handleReviewSubmit} disabled={!context.isLogin || submitting}
                    className="w-full py-[9px] sm:py-[10px] rounded-xl bg-[#f51111] text-white
                               text-[12px] sm:text-[13px] font-[700] hover:bg-[#e04040]
                               active:scale-95 disabled:opacity-50 transition-all duration-200
                               shadow-md flex items-center justify-center gap-2">
                    {submitting
                      ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                      : myReviewId ? 'Update Review' : 'Submit Review'}
                  </button>

                  {myReviewId && (
                    <button onClick={handleDeleteReview} disabled={submitting}
                      className="w-full py-[7px] sm:py-[8px] rounded-xl border border-red-200
                                 text-red-400 text-[11px] sm:text-[12px] font-[600]
                                 hover:bg-red-50 disabled:opacity-50 transition-all duration-200">
                      Delete my review
                    </button>
                  )}

                  {!context.isLogin && (
                    <Link to="/login"
                      className="text-center text-[12px] text-[#f51111] font-[600] hover:underline">
                      Login to leave a review →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        <div className="container px-3 sm:px-4 mt-6 sm:mt-8">
          <div className="mb-2">
            <h2 className="text-[16px] sm:text-[18px] font-[700] text-gray-900">Related Products</h2>
            <p className="text-[12px] sm:text-[13px] text-gray-500">You might also like these</p>
          </div>
          <ProductsSlider
            items={6}
            catName={product?.catName || ''}
            catId={product?.catId || ''}
            excludeId={product?._id || ''}
          />
        </div>
      </section>
    </>
  );
};

export default ProductDetails;