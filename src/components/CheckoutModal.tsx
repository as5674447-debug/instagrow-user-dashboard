import { motion, AnimatePresence } from 'motion/react';
import { X, Link2, CreditCard, ChevronRight, ShoppingBag, CheckCircle2, Smartphone, Building2, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    type: string;
    count: string;
    price: number;
    label: string;
  } | null;
}

const paymentIcons = [
  { icon: Smartphone, label: 'UPI' },
  { icon: CreditCard, label: 'Card' },
  { icon: Building2, label: 'NetBanking' },
  { icon: Wallet, label: 'Wallet' },
];

export default function CheckoutModal({ isOpen, onClose, orderData }: CheckoutModalProps) {
  const [link, setLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % paymentIcons.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!orderData) return null;

  const getPlaceholder = () => {
    switch (orderData.label.toLowerCase()) {
      case 'followers':
        return 'Enter Profile Link (e.g., instagram.com/username)';
      case 'likes':
      case 'comments':
      case 'views':
        return 'Enter Post or Reels Link';
      default:
        return 'Enter your link here';
    }
  };

  const isValidUrl = (url: string) => {
    // Robust URL validation for social media links (Instagram, etc.)
    // Supports: instagram.com/user, https://instagram.com/p/..., www.instagram.com...
    const trimmedUrl = url.trim();
    if (trimmedUrl.length < 3) return false;
    
    const pattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return pattern.test(trimmedUrl);
  };

  const handlePlaceOrder = () => {
    if (!isValidUrl(link)) {
      alert('Please enter a valid link');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate redirecting to Razorpay
    setTimeout(() => {
      // In a real app, this would be a redirect to a payment gateway or opening Razorpay Checkout
      window.location.href = `https://rzp.io/l/placeholder?amount=${orderData.price * 100}&notes=${encodeURIComponent(orderData.count + ' ' + orderData.label + ' Order')}`;
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-brand-red/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(185,28,28,0.2)]"
          >
            {/* Header */}
            <div className="relative h-32 bg-zinc-900 flex items-end p-6 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 z-20">
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-zinc-950 to-transparent z-10" />
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-red via-transparent to-transparent" />
              </div>
              
              <div className="relative z-20 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center -skew-x-12">
                  <ShoppingBag className="w-6 h-6 text-white skew-x-12" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">Confirm Order</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Review your package details</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Summary Card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest block mb-1">Package</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white tracking-tighter">{orderData.count}</span>
                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-tight">{orderData.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total Amount</span>
                  <span className="text-2xl font-black text-white italic tracking-tighter">₹{orderData.price}</span>
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Target Link (Required)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder={getPlaceholder()}
                    className={`w-full bg-zinc-900 border ${isValidUrl(link) ? 'border-green-500 ring-1 ring-green-500/20' : 'border-zinc-800 focus:border-brand-red focus:ring-1 focus:ring-brand-red'} rounded-xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-zinc-600 transition-all outline-none`}
                  />
                  {isValidUrl(link) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-zinc-500 italic ml-1 flex items-center gap-1">
                  * Please make sure your profile/post is public.
                </p>
              </div>

              {/* Action */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !isValidUrl(link)}
                className={`group relative w-full py-4 font-black uppercase tracking-tighter rounded-xl overflow-hidden transition-all duration-300 active:scale-95 ${
                  isValidUrl(link) && !isProcessing 
                    ? 'bg-brand-red text-white shadow-[0_0_30px_rgba(185,28,28,0.3)] border border-brand-red/50' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentIconIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="absolute"
                        >
                          {(() => {
                            const Icon = paymentIcons[currentIconIndex].icon;
                            return <Icon className="w-4 h-4" />;
                          })()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <span className="flex items-center gap-2">
                      Place Order & Pay
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
                
                {/* Shadow Glow */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-1/2 transition-transform blur-2xl" />
              </button>

              <div className="flex items-center justify-center gap-4 pt-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help" />
                <div className="h-4 w-px bg-zinc-800" />
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Secure 256-bit SSL Payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
