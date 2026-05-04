import { motion } from 'motion/react';
import { useState } from 'react';

const tabs = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

interface TabNavigationProps {
  activePlatform: string;
  setActivePlatform: (platform: string) => void;
}

export default function TabNavigation({ activePlatform, setActivePlatform }: TabNavigationProps) {
  return (
    <div className="w-full bg-black/50 backdrop-blur-md border-b border-zinc-800/50 z-40 overflow-x-auto no-scrollbar">
      <div className="max-w-[1400px] mx-auto px-2 md:px-8 py-2">
        <div className="flex items-center gap-1 md:gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlatform(tab.id)}
              className={`
                relative flex items-center justify-center px-4 sm:px-6 py-1 transition-all duration-300 min-h-[32px] scale-90 sm:scale-100 origin-center
                ${activePlatform === tab.id 
                  ? 'text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              {activePlatform === tab.id && (
                <motion.div
                  layoutId="active-tab-parallelogram"
                  className="absolute inset-0 bg-brand-red"
                  style={{ skewX: '-20deg' }}
                  transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                />
              )}
              
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold relative z-10 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
