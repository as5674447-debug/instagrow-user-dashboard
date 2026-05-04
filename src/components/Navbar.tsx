import { Menu, User, X, Instagram, LogIn, LogOut, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16 bg-black/80 backdrop-blur-md border-b border-red-900/30 flex items-center justify-between px-4 md:px-8">
      {/* Left: Hamburger Icon */}
      <div className="flex items-center gap-4">
        <button 
          id="nav-menu-btn"
          onClick={onMenuClick}
          className="p-2 hover:text-brand-red transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Instagram Icon for branding on larger screens */}
        <div className="hidden sm:flex items-center text-brand-red">
          <Instagram className="w-5 h-5" />
        </div>
      </div>

      {/* Center: Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <Instagram className="w-5 h-5 text-brand-red sm:hidden" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xl md:text-2xl font-black tracking-tighter uppercase italic flex items-center"
        >
          <span className="text-white">Insta</span>
          <span className="text-brand-red">Grow</span>
        </motion.div>
      </div>

      {/* Right: User Icon */}
      <div className="flex items-center gap-1 md:gap-4 relative" ref={dropdownRef}>
        <button 
          id="nav-facebook-btn"
          className="hidden md:flex p-2 hover:text-brand-red transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
          aria-label="Facebook Link"
        >
          <Facebook className="w-6 h-6" />
        </button>
        <button 
          id="nav-user-btn"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${isDropdownOpen ? 'text-brand-red' : 'hover:text-brand-red'}`}
          aria-label="User Profile"
        >
          <User className="w-6 h-6" />
        </button>

        {/* User Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-2"
            >
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLoggedIn(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-zinc-400 hover:text-brand-red hover:bg-zinc-900 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                    <span className="text-sm">Sign In</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
