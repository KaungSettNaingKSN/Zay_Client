import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import './App.css'
import './responsive.css'
import Header from './components/Header'
import Home from './pages/Home'
import Footer from './components/Footer'
import ProductListing from './pages/ProductListing'
import ProductDetails from './pages/ProductDetials'
import { createContext } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ProductZoom from './components/ProductZoom'
import { IoCloseSharp } from 'react-icons/io5'
import ProductDetailsComponent from './components/ProductDeatils'
import Login from './pages/Login'
import Register from './pages/Register'
import CartPage from './pages/Cart'
import VerifyAccount from './pages/VerifyAccount'
import ForgotPassword from './pages/ForgotPassword'
import toast, { Toaster } from 'react-hot-toast'
import Checkout from './pages/Checkout'
import MyAccount from './pages/MyAccount'
import MyList from './pages/MyList'
import Orders from './pages/Orders'
import { fetchData, deleteData } from './utils/api'
import { setOnAuthFail } from "./utils/axiosInstance";
import Address from './pages/MyAccount/address'

const Mycontext = createContext();

// ── Route guards ──────────────────────────────────────────────────────────────

// Redirect logged-in users away from auth pages (login, register, verify, forgot)
const GuestOnlyRoute = ({ isLogin, isLoginLoading, children }) => {
  if (isLoginLoading) return null  // wait for auth check before redirecting
  if (isLogin) return <Navigate to='/' replace />
  return children
}

// Redirect guests away from protected pages
const ProtectedRoute = ({ isLogin, isLoginLoading, children }) => {
  if (isLoginLoading) return null
  if (!isLogin) return <Navigate to='/login' replace />
  return children
}

function App() {
  // ── Cart ──────────────────────────────────────────────────────────────────
  const [openCartPannel, setOpenCartPannel] = React.useState(false);
  const [cartItems,      setCartItems]      = React.useState([]);
  const [cartLoading,    setCartLoading]    = React.useState(false);

  // ── Address ───────────────────────────────────────────────────────────────
  const [openAddressPannel, setOpenAddressPannel] = React.useState(false);

  // ── Categories ────────────────────────────────────────────────────────────
  const [categories,        setCategories]        = React.useState([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts] = React.useState([]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [isLogin,        setIsLogin]        = React.useState(() => !!localStorage.getItem('accessToken'));
  const [isLoginLoading, setIsLoginLoading] = React.useState(true);
  const [userData,       setUserData]       = React.useState(null);

  // ── Wishlist / My List ───────────────────────────────────────────────────
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const [myListItems,   setMyListItems]   = React.useState([]);

  // ── Quick-view product modal ──────────────────────────────────────────────
  const [selectedProduct,  setSelectedProduct]  = React.useState(null);
  const [openProductModal, setOpenProductModal] = React.useState(false);

  // ── Full-screen panel ─────────────────────────────────────────────────────
  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = React.useState({ open: false, model: null });
  const [editData, setEditData] = React.useState(null);

  const handleOpenFullScreenPanel  = (model) => setIsOpenFullScreenPanel({ open: true, model });
  const handleCloseFullScreenPanel = () => { setIsOpenFullScreenPanel({ open: false, model: null }); setEditData(null); };

  // ── Alert box ─────────────────────────────────────────────────────────────
  const openAlertBox = React.useCallback((status, message) => {
    if (status === 'success') toast.success(message);
    else                      toast.error(message);
  }, []);

  // ── Fetch logged-in user ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isLogin) { setIsLoginLoading(false); return; }
    const getUser = async () => {
      setIsLoginLoading(true);
      try {
        const res = await fetchData('/api/user/get-user');
        if (res?.data?.data) {
          setUserData(res.data.data);
        } else {
          setIsLogin(false);
          setUserData(null);
        }
      } catch {
        setIsLogin(false);
        setUserData(null);
      } finally {
        setIsLoginLoading(false);
      }
    };
    getUser();
  }, [isLogin]);

  // ── Fetch cart ────────────────────────────────────────────────────────────
  const fetchCartItems = React.useCallback(async () => {
    if (!isLogin) { setCartItems([]); return; }
    try {
      setCartLoading(true);
      const res = await fetchData('/api/cart');
      setCartItems(res?.data?.data || []);
    } catch (e) {
      console.error('Cart load failed:', e);
    } finally {
      setCartLoading(false);
    }
  }, [isLogin]);

  useEffect(() => { fetchCartItems(); }, [fetchCartItems]);
  useEffect(() => { if (!isLogin) setCartItems([]); }, [isLogin]);

  const removeFromCart = React.useCallback(async (cartItemId) => {
    setCartItems(prev => prev.filter(i => i._id !== cartItemId));
    try {
      await deleteData('/api/cart/delete', { _id: cartItemId });
    } catch {
      fetchCartItems();
    }
  }, [fetchCartItems]);

  // ── Fetch wishlist ────────────────────────────────────────────────────────
  const reloadWishlist = React.useCallback(async () => {
    if (!isLogin) { setWishlistCount(0); setMyListItems([]); return; }
    try {
      const res = await fetchData('/api/mylist');
      const list = res?.data?.data || [];
      setMyListItems(list);
      setWishlistCount(list.length);
    } catch { /* non-critical */ }
  }, [isLogin]);

  useEffect(() => { reloadWishlist(); }, [reloadWishlist]);

  // ── Categories ────────────────────────────────────────────────────────────
  const reloadCategories = React.useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await fetchData('/api/category');
      setCategories(res?.data?.category || []);
    } catch (e) {
      openAlertBox('error', e?.message || 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, [openAlertBox]);

  // ── Drawers ───────────────────────────────────────────────────────────────
  const toggleCartDrawer    = (open) => setOpenCartPannel(open);
  const toggleAddressDrawer = (open) => setOpenAddressPannel(open);

  // ── Quick view modal ──────────────────────────────────────────────────────
  const handleCloseProductModal = () => {
    setOpenProductModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // ── Auth fail handler ─────────────────────────────────────────────────────
  useEffect(() => {
    setOnAuthFail(() => {
      setIsLogin(false);
      setUserData(null);
      setCartItems([]);
      setMyListItems([]);
      openAlertBox('error', 'Session expired. Please log in again.');
    });
  }, [openAlertBox]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    setOpenProductModal, setSelectedProduct,
    openCartPannel,    setOpenCartPannel,
    cartItems,         setCartItems,
    cartLoading,
    fetchCartItems,    removeFromCart,
    openAddressPannel, setOpenAddressPannel,
    toggleCartDrawer,  toggleAddressDrawer,
    openAlertBox,
    isLogin,           setIsLogin,
    isLoginLoading,
    userData,          setUserData,
    wishlistCount,     setWishlistCount,
    myListItems,       setMyListItems,     reloadWishlist,
    categories,        setCategories,
    categoriesLoading, reloadCategories,
    products,          setProducts,
    isOpenFullScreenPanel, setIsOpenFullScreenPanel,
    handleOpenFullScreenPanel, handleCloseFullScreenPanel,
    editData,          setEditData,
  };

  return (
    <>
      <BrowserRouter>
        <Mycontext.Provider value={value}>
          <Header />
          <Routes>
            {/* ── Public ── */}
            <Route path='/'               element={<Home />} />
            <Route path='/productListing' element={<ProductListing />} />
            <Route path='/product/:id'    element={<ProductDetails />} />

            {/* ── Guest only (redirect to / if logged in) ── */}
            <Route path='/login' element={
              <GuestOnlyRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <Login />
              </GuestOnlyRoute>
            } />
            <Route path='/register' element={
              <GuestOnlyRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <Register />
              </GuestOnlyRoute>
            } />
            <Route path='/verifyAccount' element={
              <GuestOnlyRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <VerifyAccount />
              </GuestOnlyRoute>
            } />
            <Route path='/forgotPassword' element={
              <GuestOnlyRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <ForgotPassword />
              </GuestOnlyRoute>
            } />

            {/* ── Protected (redirect to /login if not logged in) ── */}
            <Route path='/cart' element={
              <ProtectedRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path='/checkout' element={
              <ProtectedRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path='/my-account' element={
              <ProtectedRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <MyAccount />
              </ProtectedRoute>
            } />
            <Route path='/my-list' element={
              <ProtectedRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <MyList />
              </ProtectedRoute>
            } />
            <Route path='/orders' element={
              <ProtectedRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path='/addresses' element={
              <ProtectedRoute isLogin={isLogin} isLoginLoading={isLoginLoading}>
                <Address />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />

          {/* ── Quick view modal ── */}
          <Dialog
            open={openProductModal}
            onClose={handleCloseProductModal}
            fullWidth
            maxWidth="lg"
            PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
          >
            <DialogContent sx={{ p: 0 }}>
              <div className='relative flex items-start gap-0 w-full min-h-[480px]'>
                <button
                  onClick={handleCloseProductModal}
                  className='absolute top-4 right-4 z-50 w-[36px] h-[36px] rounded-full
                             bg-white shadow-md flex items-center justify-center
                             text-gray-600 hover:bg-[#f51111] hover:text-white
                             transition-colors duration-200 border border-gray-200'
                >
                  <IoCloseSharp size={18} />
                </button>
                <div className='w-[45%] p-5 bg-gray-50 border-r border-gray-100'>
                  <ProductZoom images={selectedProduct?.images || []} />
                </div>
                <div className='w-[55%] p-6 overflow-y-auto max-h-[85vh]'>
                  <ProductDetailsComponent product={selectedProduct} />
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </Mycontext.Provider>
      </BrowserRouter>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
export { Mycontext };