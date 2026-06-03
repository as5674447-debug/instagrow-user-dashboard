import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  CreditCard, 
  ShoppingBag, 
  TrendingUp, 
  Copy, 
  Check, 
  LogOut, 
  Award,
  Zap,
  Globe
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userMetadata: any;
  onLogout: () => void;
}

export default function ProfileDrawer({ isOpen, onClose, userMetadata, onLogout }: ProfileDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [ordersStats, setOrdersStats] = useState({
    totalCount: 0,
    totalSpent: 0,
    pendingCount: 0
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const ordersRef = ref(db, `orders/${auth.currentUser.uid}`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersList = Object.values(data) as any[];
        const total = ordersList.length;
        const pending = ordersList.filter(o => o.status === 'pending' || o.status === 'order_received').length;
        const spent = ordersList
          .filter(o => o.status !== 'awaiting_payment')
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setOrdersStats({
          totalCount: total,
          totalSpent: spent,
          pendingCount: pending
        });
      } else {
        setOrdersStats({
          totalCount: 0,
          totalSpent: 0,
          pendingCount: 0
        });
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleCopyId = () => {
    if (!auth.currentUser) return;
    navigator.clipboard.writeText(auth.currentUser.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate tier based on total spent
  const getTierAndBenefits = (spent: number) => {
    if (spent >= 5000) {
      return { name: 'VIP Diamond', color: 'from-cyan-400 to-blue-500', nextTier: 'Max Tier reached!', requirement: 0, progress: 100 };
    } else if (spent >= 2000) {
      return { name: 'Gold Pro', color: 'from-amber-400 to-yellow-500', nextTier: 'VIP Diamond', requirement: 5000 - spent, progress: ((spent - 2000) / 3000) * 100 };
    } else if (spent >= 500) {
      return { name: 'Silver Elite', color: 'from-zinc-300 to-zinc-500', nextTier: 'Gold Pro', requirement: 2000 - spent, progress: ((spent - 500) / 1500) * 100 };
    } else {
      return { name: 'Bronze starter', color: 'from-orange-500 to-red-600', nextTier: 'Silver Elite', requirement: 500 - spent, progress: (spent / 500) * 100 };
    }
  };

  const tier = getTierAndBenefits(ordersStats.totalSpent);
  const user = auth.currentUser;
  
  // Format creation / joining date
  const joiningDate = userMetadata?.createdAt 
    ? new Date(userMetadata.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Active Member';

  const initials = userMetadata?.fullName
    ? userMetadata.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'IN';

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
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80]"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-md bg-zinc-950 border-t border-brand-red/30 z-[90] h-[75vh] md:h-[68vh] flex flex-col touch-none md:rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-4 pb-1 cursor-grab active:cursor-grabbing md:hidden">
              <div className="w-12 h-1 bg-brand-red/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 flex-shrink-0">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-red -skew-x-12 inline-block" />
                Acccount Profile
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-red/10 rounded-full transition-colors group"
                id="close-profile-btn"
              >
                <X className="w-5 h-5 text-zinc-500 group-hover:text-brand-red transition-colors" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              
              {/* Profile Card Summary */}
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-3xl rounded-full" />
                
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {userMetadata?.photoURL || user?.photoURL ? (
                      <img 
                        src={userMetadata?.photoURL || user?.photoURL || ''} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="w-[72px] h-[72px] rounded-2xl border border-brand-red object-cover shadow-[0_0_15px_rgba(235,50,35,0.2)]"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-black text-2xl text-white italic -skew-x-6">
                        {initials}
                      </div>
                    )}
                    
                    {/* Active/Verified Badge icon */}
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-black px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-zinc-950">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Active</span>
                    </div>
                  </div>

                  {/* Details Name/Email */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-brand-red uppercase tracking-wider block">
                      PRO PARTNER 🇮🇳
                    </span>
                    <h3 className="text-xl font-black text-white italic tracking-tight truncate uppercase">
                      {userMetadata?.fullName || user?.displayName || 'Social booster'}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate font-medium">
                      {user?.email || 'authenticated_user@provider'}
                    </p>
                  </div>
                </div>

                {/* ID Copier */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
                      Partner account ID
                    </span>
                    <span className="text-[10px] font-mono font-medium text-zinc-400">
                      {user?.uid.slice(0, 18)}...
                    </span>
                  </div>
                  <button 
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-brand-red hover:bg-brand-red/5 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time stats metric grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between min-h-[85px]">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Wallet Bal</span>
                  <div className="mt-2">
                    <span className="text-lg font-black text-white italic">₹{userMetadata?.walletBalance || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-green-400 uppercase tracking-tight">
                    <Globe className="w-2 h-2" />
                    <span>Real-time</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between min-h-[85px]">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Orders Placed</span>
                  <div className="mt-2">
                    <span className="text-lg font-black text-white italic">{ordersStats.totalCount}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-brand-red uppercase tracking-tight">
                    <ShoppingBag className="w-2 h-2" />
                    <span>{ordersStats.pendingCount} Ongoing</span>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between min-h-[85px]">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">Total Spent</span>
                  <div className="mt-2">
                    <span className="text-lg font-black text-white italic">₹{ordersStats.totalSpent}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-zinc-400 uppercase tracking-tight">
                    <TrendingUp className="w-2 h-2" />
                    <span>Investment</span>
                  </div>
                </div>
              </div>

              {/* Loyalty Tier Progress */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-red" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">LOYALTY PROGRAM TIER</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase italic px-2 py-0.5 rounded bg-gradient-to-r ${tier.color} text-black tracking-wider`}>
                    {tier.name}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-zinc-950 p-[2px] border border-zinc-800/80 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${tier.color}`}
                      style={{ width: `${tier.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                    <span>PROGRESS</span>
                    <span>{Math.round(tier.progress)}%</span>
                  </div>
                </div>

                {tier.requirement > 0 ? (
                  <p className="text-[9px] font-medium text-zinc-400">
                    Spend <strong className="text-white">₹{tier.requirement}</strong> more to unlock <strong className="text-brand-red">{tier.nextTier}</strong> with bonus rates!
                  </p>
                ) : (
                  <p className="text-[9px] font-medium text-green-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Ultimate tier unlocked! You get prioritized instant delivery slots.</span>
                  </p>
                )}
              </div>

              {/* Account details info card */}
              <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-4 space-y-3.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Account History Details</span>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since</span>
                  </div>
                  <span className="font-bold text-zinc-200">{joiningDate}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Method</span>
                  </div>
                  <span className="font-bold text-zinc-200">UPI / QR Wallet</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verification Status</span>
                  </div>
                  <span className="font-bold text-green-500 flex items-center gap-1">
                    Verified ID ✅
                  </span>
                </div>
              </div>

              {/* Log Out Button */}
              <button 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-3.5 bg-zinc-900 border border-red-500/30 text-red-500 font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 active:scale-[0.98] transition-all"
                id="logout-profile-btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Account</span>
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
