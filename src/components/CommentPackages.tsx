import { motion } from 'motion/react';
import { MessageCircle, Zap, TrendingUp, Calculator } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

function Counter({ target, duration = 3 }: { target: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const isK = target.includes('K');
  const numericTarget = isK ? parseFloat(target.replace('K', '')) * 1000 : parseInt(target);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      setCount(Math.floor(easedProgress * numericTarget));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericTarget, duration]);

  if (isK) {
    return <span>{count >= 1000 ? (count / 1000).toFixed(0) + 'K' : count}</span>;
  }
  return <span>{count}</span>;
}

const instagramPackages = [
  {
    count: '100',
    price: '15',
    label: 'Comments',
    icon: MessageCircle,
    tag: 'Intro'
  },
  {
    count: '300',
    price: '45',
    label: 'Comments',
    icon: Zap,
    tag: 'Recommended'
  },
  {
    count: '500',
    price: '70',
    label: 'Comments',
    icon: TrendingUp,
    tag: 'Power'
  }
];

const facebookPackages = [
  {
    count: '100',
    price: '20',
    label: 'FB Comments',
    icon: MessageCircle,
    tag: 'Intro'
  },
  {
    count: '300',
    price: '50',
    label: 'FB Comments',
    icon: Zap,
    tag: 'Recommended'
  },
  {
    count: '500',
    price: '80',
    label: 'FB Comments',
    icon: TrendingUp,
    tag: 'Power'
  }
];

export default function CommentPackages({ onOrder, platform = 'instagram' }: { onOrder: (type: string, count: string, price: number, label: string) => void; platform?: string }) {
  const packages = platform === 'facebook' ? facebookPackages : instagramPackages;
  const [customCount, setCustomCount] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const target = '100';
    let current = 0;
    
    const typeInterval = setInterval(() => {
      if (current <= target.length) {
        setCustomCount(target.slice(0, current));
        current++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 200);

    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    const val = parseInt(customCount) || 0;
    let price = 0;
    
    if (platform === 'facebook') {
      let rate = 0.20;
      if (val >= 500) rate = 0.16;
      else if (val >= 300) rate = 0.1666;
      else if (val >= 100) rate = 0.20;
      price = Math.round(val * rate);
    } else {
      let rate = 0.15; // Base rate
      if (val >= 1000) rate = 0.12;
      else if (val >= 500) rate = 0.14;
      else if (val >= 100) rate = 0.15;
      price = Math.round(val * rate);
      if (val >= 500 && price > 0) {
        price = price - 1;
      }
    }
    
    setCustomPrice(price);
  }, [customCount, platform]);

  return (
    <section className="px-4 pt-2 pb-6 md:py-8 md:px-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-8 bg-brand-red -skew-x-12" />
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-brand-red fill-brand-red/20" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">
            {platform === 'facebook' ? 'Facebook Comments 🇮🇳' : 'Comment Packages 🇮🇳'}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.count}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden bg-zinc-950 border border-white/20 hover:border-brand-red transition-all duration-300 rounded-2xl p-4 md:p-6 flex flex-row items-center justify-between gap-4 h-28 md:h-32"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-brand-red/10 transition-all" />
            
            <div className="relative z-10 flex flex-col justify-center">
              <span className="text-xs font-bold text-brand-red uppercase tracking-widest mb-1">
                {pkg.tag}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">
                  <Counter target={pkg.count} />
                </span>
                <span className="text-zinc-500 font-bold uppercase text-xs tracking-tight">
                  {platform === 'facebook' ? 'FB Comments' : pkg.label} 🇮🇳
                </span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-end justify-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-white italic">₹{pkg.price}</span>
              </div>
              <button 
                onClick={() => onOrder('package', pkg.count, parseInt(pkg.price), platform === 'facebook' ? 'FB Comments' : pkg.label)}
                className="px-4 py-1.5 bg-brand-red text-white text-[10px] font-black uppercase tracking-tighter -skew-x-12 hover:scale-105 active:scale-95 transition-all"
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        ))}

        {/* Custom Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          onViewportEnter={() => {
            setTimeout(() => {
              inputRef.current?.focus();
              setIsTyping(false);
            }, 600);
          }}
          className="group relative overflow-hidden bg-zinc-950 border border-white/20 hover:border-brand-red transition-all duration-300 rounded-2xl p-4 md:p-6 flex flex-row items-center justify-between gap-4 h-28 md:h-32 shadow-[0_0_20px_rgba(185,28,28,0.05)]"
        >
          <div className="relative z-10 flex flex-col justify-center flex-1">
            <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest mb-1 flex items-center gap-1">
              <Calculator className="w-3 h-3" /> Custom Plan
            </span>
            <div className="flex items-center gap-2 relative">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={customCount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCustomCount(val);
                    setIsTyping(false);
                  }}
                  onFocus={() => setIsTyping(false)}
                  placeholder=""
                  className="w-24 bg-transparent text-3xl md:text-4xl font-black text-white tracking-tighter outline-none border-b border-zinc-800 focus:border-brand-red transition-colors caret-brand-red"
                  min="1"
                />
                {isTyping && (
                  <span className="absolute ml-1 w-1 h-8 bg-brand-red animate-blink pointer-events-none" 
                        style={{ left: `${customCount.length * 0.55}em` }} />
                )}
              </div>
              <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-tight">
                {platform === 'facebook' ? 'FB Comments' : 'Comments'} 🇮🇳
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-end justify-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Total</span>
              <span className="text-2xl font-black text-brand-red italic">₹{customPrice}</span>
            </div>
            <button 
              onClick={() => onOrder('custom', customCount, customPrice, platform === 'facebook' ? 'FB Comments' : 'Comments')}
              className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-tighter -skew-x-12 hover:bg-brand-red hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
            >
              Order
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
