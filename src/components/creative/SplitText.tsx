'use client';

import { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

const letterVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
    rotateX: -90,
  },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.03,
    },
  }),
};

export default function SplitText({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
}: SplitTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const letters = children.split('');

  return (
    <span ref={ref} className={`inline-block ${className}`} style={{ perspective: '1000px' }}>
      {letters.map((letter, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            style={{ transformStyle: 'preserve-3d' }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={delay / 1000 + i * staggerDelay}
            variants={letterVariants}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Staggered words variant
export function SplitWords({ children, className = '', delay = 0 }: SplitTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const words = children.split(' ');

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * 0.1,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
