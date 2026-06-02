import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

const platformMetrics: Record<string, { id: string; label: string }[]> = {
  instagram: [
    { id: 'followers', label: 'Followers 🇮🇳' },
    { id: 'likes', label: 'Likes 🇮🇳' },
    { id: 'comments', label: 'Comments 🇮🇳' },
    { id: 'views', label: 'Views 🇮🇳' },
    { id: 'share', label: 'Share 🇮🇳' },
    { id: 'repost', label: 'Repost 🇮🇳' },
    { id: 'save', label: 'Save 🇮🇳' },
  ],
  facebook: [
    { id: 'followers', label: 'Followers 🇮🇳' },
    { id: 'likes', label: 'Likes 🇮🇳' },
    { id: 'comments', label: 'Comments 🇮🇳' },
    { id: 'views', label: 'Views 🇮🇳' },
    { id: 'share', label: 'Share 🇮🇳' },
    { id: 'repost', label: 'Repost 🇮🇳' },
    { id: 'save', label: 'Save 🇮🇳' },
  ],
  whatsapp: [
    { id: 'status_views', label: 'Status Views 🇮🇳' },
    { id: 'broadcast_reach', label: 'Broadcast 🇮🇳' },
    { id: 'groups', label: 'Groups 🇮🇳' },
    { id: 'messages', label: 'Messages 🇮🇳' },
  ]
};

interface MetricNavigationProps {
  activePlatform: string;
  activeMetric: string;
  setActiveMetric: (metric: string) => void;
}

export default function MetricNavigation({ activePlatform, activeMetric, setActiveMetric }: MetricNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const metrics = platformMetrics[activePlatform] || platformMetrics.instagram;

  // Reset active metric when platform changes
  useEffect(() => {
    setActiveMetric(metrics[0]?.id);
  }, [activePlatform, metrics]);

  // Scroll active metric into view
  useEffect(() => {
    const activeButton = containerRef.current?.querySelector(`[data-active="true"]`);
    if (activeButton) {
      const container = containerRef.current;
      if (container) {
        const scrollLeft = (activeButton as HTMLElement).offsetLeft - (container.offsetWidth / 2) + ((activeButton as HTMLElement).offsetWidth / 2);
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeMetric]);

  return (
    <div 
      ref={containerRef}
      className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 overflow-x-auto no-scrollbar scroll-smooth relative z-30"
    >
      <div className="flex items-center gap-1 md:gap-2 px-4 md:px-8 py-2 min-w-max">
        {metrics.map((metric) => (
            <button
              key={metric.id}
              data-active={activeMetric === metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`
                relative flex items-center justify-center px-4 sm:px-5 py-1.5 transition-all duration-300 min-h-[36px] scale-90 sm:scale-100 origin-center
                ${activeMetric === metric.id 
                  ? 'text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'}
              `}
            >
              {activeMetric === metric.id && (
                <motion.div
                  layoutId="active-metric-parallelogram"
                  className="absolute inset-0 bg-brand-red"
                  style={{ skewX: '-20deg' }}
                  transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                />
              )}
              
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.15em] font-black relative z-10 whitespace-nowrap">
                {metric.label}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
