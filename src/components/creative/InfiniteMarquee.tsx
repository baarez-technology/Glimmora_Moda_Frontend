'use client';

import { motion } from 'framer-motion';

interface InfiniteMarqueeProps {
  text: string;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
  textClassName?: string;
}

export default function InfiniteMarquee({
  text,
  speed = 20,
  direction = 'left',
  className = '',
  textClassName = '',
}: InfiniteMarqueeProps) {
  const repeatedText = Array(10).fill(text).join(' • ');

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="inline-block"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <span className={textClassName}>
          {repeatedText} • {repeatedText}
        </span>
      </motion.div>
    </div>
  );
}

// Vertical Marquee
export function VerticalMarquee({
  items,
  speed = 15,
  direction = 'up',
}: {
  items: string[];
  speed?: number;
  direction?: 'up' | 'down';
}) {
  const repeatedItems = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden h-full">
      <motion.div
        className="flex flex-col"
        animate={{
          y: direction === 'up' ? ['0%', '-33.33%'] : ['-33.33%', '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {repeatedItems.map((item, index) => (
          <div key={index} className="py-4">
            <span className="font-display text-2xl lg:text-3xl text-noir/20">
              {item}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
