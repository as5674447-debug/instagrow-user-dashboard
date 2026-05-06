import { motion, AnimatePresence } from 'motion/react';
import { X, Link2, CreditCard, ChevronRight, ShoppingBag, CheckCircle2, Smartphone, Building2, Wallet, QrCode, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../lib/firebase';
import { ref, push, set, serverTimestamp, update, runTransaction, get } from 'firebase/database';
import QRCode from 'react-qr-code';

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
  const [showPayment, setShowPayment] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(29);
  const [isSuccess, setIsSuccess] = useState(false);
  const orderRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false);
      setShowQr(false);
      setIsSuccess(false);
      setTimeLeft(29);
      setLink('');
      return;
    }
    
    if (!orderData || !auth.currentUser) return;
    
    // Generate a sequential numeric Order Number (starting from 1000)
    const generateOrderNumber = async () => {
      const counterRef = ref(db, 'metadata/lastOrderId');
      try {
        const result = await runTransaction(counterRef, (currentValue) => {
          return (currentValue || 999) + 1;
        });

        if (result.committed) {
          const newOrderNumber = result.snapshot.val().toString();
          setOrderNumber(newOrderNumber);

          // Create initial pending order in RTDB
          const ordersRef = ref(db, `orders/${auth.currentUser!.uid}`);
          const newOrderRef = push(ordersRef);
          orderRef.current = newOrderRef;

          const timestamp = new Date().toISOString();

          await set(newOrderRef, {
            orderId: newOrderNumber,
            orderDate: timestamp,
            userId: auth.currentUser!.uid,
            userName: auth.currentUser!.displayName || 'User',
            userEmail: auth.currentUser!.email,
            category: orderData.label,
            quantity: orderData.count,
            amount: orderData.price,
            targetLink: link || '',
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            platform: 'instagram'
          });
        }
      } catch (err) {
        console.error("Error generating order number:", err);
      }
    };

    generateOrderNumber();

    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % paymentIcons.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, orderData]);

  // Payment Countdown Logic
  useEffect(() => {
    if (!showPayment || isSuccess) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        
        // Transition to success when timer reaches 1 (total 29 seconds approximately)
        if (prev === 2) {
          setIsSuccess(true);
          // Update RTDB status
          if (orderRef.current) {
            update(orderRef.current, {
              status: 'order_received',
              updatedAt: serverTimestamp()
            });
          }
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showPayment, isSuccess]);

  // Update link in RTDB when it changes
  useEffect(() => {
    if (orderRef.current && link) {
      update(orderRef.current, {
        targetLink: link,
        status: 'pending_input',
        updatedAt: serverTimestamp()
      });
    }
  }, [link]);

  if (!orderData) return null;

  const upiId = 'Q506607709@ybl';
  const receiverName = 'Shubham Sharma';
  const amount = orderData.price;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderNumber)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    const trimmedUrl = url.trim();
    if (trimmedUrl.length < 3) return false;
    const pattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return pattern.test(trimmedUrl);
  };

  const handlePlaceOrder = async () => {
    if (!isValidUrl(link)) {
      alert('Please enter a valid link');
      return;
    }
    
    setIsProcessing(true);

    if (orderRef.current) {
      try {
        await update(orderRef.current, {
          targetLink: link,
          status: 'awaiting_payment',
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to update order status:", err);
      }
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowPayment(true);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-brand-red/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(185,28,28,0.2)]"
          >
            {/* Header */}
            <div className="relative h-28 bg-zinc-900 flex flex-col justify-center px-6 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 z-20">
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-zinc-950 to-transparent z-10" />
              
              {/* Step Indicator */}
              <div className="relative z-20 mb-4 flex items-center gap-1">
                <div className={`h-1 rounded-full transition-all duration-500 ${!showPayment ? 'w-8 bg-brand-red' : 'w-4 bg-green-500'}`} />
                <div className={`h-1 rounded-full transition-all duration-500 ${showPayment ? 'w-8 bg-brand-red' : 'w-4 bg-zinc-800'}`} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">
                  Step {showPayment ? '2/2' : '1/2'}: {showPayment ? 'Payment' : 'Details'}
                </span>
              </div>

              <div className="relative z-20 flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-red rounded-lg flex items-center justify-center -skew-x-12 shadow-[0_0_15px_rgba(185,28,28,0.4)]">
                  {showPayment ? (
                    <CreditCard className="w-4 h-4 text-white skew-x-12" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-white skew-x-12" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black uppercase italic tracking-tighter text-white leading-none">
                    {showPayment ? 'Secure Gateway' : 'Confirm Order'}
                  </h3>
                  <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                    {showPayment ? 'Verified Transaction' : 'Review your package'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="step-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 flex flex-col items-center text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                      >
                        <CheckCircle2 className="w-10 h-10 text-white" />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Order Received!</h2>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                        We've received your request.<br />Processing will start shortly.
                      </p>
                    </div>

                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Order ID</span>
                        <span className="text-xs font-black text-white uppercase">{orderNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Status</span>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-white text-black font-black uppercase tracking-tighter rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Close Tracker
                    </button>
                  </motion.div>
                ) : !showPayment ? (
                  <motion.div
                    key="step-order"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6 space-y-6"
                  >
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
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
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
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-1/2 transition-transform blur-2xl" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-5"
                  >
                    {/* Payment Info Header */}
                    <div className="flex flex-col items-center text-center space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full">
                          <span className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
                          <span className="text-[9px] font-bold text-brand-red uppercase tracking-widest">Order ID: {orderNumber}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Amount to Pay</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white italic tracking-tighter">₹{amount}</span>
                        <span className="text-xs font-bold text-zinc-500 italic">.00</span>
                      </div>
                    </div>

                    {/* Receiver Badge */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                      <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-red/20 border border-brand-red/30 flex items-center justify-center font-black text-brand-red text-xs italic">
                            SS
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block leading-none">Receiver</span>
                            <span className="text-xs font-black text-white uppercase tracking-tight">{receiverName}</span>
                          </div>
                        </div>
                        <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[8px] font-black text-green-500 uppercase tracking-widest">
                          Verified
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between gap-4">
                        <div className="flex-1 overflow-hidden">
                          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest block mb-0.5">UPI Address</span>
                          <span className="text-sm font-mono text-white truncate block">{upiId}</span>
                        </div>
                        <button 
                          onClick={handleCopyUpi}
                          className="flex items-center justify-center p-2 bg-zinc-800 hover:bg-brand-red transition-all rounded-lg group"
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-500 group-hover:text-white" /> : <Copy className="w-4 h-4 text-zinc-500 group-hover:text-white" />}
                        </button>
                      </div>
                    </div>

                    {/* QR Section (Conditional) */}
                    <AnimatePresence mode="wait">
                      {!showQr ? (
                        <motion.button
                          key="qr-button"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setShowQr(true)}
                          className="w-full py-4 border-2 border-dashed border-zinc-800 hover:border-brand-red/50 bg-zinc-900/30 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all"
                        >
                          <div className="w-10 h-10 bg-zinc-800 group-hover:bg-brand-red rounded-lg flex items-center justify-center transition-colors">
                            <QrCode className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Generate QR Code for Scanning</span>
                        </motion.button>
                      ) : (
                        <motion.div
                          key="qr-display"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center space-y-3"
                        >
                          <div className="relative p-4 bg-white rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                            <QRCode
                              size={150}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              value={upiUrl}
                              viewBox={`0 0 256 256`}
                            />
                            <div className="absolute inset-0 border-[6px] border-white rounded-2xl pointer-events-none" />
                          </div>
                          <button 
                            onClick={() => setShowQr(false)}
                            className="text-[9px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                          >
                            Hide QR Code
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* App Links (Mobile Only) */}
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-brand-red uppercase tracking-[0.2em] text-center mb-3 opacity-50">Pay via App</p>
                       <div className="grid grid-cols-2 gap-3">
                        <a 
                          href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR`}
                          className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 hover:border-brand-red/50 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="w-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">GPay</span>
                        </a>
                        <a 
                          href={`phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&cu=INR`}
                          className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 hover:border-brand-red/50 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="w-5" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">PhonePe</span>
                        </a>
                      </div>
                    </div>

                    {/* Instruction Guide */}
                    <div className="grid grid-cols-3 gap-2 px-1">
                      {[
                        { step: '01', label: 'Scan/Pay' },
                        { step: '02', label: 'Wait' },
                        { step: '03', label: 'Done' }
                      ].map((item) => (
                        <div key={item.step} className="flex flex-col items-center gap-1">
                          <span className="text-[7px] font-black text-brand-red px-1.5 py-0.5 bg-brand-red/10 rounded border border-brand-red/20">{item.step}</span>
                          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-center pt-2 flex items-center justify-center gap-4 border-t border-zinc-900">
                      <div className="flex items-center gap-1.5 grayscale opacity-40">
                        <Smartphone className="w-3 h-3 text-zinc-500" />
                        <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">Auto-Start</span>
                      </div>
                      <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <div className="flex items-center gap-1.5 grayscale opacity-40">
                        <CreditCard className="w-3 h-3 text-zinc-500" />
                        <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">256-Bit SSL</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-900 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Secure Payment Network</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
