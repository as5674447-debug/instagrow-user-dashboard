import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Wallet, RotateCcw, TrendingUp, Info, Zap } from 'lucide-react';

interface CreditsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  balances?: {
    free: number;
    wallet: number;
    refund: number;
  };
}

export default function CreditsDrawer({ isOpen, onClose, balances = { free: 0, wallet: 0, refund: 0 } }: CreditsDrawerProps) {
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
              {/* Free Credits Box */}
              <div className="flex-1 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-400 p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden group">
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-zinc-800" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Free Credit</span>
                  <span className="text-lg font-black text-black italic tracking-tighter leading-none">₹{balances.free}</span>
                </div>
                <div className="absolute top-1 right-1">
                  <Zap className="w-2 h-2 text-zinc-500 fill-zinc-500" />
                </div>
              </div>

              {/* Refund Balance Box */}
              <div className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Refund</span>
                  <span className="text-lg font-black text-white italic tracking-tighter leading-none">₹{balances.refund}</span>
                </div>
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
