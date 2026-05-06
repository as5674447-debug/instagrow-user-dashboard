import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { ShoppingBag, Timer, CheckCircle2, ChevronRight, Hash, Calendar, Link2, ExternalLink, CreditCard } from 'lucide-react';

interface Order {
  id: string;
  orderId: string;
  orderDate: string;
  category: string;
  quantity: string;
  amount: number;
  targetLink: string;
  status: string;
  platform: string;
}

interface MyOrdersProps {
  onClose: () => void;
}

export default function MyOrders({ onClose }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const ordersRef = ref(db, `orders/${auth.currentUser.uid}`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        })).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(ordersList);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'order_received':
        return { label: 'Processing', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 };
      case 'awaiting_payment':
        return { label: 'Pending Payment', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Timer };
      case 'pending':
        return { label: 'In Queue', color: 'text-zinc-500', bg: 'bg-zinc-500/10', icon: Hash };
      default:
        return { label: 'Active', color: 'text-brand-red', bg: 'bg-brand-red/10', icon: ShoppingBag };
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">My Orders</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Track your active requests</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading History...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-8">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-white font-black uppercase text-lg italic tracking-tighter">No Orders Yet</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
              Your order history will appear here once you place a request.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {orders.map((order, index) => {
              const status = getStatusDisplay(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-brand-red/30 transition-all"
                >
                  <div className="p-4 space-y-3">
                    {/* Top Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center -skew-x-12 group-hover:bg-brand-red/10 transition-colors">
                          <ShoppingBag className="w-5 h-5 text-zinc-400 group-hover:text-brand-red" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block leading-none mb-1">Package</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-white italic tracking-tighter">{order.quantity}</span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">{order.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-md ${status.bg} flex items-center gap-1.5`}>
                        <status.icon className={`w-3 h-3 ${status.color}`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                      <div>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Order ID</span>
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs font-mono text-white">{order.orderId}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Order Date</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Target Link */}
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
                        <Link2 className="w-3 h-3 text-brand-red flex-shrink-0" />
                        <span className="text-[10px] font-mono text-zinc-500 truncate">{order.targetLink}</span>
                      </div>
                      <a 
                        href={order.targetLink.startsWith('http') ? order.targetLink : `https://${order.targetLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Amount</span>
                        <span className="text-sm font-black text-white italic tracking-tighter leading-none">₹{order.amount}.00</span>
                      </div>
                      
                      {(order.status === 'pending' || order.status === 'awaiting_payment') && (now - new Date(order.orderDate).getTime() > 20000) && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-brand-red text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors shadow-[0_4px_10px_rgba(185,28,28,0.3)]"
                        >
                          <CreditCard className="w-3 h-3" />
                          Pay Again
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
