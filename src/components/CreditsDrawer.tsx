import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet } from 'lucide-react';

interface CreditsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  balances?: {
    wallet: number;
  };
}

export default function CreditsDrawer({ isOpen, onClose, balances = { wallet: 0 } }: CreditsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (invisible but clickable to close) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70]"
          />
          
          {/* Quick Balance Bar - Positioned above BottomNav */}
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="fixed bottom-[72px] left-4 right-4 z-[80] pointer-events-none"
          >
            <div className="bg-black/90 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-3 pointer-events-auto shadow-2xl flex gap-3">
              {/* Wallet Balance Box */}
              <div className="flex-1 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-green-500/70 uppercase tracking-widest leading-none mb-1">My Wallet</span>
                    <span className="text-lg font-black text-white italic tracking-tighter leading-none">₹{balances.wallet}</span>
                  </div>
                </div>
                <a 
                  href="https://razorpay.me/@instagrowx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 bg-green-500 text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-green-400 transition-all shadow-[0_4px_12px_rgba(34,197,94,0.4)] active:scale-95 flex items-center justify-center"
                >
                  Add Amount
                </a>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-10 flex-shrink-0 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </>
      )}
    </AnimatePresence>
  );
}
