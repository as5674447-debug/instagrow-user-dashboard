import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Send, Phone } from 'lucide-react';

interface SupportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportDrawer({ isOpen, onClose }: SupportDrawerProps) {
  const [message, setMessage] = useState('');

  const handleSend = (channel: 1 | 2) => {
    const phoneNumber = channel === 1 ? '918000000001' : '918000000002'; // Placeholders
    const encodedMessage = encodeURIComponent(message || 'Hello, I need support.');
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]"
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
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-md bg-zinc-950 border-t border-brand-red/30 z-[90] h-[55vh] md:h-[45vh] flex flex-col touch-none md:rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing md:hidden">
              <div className="w-12 h-1 bg-brand-red/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-900">
              <h2 className="text-xl md:text-base font-black uppercase tracking-tighter text-white flex items-center gap-2">
                <span className="w-1.5 h-6 md:h-4 bg-brand-red -skew-x-12 inline-block" />
                Support
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-red/10 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 md:w-4 md:h-4 text-zinc-500 group-hover:text-brand-red transition-colors" />
              </button>
            </div>

            {/* Content - Removed flex-1 overflow-auto to prevent scrolling and fixed layout */}
            <div className="px-6 py-6 md:py-4 space-y-6 md:space-y-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl md:rounded-xl p-4 md:p-3">
                <label className="block text-[10px] md:text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your issue or query here..."
                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 md:p-3 text-sm md:text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-brand-red transition-colors resize-none h-20 md:h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-3">
                <button
                  onClick={() => handleSend(1)}
                  className="flex flex-col items-center justify-center gap-3 md:gap-2 p-4 md:p-3 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-xl hover:border-brand-red/50 transition-all active:scale-95 group relative"
                >
                  {/* Red Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 md:w-5 md:h-5 bg-brand-red rounded-full flex items-center justify-center border-2 border-zinc-950 z-10 shadow-lg">
                    <span className="text-[10px] md:text-[8px] font-black text-white">1</span>
                  </div>
                  
                  <div className="w-12 h-12 md:w-10 md:h-10 bg-green-500/10 rounded-xl md:rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-6 h-6 md:w-5 md:h-5 text-green-500" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[8px] md:text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">WhatsApp</span>
                    <span className="block text-sm md:text-xs font-black text-white italic tracking-tighter">Channel 1</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSend(2)}
                  className="flex flex-col items-center justify-center gap-3 md:gap-2 p-4 md:p-3 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-xl hover:border-brand-red/50 transition-all active:scale-95 group relative"
                >
                  {/* Red Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 md:w-5 md:h-5 bg-brand-red rounded-full flex items-center justify-center border-2 border-zinc-950 z-10 shadow-lg">
                    <span className="text-[10px] md:text-[8px] font-black text-white">2</span>
                  </div>

                  <div className="w-12 h-12 md:w-10 md:h-10 bg-green-500/10 rounded-xl md:rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-6 h-6 md:w-5 md:h-5 text-green-500" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[8px] md:text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">WhatsApp</span>
                    <span className="block text-sm md:text-xs font-black text-white italic tracking-tighter">Channel 2</span>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-3 px-2 text-zinc-500 pt-2 md:pt-1">
                <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-zinc-900 flex items-center justify-center">
                  <Phone className="w-3 h-3 md:w-2.5 md:h-2.5 text-zinc-600" />
                </div>
                <p className="text-[9px] md:text-[8px] font-bold uppercase tracking-widest leading-tight">
                  Our team is available 24/7<br/>to help you instantly.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
