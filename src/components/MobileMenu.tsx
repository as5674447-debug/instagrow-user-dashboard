import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Settings, 
  Wallet, 
  LifeBuoy, 
  Gift, 
  LogIn, 
  UserPlus,
  X,
  MessageSquare,
  Share2,
  ShieldCheck,
  User
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthClick: (mode: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOrdersClick: () => void;
  onCreditsClick: () => void;
  onSupportClick: () => void;
}

const menuItems = [
  { icon: ShoppingBag, label: 'Orders', id: 'orders' },
  { icon: Wallet, label: 'Wallet', id: 'wallet' },
  { icon: LifeBuoy, label: 'Support', id: 'support' },
  { icon: Gift, label: 'Earn', id: 'earn' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: MessageSquare, label: 'FAQ', id: 'faq' },
  { icon: Share2, label: 'Share', id: 'share' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export default function MobileMenu({ isOpen, onClose, onAuthClick, isLoggedIn, onLogout, onOrdersClick, onCreditsClick, onSupportClick }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-brand-red/30 z-[70] h-[55vh] min-h-[420px] flex flex-col touch-none"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1 bg-brand-red/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-900">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-red -skew-x-12 inline-block" />
                Menu
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-red/10 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-zinc-500 group-hover:text-brand-red transition-colors" />
              </button>
            </div>

            {/* Menu Content - 4x2 Grid */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
              <div className="grid grid-cols-4 gap-3">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      if (item.id === 'orders') {
                        onOrdersClick();
                      }
                      if (item.id === 'wallet' || item.id === 'earn') {
                        onCreditsClick();
                      }
                      if (item.id === 'support') {
                        onSupportClick();
                      }
                      // Others can be handled here too
                    }}
                    className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl bg-zinc-400 border border-zinc-500 hover:border-brand-red transition-all active:scale-90 group shadow-inner"
                  >
                    <item.icon className="w-5 h-5 text-black group-hover:text-brand-red transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-black/80 group-hover:text-brand-red transition-colors">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 px-2">
                {!isLoggedIn ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => onAuthClick('login')}
                      className="flex items-center justify-center gap-2 p-3 text-sm transition-all active:scale-95 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="whitespace-nowrap font-bold uppercase tracking-tight">Sign In</span>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => onAuthClick('signup')}
                      className="flex items-center justify-center gap-2 p-3 text-sm transition-all active:scale-95 rounded-lg bg-brand-red text-white"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="whitespace-nowrap font-bold uppercase tracking-tight">Sign Up</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onLogout}
                    className="col-span-2 flex items-center justify-center gap-2 p-3 text-sm transition-all active:scale-95 rounded-lg bg-zinc-900 text-red-500 border border-red-500/20 hover:bg-red-500/10"
                  >
                    <LogIn className="w-4 h-4 rotate-180" />
                    <span className="whitespace-nowrap font-bold uppercase tracking-tight">Sign Out</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
