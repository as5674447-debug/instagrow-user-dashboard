/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import TabNavigation from './components/TabNavigation';
import MetricNavigation from './components/MetricNavigation';
import MobileMenu from './components/MobileMenu';
import FollowerPackages from './components/FollowerPackages';
import LikePackages from './components/LikePackages';
import CommentPackages from './components/CommentPackages';
import ViewPackages from './components/ViewPackages';
import CheckoutModal from './components/CheckoutModal';
import AuthBottomSheet from './components/AuthBottomSheet';
import MyOrders from './components/MyOrders';
import BottomNav from './components/BottomNav';
import CreditsDrawer from './components/CreditsDrawer';
import SupportDrawer from './components/SupportDrawer';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

export default function App() {
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [activeMetric, setActiveMetric] = useState('followers');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showOrders, setShowOrders] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    type: string;
    count: string;
    price: number;
    label: string;
    platform?: string;
  } | null>(null);

  const [userMetadata, setUserMetadata] = useState<{ photoURL?: string | null }>({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Listen to extra metadata in RTDB
        const userRef = ref(db, `users/${user.uid}`);
        const unsubscribeMetadata = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserMetadata(snapshot.val());
          }
        });
        return () => unsubscribeMetadata();
      } else {
        setIsLoggedIn(false);
        setUserMetadata({});
        setShowOrders(false); // Close orders on logout
        setIsCreditsOpen(false); // Close credits on logout
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleOrder = (type: string, count: string, price: number, label: string) => {
    setSelectedOrder({ type, count, price, label, platform: activePlatform });
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleMenuAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsMenuOpen(false);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setIsAuthOpen(false);
    if (selectedOrder) {
      setIsCheckoutOpen(true);
    }
  };

  const handleOrdersClick = () => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsAuthOpen(true);
    } else {
      setShowOrders(true);
      setIsCreditsOpen(false);
    }
    setIsMenuOpen(false);
  };

  const handleCreditsClick = () => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsAuthOpen(true);
    } else {
      setIsCreditsOpen(true);
      setShowOrders(false);
    }
    setIsMenuOpen(false);
  };

  const handleSupportClick = () => {
    setIsSupportOpen(true);
    setIsMenuOpen(false);
  };

  const metrics = ['followers', 'likes', 'comments', 'views', 'share', 'repost', 'save'];

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = metrics.indexOf(activeMetric);
    if (direction === 'left' && currentIndex < metrics.length - 1) {
      setActiveMetric(metrics[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveMetric(metrics[currentIndex - 1]);
    }
  };

  const renderActivePackage = () => {
    if (showOrders) {
      return (
        <motion.div 
          key="my-orders"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="h-full"
        >
          <MyOrders onClose={() => setShowOrders(false)} />
        </motion.div>
      );
    }

    const isComingSoonMetric = ['share', 'repost', 'save'].includes(activeMetric);

    if ((activePlatform !== 'instagram' && activePlatform !== 'facebook') || isComingSoonMetric) {
      return (
        <motion.div 
          key="coming-soon"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-red/20 blur-3xl rounded-full" />
            <h2 className="relative text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white/10 mb-2">
              Coming Soon
            </h2>
          </motion.div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            {isComingSoonMetric 
              ? `We are working on ${activeMetric} services`
              : `We are working on ${activePlatform} services`}
          </p>
          <motion.div 
            animate={{ scaleX: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-1 bg-brand-red mt-6 rounded-full"
          />
        </motion.div>
      );
    }

    switch (activeMetric) {
      case 'likes':
        return (
          <motion.div key="likes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <LikePackages onOrder={handleOrder} platform={activePlatform} />
          </motion.div>
        );
      case 'comments':
        return (
          <motion.div key="comments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CommentPackages onOrder={handleOrder} platform={activePlatform} />
          </motion.div>
        );
      case 'views':
        return (
          <motion.div key="views" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ViewPackages onOrder={handleOrder} platform={activePlatform} />
          </motion.div>
        );
      default:
        return (
          <motion.div key="followers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <FollowerPackages onOrder={handleOrder} platform={activePlatform} />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-red selection:text-white flex flex-col">
      <Navbar 
        onMenuClick={() => setIsMenuOpen(true)} 
        isLoggedIn={isLoggedIn}
        userPhoto={userMetadata.photoURL || auth.currentUser?.photoURL || null}
        onLogout={handleLogout}
        onAuthClick={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
      />
      <div className="flex-1 flex flex-col pt-14 md:pt-16">
        <TabNavigation activePlatform={activePlatform} setActivePlatform={setActivePlatform} />
        <MetricNavigation 
          activePlatform={activePlatform} 
          activeMetric={activeMetric}
          setActiveMetric={setActiveMetric}
        />
        <motion.main 
          className="flex-1 w-full overflow-x-hidden bg-black relative"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={(_, info) => {
            const threshold = 30; 
            if (info.offset.x < -threshold) {
              handleSwipe('left');
            } else if (info.offset.x > threshold) {
              handleSwipe('right');
            }
          }}
        >
          <div className="max-w-[1400px] mx-auto w-full h-full min-h-[60vh] pb-32 md:pb-8">
            <AnimatePresence mode="wait">
              {renderActivePackage()}
            </AnimatePresence>
          </div>
        </motion.main>
      </div>

      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onAuthClick={handleMenuAuth}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onOrdersClick={handleOrdersClick}
        onCreditsClick={handleCreditsClick}
        onSupportClick={handleSupportClick}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        orderData={selectedOrder}
      />

      <AuthBottomSheet
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      <BottomNav 
        activeTab={showOrders ? 'orders' : isCreditsOpen ? 'wallet' : 'home'}
        onTabChange={(tab) => {
          if (tab === 'home') {
            setShowOrders(false);
            setIsCreditsOpen(false);
          }
          if (tab === 'orders') handleOrdersClick();
          if (tab === 'wallet') handleCreditsClick();
        }}
        onMenuClick={() => setIsMenuOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      <CreditsDrawer 
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        balances={{
          wallet: (userMetadata as any).walletBalance || 0,
        }}
      />

      <SupportDrawer
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}

