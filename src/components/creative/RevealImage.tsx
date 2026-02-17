'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface RevealImageProps {
  src: string;
  alt: string;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export default function RevealImage({
  src,
  alt,
  className = '',
  direction = 'up',
}: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const clipPaths = {
    up: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
    down: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
    left: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
    right: ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'],
  };

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    clipPaths[direction]
  );

  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="relative w-full h-full"
        style={{ clipPath }}
      >
        <motion.div style={{ scale }} className="w-full h-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Circle Reveal
export function CircleReveal({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ['circle(0% at 50% 50%)', 'circle(100% at 50% 50%)']
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className="relative w-full h-full"
        style={{ clipPath }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
