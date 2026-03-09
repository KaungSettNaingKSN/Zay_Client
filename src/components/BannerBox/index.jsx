import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mycontext } from '../../App'

const THEMES = [
  { bg: 'linear-gradient(135deg,#fff5f5,#ffe8e8)', accent: '#f51111', tag: '#f5111118', sub: '#f87171' },
  { bg: 'linear-gradient(135deg,#f0f9ff,#dbeafe)', accent: '#3b82f6', tag: '#3b82f618', sub: '#60a5fa' },
  { bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', accent: '#16a34a', tag: '#16a34a18', sub: '#4ade80' },
  { bg: 'linear-gradient(135deg,#fdf4ff,#f3e8ff)', accent: '#9333ea', tag: '#9333ea18', sub: '#c084fc' },
  { bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', accent: '#d97706', tag: '#d9770618', sub: '#fbbf24' },
  { bg: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)', accent: '#0d9488', tag: '#0d948818', sub: '#2dd4bf' },
];

const BannerBox = ({ into = 'left', fixedItem = null, themeIndex }) => {
  const context = useContext(Mycontext);
  const [item, setItem] = useState(() => fixedItem || null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (fixedItem) {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

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
    requestAnimationFrame(() => {
      setItem(all[Math.floor(Math.random() * all.length)]);
      setVisible(true);
    });
  }, [fixedItem, context.categories]);

  if (!item) return (
    <div className="w-full rounded-2xl h-[210px] bg-gray-100 animate-pulse" />
  );

  const isLeft  = into === 'left';
  const t = THEMES[(themeIndex ?? Math.abs(item._id?.charCodeAt(0) ?? 0)) % THEMES.length];

  return (
    <div
      className="bannerBox w-full rounded-2xl overflow-hidden h-[210px] group relative"
      style={{
        background: t.bg,
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div
        className="absolute rounded-full blur-3xl opacity-25
                   group-hover:opacity-40 transition-opacity duration-700"
        style={{
          width: 180, height: 180,
          background: t.accent,
          top: -50,
          right: isLeft ? -50 : 'auto',
          left:  isLeft ? 'auto' : -50,
        }}
      />
      <div
        className="absolute rounded-full blur-2xl opacity-10"
        style={{
          width: 80, height: 80,
          background: t.accent,
          bottom: -20,
          left:  isLeft ? -10 : 'auto',
          right: isLeft ? 'auto' : -10,
        }}
      />

      {/* Category image */}
      {item.displayImage ? (
        <div
          className={`absolute top-0 bottom-0 w-[52%] flex items-center justify-center p-3
                      ${isLeft ? 'right-0' : 'left-0'}`}
        >
          {/* Soft image glow */}
          <div
            className="absolute inset-4 rounded-full blur-2xl opacity-20"
            style={{ background: t.accent }}
          />
          <img
            src={item.displayImage}
            alt={item.parentName}
            className="relative z-10 w-full h-full object-contain drop-shadow-xl
                       transition-all duration-700
                       group-hover:scale-110 group-hover:-rotate-3"
          />
        </div>
      ) : (
        <div
          className={`absolute top-0 bottom-0 w-[52%] flex items-center justify-center
                      ${isLeft ? 'right-0' : 'left-0'}`}
        >
          <span
            className="text-[96px] font-[900] leading-none select-none inline-block
                       transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6"
            style={{ color: t.accent, opacity: 0.12 }}
          >
            {item.name?.[0]?.toUpperCase()}
          </span>
        </div>
      )}

      {/* Vertical divider */}
      <div
        className="absolute top-5 bottom-5 w-px opacity-[0.08]"
        style={{
          background: '#000',
          left:  isLeft ? '50%' : 'auto',
          right: isLeft ? 'auto' : '50%',
        }}
      />
      <div
        className={`absolute top-0 bottom-0 w-[52%] flex flex-col justify-center
                    gap-[6px] px-5 z-10
                    ${isLeft ? 'left-0 items-start' : 'right-0 items-end text-right'}`}
      >
        <span
          className="text-[11px] font-[900] tabular-nums leading-none"
          style={{ color: t.accent, opacity: 0.45 }}
        >
          ✦
        </span>
        <span
          className="text-[9px] font-[800] uppercase tracking-[0.16em]
                     px-2 py-[3px] rounded-sm w-fit"
          style={{ background: t.tag, color: t.accent }}
        >
          {item.parentName || 'Category'}
        </span>
        <span
          className="text-[10px] font-[500] -!mt[2px]"
          style={{ color: t.sub }}
        >
          {item.subName}
        </span>
        <h2
          className="font-[800] text-[16px] text-gray-900 leading-tight line-clamp-2"
          style={{ maxWidth: 135 }}
        >
          {item.name}
        </h2>
        <Link
          to={`/productListing?catId=${item.parentCatId}&catName=${encodeURIComponent(item.parentName)}&subCatId=${item.subCatId}&subCat=${encodeURIComponent(item.subName)}&thirdSubCatId=${item._id}&thirdSubCat=${encodeURIComponent(item.name)}`}
          className="!mt1 inline-flex items-center gap-[6px] text-[11px] font-[700]
                     px-3 py-[6px] rounded-full w-fit border
                     transition-all duration-300 hover:gap-[10px]"
          style={{
            borderColor: t.accent + '55',
            color:       t.accent,
            background:  t.tag,
          }}
        >
          Shop Now
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:translate-x-[3px]"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
      <div
        className="absolute bottom-0 left-0 h-[3px] rounded-b-2xl w-0
                   group-hover:w-full transition-all duration-500"
        style={{ background: `linear-gradient(to right, ${t.accent}cc, ${t.accent}22)` }}
      />
      <style>{`
        .bannerBox { transform 0.3s ease; }
        .bannerBox:hover { transform: translateY(-3px);}
      `}</style>
    </div>
  );
};

export default BannerBox;