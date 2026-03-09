import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IoSearch, IoCloseCircle } from 'react-icons/io5'
import { BiCategory } from 'react-icons/bi'
import { MdOutlineLabel, MdOutlineTrendingUp } from 'react-icons/md'
import { RiPriceTag3Line } from 'react-icons/ri'
import { HiOutlineSearch } from 'react-icons/hi'
import { BsClockHistory } from 'react-icons/bs'
import { RxCross2 } from 'react-icons/rx'
import { fetchData, deleteData } from '../../utils/api'
import { Mycontext } from '../../App'

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  history:     { icon: BsClockHistory,     pill: 'bg-gray-100   text-gray-500',   label: 'Recent'   },
  trending:    { icon: MdOutlineTrendingUp, pill: 'bg-orange-100 text-orange-500', label: 'Trending' },
  keyword:     { icon: MdOutlineTrendingUp, pill: 'bg-red-100    text-[#f51111]',  label: 'Popular'  },
  category:    { icon: BiCategory,          pill: 'bg-purple-100 text-purple-600', label: 'Category' },
  brand:       { icon: MdOutlineLabel,      pill: 'bg-blue-100   text-blue-600',   label: 'Brand'    },
  subcategory: { icon: RiPriceTag3Line,     pill: 'bg-teal-100   text-teal-600',   label: 'Sub-cat'  },
  product:     { icon: HiOutlineSearch,     pill: 'bg-gray-100   text-gray-500',   label: 'Product'  },
}

const Highlighted = ({ text, query }) => {
  if (!query?.trim()) return <span className='text-gray-700'>{text}</span>
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase())
  if (idx === -1) return <span className='text-gray-500'>{text}</span>
  return (
    <>
      <span className='text-gray-400'>{text.slice(0, idx)}</span>
      <span className='font-[700] text-gray-900'>{text.slice(idx, idx + query.trim().length)}</span>
      <span className='text-gray-400'>{text.slice(idx + query.trim().length)}</span>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const Search = () => {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const context        = React.useContext(Mycontext)
  const isLogin        = context?.isLogin

  const [query,       setQuery]       = React.useState(searchParams.get('q') || '')
  const [focused,     setFocused]     = React.useState(false)
  const [suggestions, setSuggestions] = React.useState([])
  const [history,     setHistory]     = React.useState([])    // user's personal history
  const [trending,    setTrending]    = React.useState([])    // global trending
  const [showDrop,    setShowDrop]    = React.useState(false)
  const [activeIdx,   setActiveIdx]   = React.useState(-1)
  const [loading,     setLoading]     = React.useState(false)

  const debounceRef   = React.useRef(null)
  const containerRef  = React.useRef(null)
  const trendLoaded   = React.useRef(false)
  const historyLoaded = React.useRef(false)

  // Sync with URL on back/forward
  React.useEffect(() => {
    setQuery(searchParams.get('q') || '')
    setShowDrop(false)
  }, [searchParams])

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Fetch user history (once per session, re-fetches on login change) ─────
  const loadHistory = React.useCallback(async () => {
    if (!isLogin) { setHistory([]); historyLoaded.current = false; return }
    if (historyLoaded.current) return
    historyLoaded.current = true
    try {
      const res  = await fetchData('/api/user/search-history')
      setHistory(res?.data?.data.history || [])
    } catch { /* silent */ }
  }, [isLogin])

  // ── Fetch trending once ───────────────────────────────────────────────────
  const loadTrending = React.useCallback(async () => {
    if (trendLoaded.current) return
    trendLoaded.current = true
    try {
      const res  = await fetchData('/api/product/trending')
      setTrending((res?.data?.data.keywords || []).map(k => ({
        label: k.label, type: 'trending', count: k.count,
      })))
    } catch { /* silent */ }
  }, [])

  // ── Fetch suggestions while typing ───────────────────────────────────────
  const fetchSuggestions = React.useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res  = await fetchData(`/api/product/suggestions?q=${encodeURIComponent(q.trim())}`)
      setSuggestions(res?.data?.data.suggestions || [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Navigate ──────────────────────────────────────────────────────────────
  const doSearch = (value) => {
    const trimmed = value?.trim()
    setShowDrop(false)
    setSuggestions([])
    setActiveIdx(-1)
    if (!trimmed) { navigate('/productListing'); return }
    navigate(`/productListing?q=${encodeURIComponent(trimmed)}`)
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setActiveIdx(-1)
    setShowDrop(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280)
  }

  const handleKeyDown = (e) => {
    const list = getDisplayList()
    if (showDrop && list.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, list.length - 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1));              return }
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const target = activeIdx >= 0 ? getDisplayList()[activeIdx]?.label : query
      doSearch(target || query)
    }
    if (e.key === 'Escape') { setShowDrop(false); setActiveIdx(-1) }
  }

  const handleSuggestionClick = (label) => { setQuery(label); doSearch(label) }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setActiveIdx(-1)
    setShowDrop(true)
  }

  const handleFocus = () => {
    setFocused(true)
    loadHistory()
    loadTrending()
    setShowDrop(true)
  }

  const handleBlur = () => {
    setFocused(false)
    setTimeout(() => setShowDrop(false), 160)
  }

  // ── Remove one history item ───────────────────────────────────────────────
  const removeHistoryItem = async (e, keyword) => {
    e.stopPropagation()
    setHistory(prev => prev.filter(h => h.label !== keyword))
    try {
      await deleteData(`/api/user/search-history/${encodeURIComponent(keyword)}`)
    } catch { /* silent */ }
  }

  // ── Clear all history ─────────────────────────────────────────────────────
  const clearAllHistory = async (e) => {
    e.stopPropagation()
    setHistory([])
    historyLoaded.current = false
    try {
      await deleteData('/api/user/search-history')
    } catch { /* silent */ }
  }

  // ── What to show in the dropdown ─────────────────────────────────────────
  const isTyping = query.trim().length >= 2

  const getDisplayList = () => {
    if (isTyping) return suggestions
    // Empty state: user history first, then trending
    return [...history.slice(0, 5), ...trending.slice(0, 5)]
  }

  const showHistory = !isTyping && history.length > 0
  const showTrend   = !isTyping && trending.length > 0

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className='relative w-full'>

      {/* ── Input ── */}
      <div className={`w-full h-[50px] rounded-[10px] relative flex items-center transition-all duration-200
                       ${focused || showDrop
                         ? 'bg-white border-2 border-[#f51111] shadow-md'
                         : 'bg-[#e5e5e5] border-2 border-transparent'}`}>
        <input
          type='text'
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder='Search for products, brands…'
          autoComplete='off'
          className='w-full h-full bg-transparent pl-4 pr-[76px] text-[14px]
                     text-gray-800 placeholder:text-gray-400 focus:outline-none rounded-[10px]'
        />

        {query && (
          <button onMouseDown={e => e.preventDefault()} onClick={handleClear}
            className='absolute right-12 text-gray-400 hover:text-gray-600 transition-colors'>
            <IoCloseCircle size={18} />
          </button>
        )}

        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => doSearch(query)}
          className={`absolute right-2 w-[36px] h-[36px] rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${query.trim()
                        ? 'bg-[#f51111] text-white hover:bg-[#e03f3f] shadow-sm'
                        : 'text-gray-400 hover:bg-gray-200'}`}
        >
          <IoSearch size={17} />
        </button>
      </div>

      {/* ── Dropdown ── */}
      {showDrop && (
        <div className='absolute top-[54px] left-0 w-full bg-white rounded-xl
                        border border-gray-100 shadow-2xl z-[9999] overflow-hidden'>

          {/* Loading skeleton */}
          {loading ? (
            <div className='p-3 flex flex-col gap-1'>
              {[65, 50, 75, 45].map((w, i) => (
                <div key={i} className='flex items-center gap-3 px-2 py-2'>
                  <div className='w-[14px] h-[14px] rounded bg-gray-200 animate-pulse flex-shrink-0' />
                  <div className='h-[11px] rounded bg-gray-200 animate-pulse' style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>

          ) : isTyping ? (
            /* ── Suggestions while typing ── */
            suggestions.length === 0 ? (
              <p className='text-[13px] text-gray-400 text-center py-6 px-4'>No suggestions found</p>
            ) : (
              <>
                <p className='text-[10px] font-[700] uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1'>
                  Suggestions
                </p>
                <ul className='max-h-[280px] overflow-y-auto'>
                  {suggestions.map((item, idx) => {
                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.product
                    const Icon = cfg.icon
                    const isActive = activeIdx === idx
                    return (
                      <li key={`${item.type}-${item.label}`}>
                        <button
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleSuggestionClick(item.label)}
                          className={`w-full flex items-center gap-3 px-4 py-[10px] text-left
                                      transition-colors duration-100
                                      ${isActive ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                        >
                          <Icon size={14} className={`flex-shrink-0 ${isActive ? 'text-[#f51111]' : 'text-gray-400'}`} />
                          <span className={`flex-1 text-[13px] truncate ${isActive ? 'text-[#f51111]' : ''}`}>
                            <Highlighted text={item.label} query={query} />
                          </span>
                          <div className='flex items-center gap-2 flex-shrink-0'>
                            {item.count > 1 && (
                              <span className='text-[10px] text-gray-400'>
                                {item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}k` : item.count}×
                              </span>
                            )}
                            <span className={`text-[9px] font-[700] uppercase px-[7px] py-[3px] rounded-full ${cfg.pill}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => doSearch(query)}
                  className='w-full flex items-center gap-2 px-4 py-3 border-t border-gray-100
                             text-[13px] font-[600] text-[#f51111] hover:bg-red-50 transition-colors'
                >
                  <IoSearch size={14} className='flex-shrink-0' />
                  Search for "<span className='font-[700]'>{query.trim()}</span>"
                </button>
              </>
            )

          ) : (
            /* ── Empty input: history + trending ── */
            <>
              {/* User history section */}
              {showHistory && (
                <div>
                  <div className='flex items-center justify-between px-4 pt-3 pb-1'>
                    <div className='flex items-center gap-1.5'>
                      <BsClockHistory size={11} className='text-gray-400' />
                      <p className='text-[10px] font-[700] uppercase tracking-widest text-gray-400'>
                        Recent Searches
                      </p>
                    </div>
                    <button
                      onMouseDown={e => e.preventDefault()}
                      onClick={clearAllHistory}
                      className='text-[11px] text-[#f51111] hover:underline font-[600]'
                    >
                      Clear all
                    </button>
                  </div>
                  <ul>
                    {history.slice(0, 5).map((item, idx) => {
                      const isActive = activeIdx === idx
                      return (
                        <li key={`history-${item.label}`}>
                          <div
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => handleSuggestionClick(item.label)}
                            className={`w-full flex items-center gap-3 px-4 py-[9px] cursor-pointer
                                        transition-colors duration-100
                                        ${isActive ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                          >
                            <BsClockHistory size={13} className={`flex-shrink-0 ${isActive ? 'text-[#f51111]' : 'text-gray-400'}`} />
                            <span className={`flex-1 text-[13px] truncate capitalize
                                              ${isActive ? 'text-[#f51111] font-[600]' : 'text-gray-700'}`}>
                              {item.label}
                            </span>
                            {/* Remove individual item */}
                            <button
                              onMouseDown={e => e.preventDefault()}
                              onClick={(e) => removeHistoryItem(e, item.label)}
                              className='text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 p-1'
                            >
                              <RxCross2 size={12} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Trending section */}
              {showTrend && (
                <div className={showHistory ? 'border-t border-gray-100' : ''}>
                  <div className='flex items-center gap-1.5 px-4 pt-3 pb-1'>
                    <MdOutlineTrendingUp size={13} className='text-orange-400' />
                    <p className='text-[10px] font-[700] uppercase tracking-widest text-gray-400'>
                      Trending Searches
                    </p>
                  </div>
                  <ul className='pb-2'>
                    {trending.slice(0, 5).map((item, idx) => {
                      const listIdx  = history.slice(0, 5).length + idx
                      const isActive = activeIdx === listIdx
                      return (
                        <li key={`trending-${item.label}`}>
                          <button
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => handleSuggestionClick(item.label)}
                            className={`w-full flex items-center gap-3 px-4 py-[9px] text-left
                                        transition-colors duration-100
                                        ${isActive ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                          >
                            <MdOutlineTrendingUp size={14} className={`flex-shrink-0 ${isActive ? 'text-[#f51111]' : 'text-orange-400'}`} />
                            <span className={`flex-1 text-[13px] capitalize truncate
                                              ${isActive ? 'text-[#f51111] font-[600]' : 'text-gray-700'}`}>
                              {item.label}
                            </span>
                            {item.count > 1 && (
                              <span className='text-[10px] text-gray-400 flex-shrink-0'>
                                {item.count >= 1000 ? `${(item.count / 1000).toFixed(1)}k` : item.count}×
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Nothing at all */}
              {!showHistory && !showTrend && (
                <p className='text-[13px] text-gray-400 text-center py-6'>
                  Start typing to search…
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Search