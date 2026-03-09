import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Search from '../Search'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import { MdOutlineShoppingCart, MdOutlineDeleteOutline, MdMenu, MdClose } from 'react-icons/md'
import { FaRegHeart, FaRegUser } from 'react-icons/fa'
import { IoHomeOutline } from 'react-icons/io5'
import Tooltip from '@mui/material/Tooltip'
import Navigation from './Navigation'
import { Mycontext } from '../../App'
import Drawer from '@mui/material/Drawer'
import { IoCloseSharp } from 'react-icons/io5'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { BsFillBagCheckFill } from 'react-icons/bs'
import { IoIosLogOut } from 'react-icons/io'
import { RiMenu2Fill } from 'react-icons/ri'
import { LiaAngleDownSolid } from 'react-icons/lia'
import CategoryPanel from './Navigation/CategoryPanel'
import { fetchData } from '../../utils/api'
import { LuBaggageClaim, LuMapPinPlus } from 'react-icons/lu'

// ── Cart item skeleton ────────────────────────────────────────────────────────
const CartItemSkeleton = () => (
  <div className='w-full flex items-center gap-5 !mt-4'>
    <Skeleton variant="rounded" width={80} height={80} className='flex-shrink-0 !rounded-md' />
    <div className='flex-1 flex flex-col gap-2'>
      <Skeleton variant="text" width="80%" height={18} />
      <Skeleton variant="text" width="50%" height={15} />
      <Skeleton variant="text" width="35%" height={15} />
    </div>
  </div>
)

const UserAreaSkeleton = () => (
  <div className='hidden sm:flex items-center gap-2'>
    <Skeleton variant="circular" width={28} height={28} />
    <Skeleton variant="text" width={70} height={20} className='hidden sm:block' />
  </div>
)

// ── Logout Confirm Dialog ─────────────────────────────────────────────────────
const LogoutConfirmDialog = ({ open, onConfirm, onCancel }) => {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center px-4'
         onClick={onCancel}>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px]' />

      {/* Card */}
      <div
        className='relative bg-white rounded-3xl shadow-2xl w-full max-w-[340px] p-7 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200'
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className='w-[60px] h-[60px] rounded-2xl bg-red-50 flex items-center justify-center'>
          <IoIosLogOut size={28} className='text-[#f51111]' />
        </div>

        {/* Text */}
        <div className='text-center'>
          <h3 className='text-[17px] font-[800] text-gray-900 mb-1'>Log out?</h3>
          <p className='text-[13px] text-gray-400 leading-relaxed'>
            You'll need to sign in again to access your account, cart, and orders.
          </p>
        </div>

        {/* Buttons */}
        <div className='flex gap-3 w-full mt-1'>
          <button
            onClick={onCancel}
            className='flex-1 h-[44px] rounded-xl border-2 border-gray-200 text-gray-600
                       text-[13px] font-[700] hover:bg-gray-50 transition-colors active:scale-[0.97]'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 h-[44px] rounded-xl text-white text-[13px] font-[700]
                       transition-all active:scale-[0.97]'
            style={{ background: 'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)', boxShadow: '0 4px 14px rgba(245,17,17,0.35)' }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

const Header = () => {
  const context  = useContext(Mycontext)
  const navigate = useNavigate()

  const [anchorEl,         setAnchorEl]         = React.useState(null)
  const [mobileMenuOpen,   setMobileMenuOpen]   = React.useState(false)
  const [isOpenCatPanel,   setIsOpenCatPanel]   = React.useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false)

  const open = Boolean(anchorEl)
  const handleClick = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // Opens the confirm dialog instead of logging out immediately
  const requestLogout = () => {
    setAnchorEl(null)
    setMobileMenuOpen(false)
    setLogoutDialogOpen(true)
  }

  const confirmLogout = async () => {
    setLogoutDialogOpen(false)
    try {
      const res = await fetchData('/api/user/logout')
      if (!res.data.error) {
        context.setIsLogin(false)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const cartItems   = context.cartItems   || []
  const cartLoading = context.cartLoading ?? false
  const cartCount   = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const cartTotal   = cartItems.reduce((sum, item) => {
    const price = item.productId?.price ?? 0
    return sum + price * (item.quantity || 1)
  }, 0)

  return (
    <>
      <header>
        {/* ── Main header ── */}
        <div className='header py-2 border-b border-gray-200 bg-white'>
          <div className='container px-3 sm:px-4'>
            {/* Row 1 */}
            <div className='flex items-center justify-between py-3 gap-2 sm:gap-3'>

              {/* Hamburger */}
              <button
                className='flex lg:hidden items-center justify-center w-9 h-9 rounded-md
                           text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0'
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <MdMenu size={22} />
              </button>

              {/* Logo */}
              <div className='flex-shrink-0 w-[110px] sm:w-[140px] lg:w-[160px]'>
                <Link to="/"><img src="/logo.jpg" alt="logo" className='w-full h-auto' /></Link>
              </div>

              {/* Search — md+ */}
              <div className='hidden md:flex flex-1 max-w-[500px]'>
                <Search />
              </div>

              {/* Right icons */}
              <div className='flex items-center gap-0.5 sm:gap-1'>

                {/* Auth */}
                <div className='hidden sm:flex items-center'>
                  {context.isLoginLoading ? (
                    <UserAreaSkeleton />
                  ) : context.isLogin ? (
                    <>
                      <Button
                        onClick={handleClick}
                        className='!gap-1.5 !text-gray-700 !normal-case !min-w-0 !px-1.5 sm:!px-2.5 !rounded-full hover:!bg-gray-100'
                      >
                        <div className='w-7 h-7 rounded-full bg-[#f51111]/10 flex items-center justify-center flex-shrink-0'>
                          <FaRegUser size={12} className='text-[#f51111]' />
                        </div>
                        <span className='hidden sm:inline text-[12px] lg:text-[13px] font-[500] max-w-[80px] truncate'>
                          {context?.userData?.name}
                        </span>
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        slotProps={{
                          paper: {
                            elevation: 0,
                            sx: {
                              overflow: 'visible',
                              filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.10))',
                              mt: 1.5, borderRadius: '14px', minWidth: '185px',
                              '&::before': {
                                content: '""', display: 'block', position: 'absolute',
                                top: 0, right: 18, width: 10, height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
                              },
                            },
                          },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        <Link to="/my-account" className='no-underline text-black'>
                          <MenuItem className='!gap-3 !text-[13px] !py-2.5 hover:!text-[#f51111]'>
                            <FaRegUser className='text-gray-400' /> My Account
                          </MenuItem>
                        </Link>
                        <Link to="/my-list" className='no-underline text-black'>
                          <MenuItem className='!gap-3 !text-[13px] !py-2.5 hover:!text-[#f51111]'>
                            <FaRegHeart className='text-gray-400' /> My List
                          </MenuItem>
                        </Link>
                        <Link to="/orders" className='no-underline text-black'>
                          <MenuItem className='!gap-3 !text-[13px] !py-2.5 hover:!text-[#f51111]'>
                            <BsFillBagCheckFill className='text-gray-400' /> Orders
                          </MenuItem>
                        </Link>
                        <div className='mx-3 my-1 border-t border-gray-100' />
                        {/* Logout — opens confirm dialog */}
                        <MenuItem onClick={requestLogout} className='!gap-3 !text-[13px] !py-2.5 !text-red-500'>
                          <IoIosLogOut /> Logout
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <div className='flex items-center gap-1.5 text-[12px] lg:text-[13px]'>
                      <Link to="/login"    className='link font-[500] hover:text-[#f51111] transition-colors'>Login</Link>
                      <span className='text-gray-300'>|</span>
                      <Link to="/register" className='link font-[500] hover:text-[#f51111] transition-colors'>Register</Link>
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <div className='hidden sm:flex'>
                  <Tooltip title="Wishlist" arrow>
                    <IconButton size='small' aria-label="wishlist"
                      className='!text-gray-600 hover:!text-[#f51111] !transition-colors'
                      onClick={() => {
                        if (!context.isLogin) context.openAlertBox('error', 'Please log in to view your wishlist')
                        else navigate('/my-list')
                      }}>
                      <Badge badgeContent={context.wishlistCount || 0} color="error"
                        sx={{ '& .MuiBadge-badge': { fontSize: '10px', minWidth: '16px', height: '16px' } }}>
                        <FaRegHeart size={18} />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </div>

                {/* Cart */}
                <Tooltip title="Cart" arrow>
                  <IconButton size='small' aria-label="cart"
                    className='!text-gray-600 hover:!text-[#f51111] !transition-colors'
                    onClick={() => {
                      if (!context.isLogin) context.openAlertBox('error', 'Please log in to view your Cart')
                      else context.setOpenCartPannel(true)
                    }}>
                    <Badge badgeContent={cartCount} color="error"
                      sx={{ '& .MuiBadge-badge': { fontSize: '10px', minWidth: '16px', height: '16px' } }}>
                      <MdOutlineShoppingCart size={20} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            {/* Row 2 — Search on mobile */}
            <div className='flex md:hidden pb-3'>
              <Search />
            </div>
          </div>
        </div>

        <Navigation />
      </header>

      {/* Category Panel */}
      <CategoryPanel isOpenCatPanel={isOpenCatPanel} setIsOpenCatPanel={setIsOpenCatPanel} />

      {/* ── Mobile Side Drawer ── */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        anchor='left'
        PaperProps={{ sx: { width: { xs: '280px', sm: '300px' } } }}
      >
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.jpg" alt="logo" className='h-8 w-auto' />
          </Link>
          <IconButton onClick={() => setMobileMenuOpen(false)} size='small'>
            <MdClose size={20} />
          </IconButton>
        </div>

        <div className='px-4 pt-4 pb-3 border-b border-gray-100'>
          <button
            onClick={() => { setMobileMenuOpen(false); setTimeout(() => setIsOpenCatPanel(true), 250) }}
            className='w-full flex items-center justify-between px-4 py-3 rounded-xl
                       text-white font-[600] text-[13px] transition-all active:scale-[0.98]'
            style={{ background: '#f51111', boxShadow: '0 4px 14px rgba(8,8,8,0.35)' }}
          >
            <div className='flex items-center gap-2.5'>
              <RiMenu2Fill size={16} /> Shop By Categories
            </div>
            <LiaAngleDownSolid size={13} />
          </button>
        </div>

        <div className='flex flex-col p-4 gap-1'>
          {!context.isLogin ? (
            <div className='flex gap-3 mb-3 pb-3 border-b border-gray-100'>
              <Link to="/login" className='flex-1' onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outlined" fullWidth
                  className='!capitalize !text-[13px] !border-[#f51111] !text-[#f51111] !rounded-full'>
                  Login
                </Button>
              </Link>
              <Link to="/register" className='flex-1' onClick={() => setMobileMenuOpen(false)}>
                <Button variant="contained" fullWidth
                  className='!capitalize !text-[13px] !rounded-full'
                  style={{ background: 'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)' }}>
                  Register
                </Button>
              </Link>
            </div>
          ) : (
            <div className='flex items-center gap-3 mb-3 pb-3 border-b border-gray-100'>
              <div className='w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0'
                style={{ background: '#f51111' }}>
                <FaRegUser size={15} className='text-white' />
              </div>
              <div className='min-w-0'>
                <p className='text-[13px] font-[700] truncate'>{context?.userData?.name}</p>
                <p className='text-[11px] text-gray-400 truncate'>{context?.userData?.email}</p>
              </div>
            </div>
          )}

          {[
            { to: '/',           icon: <IoHomeOutline />,          label: 'Home'        },
            { to: '/my-account', icon: <FaRegUser />,              label: 'My Account', auth: true },
            { to: '/my-list',    icon: <FaRegHeart />,             label: 'My List',    auth: true },
            { to: '/orders',     icon: <LuBaggageClaim />,         label: 'My Orders',  auth: true },
            { to: '/addresses',  icon: <LuMapPinPlus size={15} />, label: 'Addresses',  auth: true },
          ].filter(item => !item.auth || context.isLogin).map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-[500]
                         text-gray-700 hover:bg-[#fff5f5] hover:text-[#f51111] transition-colors no-underline'
            >
              <span className='text-base'>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {context.isLogin && (
            <>
              <div className='my-2 border-t border-gray-100' />
              <button
                onClick={requestLogout}
                className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-[500]
                           text-red-400 hover:bg-red-50 transition-colors w-full text-left'
              >
                <IoIosLogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      </Drawer>

      {/* ── Cart Drawer ── */}
      <Drawer
        className='cartPannel'
        open={context.openCartPannel}
        onClose={() => context.toggleCartDrawer(false)}
        anchor='right'
        PaperProps={{ sx: { width: { xs: '100%', sm: '380px' } } }}
      >
        <div className='flex items-center justify-between p-5 border-b border-gray-100'>
          <h4 className='text-[16px] font-[700]'>
            Shopping Cart
            {!cartLoading && cartCount > 0 && (
              <span className='ml-2 text-[13px] text-gray-400 font-[400]'>
                ({cartCount} item{cartCount !== 1 ? 's' : ''})
              </span>
            )}
          </h4>
          <IoCloseSharp size={22}
            className='cursor-pointer text-gray-500 hover:text-black transition-colors'
            onClick={() => context.toggleCartDrawer(false)} />
        </div>

        <div className='scroll w-full flex-1 overflow-y-auto overflow-x-hidden p-5 pb-[240px]'>
          {cartLoading ? (
            Array.from({ length: 3 }).map((_, i) => <CartItemSkeleton key={i} />)
          ) : cartItems.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-[200px] text-gray-400 gap-3'>
              <MdOutlineShoppingCart size={48} className='opacity-30' />
              <p className='text-[14px]'>Your cart is empty</p>
              <Button variant="outlined" size="small"
                className='!capitalize !text-[12px] !border-[#f51111] !text-[#f51111] !rounded-full'
                onClick={() => context.toggleCartDrawer(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            cartItems.map((item) => {
              const prod = item.productId || {}
              return (
                <div key={item._id} className='w-full flex items-start gap-4 !mt-5'>
                  <div className='rounded-xl overflow-hidden w-[72px] h-[72px] flex-shrink-0 border border-gray-100 bg-gray-50'>
                    <Link to={`/product/${prod._id}`} className='group block w-full h-full'>
                      <img className='w-full h-full object-cover group-hover:scale-105 transition-all duration-300'
                        src={prod.images?.[0] || ''} alt={prod.name || 'Product'} />
                    </Link>
                  </div>
                  <div className='flex-1 relative min-w-0'>
                    <h4 className='text-[13px] font-[600] leading-snug pr-6'>
                      <Link className='link hover:text-[#f51111] transition-colors line-clamp-2'
                        to={`/product/${prod._id}`}>{prod.name}</Link>
                    </h4>
                    <p className='flex items-center gap-2 mt-1 text-[13px] text-gray-500'>
                      <span className='bg-gray-100 px-2 py-0.5 rounded-full text-[11px]'>Qty: {item.quantity || 1}</span>
                      <span className='text-[#f51111] font-[700]'>${Number(prod.price ?? 0).toFixed(2)}</span>
                    </p>
                    {(item.size || item.productRam || item.productWeight || item.productColor) && (
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {item.productColor && (
                          <span className='flex items-center gap-1 text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-gray-100 text-gray-500'>
                            <span className='w-[7px] h-[7px] rounded-full border border-gray-300'
                              style={{ backgroundColor: item.productColor?.color || '#ccc' }} />
                            {item.productColor?.name}
                          </span>
                        )}
                        {item.size          && <span className='text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-gray-100 text-gray-500'>{item.size}</span>}
                        {item.productRam    && <span className='text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-gray-100 text-gray-500'>{item.productRam}</span>}
                        {item.productWeight && <span className='text-[10px] font-[600] px-1.5 py-[2px] rounded-full bg-gray-100 text-gray-500'>{item.productWeight}</span>}
                      </div>
                    )}
                    <MdOutlineDeleteOutline
                      className='absolute top-0 right-0 text-gray-300 hover:text-red-500 cursor-pointer transition-colors'
                      size={18}
                      onClick={() => context.removeFromCart?.(item._id)} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className='absolute bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'>
          {cartLoading ? (
            <div className='p-5 flex flex-col gap-3'>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="70%" height={20} />
              <div className='flex gap-3 mt-2'>
                <Skeleton variant="rounded" width="50%" height={40} />
                <Skeleton variant="rounded" width="50%" height={40} />
              </div>
            </div>
          ) : (
            <>
              <div className='px-5 pt-4 pb-2 flex flex-col gap-1.5'>
                <div className='flex justify-between text-[13px] text-gray-500'>
                  <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-[13px] text-gray-500'>
                  <span>Shipping</span>
                  <span className='text-green-600 font-[600]'>Free</span>
                </div>
                <div className='flex justify-between text-[15px] font-[700] border-t border-gray-100 pt-2 mt-1'>
                  <span>Total</span>
                  <span className='text-[#f51111]'>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className='p-4 w-full flex items-center gap-3'>
                <Link to="/cart" className="flex-1">
                  <Button variant="outlined"
                    className='!capitalize !w-full !border-[#f51111] !text-[#f51111] !rounded-full'
                    onClick={() => context.toggleCartDrawer(false)}>
                    View Cart
                  </Button>
                </Link>
                <Link to="/checkout" className="flex-1">
                  <Button variant="contained"
                    className='!capitalize !w-full !rounded-full !shadow-none'
                    style={{ background: 'linear-gradient(135deg,#ff6b6b 0%,#f51111 100%)' }}
                    onClick={() => context.toggleCartDrawer(false)}>
                    Checkout
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Drawer>

      {/* ── Logout Confirm Dialog ── */}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </>
  )
}

export default Header