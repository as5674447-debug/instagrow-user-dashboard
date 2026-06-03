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
  User,
  PlusCircle
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthClick: (mode: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOrdersClick: () => void;
  onNewOrderClick: () => void;
  onCreditsClick: () => void;
  onSupportClick: () => void;
  onProfileClick: () => void;
}

const menuItems = [
  { icon: PlusCircle, label: 'New Order', id: 'new_order' },
  { icon: ShoppingBag, label: 'Orders', id: 'orders' },
  { icon: Wallet, label: 'Wallet', id: 'wallet' },
  { icon: LifeBuoy, label: 'Support', id: 'support' },
  { icon: Gift, label: 'Earn', id: 'earn' },
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Share2, label: 'Share', id: 'share' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export default function MobileMenu({ isOpen, onClose, onAuthClick, isLoggedIn, onLogout, onOrdersClick, onNewOrderClick, onCreditsClick, onSupportClick, onProfileClick }: MobileMenuProps) {
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
            className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-brand-red/30 z-[70] h-[55vh] md:h-[50vh] min-h-[420px] md:min-h-[400px] flex flex-col touch-none md:rounded-t-[48px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing md:hidden">
              <div className="w-12 h-1 bg-brand-red/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-3 md:py-6 md:px-16 border-b border-zinc-900 max-w-7xl mx-auto w-full">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                <span className="w-1.5 h-6 md:h-8 bg-brand-red -skew-x-12 inline-block" />
                Menu
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-red/10 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 md:w-8 md:h-8 text-zinc-500 group-hover:text-brand-red transition-colors" />
              </button>
            </div>

            {/* Menu Content - Single row on desktop */}
            <div className="flex-1 overflow-y-auto px-4 py-8 md:py-16">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 max-w-lg md:max-w-5xl mx-auto">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      if (item.id === 'new_order') {
                        onNewOrderClick();
                      }
                      if (item.id === 'orders') {
                        onOrdersClick();
                      }
                      if (item.id === 'wallet' || item.id === 'earn') {
                        onCreditsClick();
                      }
                      if (item.id === 'support') {
                        onSupportClick();
                      }
                      if (item.id === 'profile') {
                        onProfileClick();
                      }
                    }}
                    className="flex flex-col items-center justify-center gap-2 md:gap-3 aspect-square rounded-xl md:rounded-2xl bg-zinc-400 border border-zinc-500 hover:border-brand-red transition-all active:scale-90 group shadow-inner"
                  >
                    <item.icon className="w-5 h-5 md:w-10 md:h-10 text-black group-hover:text-brand-red transition-colors" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-black/80 group-hover:text-brand-red transition-colors">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 md:mt-16 grid grid-cols-2 gap-4 md:gap-8 px-2 max-w-lg md:max-w-5xl mx-auto">
                {!isLoggedIn ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => onAuthClick('login')}
                      className="flex items-center justify-center gap-2 p-3 md:p-5 text-sm md:text-base transition-all active:scale-95 rounded-lg md:rounded-2xl bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                    >
                      <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="whitespace-nowrap font-bold uppercase tracking-tight">Sign In</span>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => onAuthClick('signup')}
                      className="flex items-center justify-center gap-2 p-3 md:p-5 text-sm md:text-base transition-all active:scale-95 rounded-lg md:rounded-2xl bg-brand-red text-white"
                    >
                      <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="whitespace-nowrap font-bold uppercase tracking-tight">Sign Up</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onLogout}
                    className="col-span-2 flex items-center justify-center gap-2 p-3 md:p-5 text-sm md:text-base transition-all active:scale-95 rounded-lg md:rounded-2xl bg-zinc-900 text-red-500 border border-red-500/20 hover:bg-red-500/10"
                  >
                    <LogIn className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
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
