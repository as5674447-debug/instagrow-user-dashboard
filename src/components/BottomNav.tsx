import { Home, ShoppingBag, Gift, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onMenuClick: () => void;
  isLoggedIn: boolean;
}

export default function BottomNav({ activeTab, onTabChange, onMenuClick, isLoggedIn }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'earn', icon: Gift, label: 'Free Credits' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pointer-events-none">
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-black/90 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-around p-3 pb-safe pointer-events-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
              activeTab === tab.id ? 'text-brand-red' : 'text-zinc-500'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="bottom-nav-active"
                className="absolute -top-1 w-8 h-0.5 bg-brand-red rounded-full"
              />
            )}
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1">
              {tab.label}
            </span>
          </button>
        ))}
        
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center flex-1 py-1 text-zinc-500 hover:text-white transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest mt-1">Menu</span>
        </button>
      </motion.div>
    </div>
  );
}
