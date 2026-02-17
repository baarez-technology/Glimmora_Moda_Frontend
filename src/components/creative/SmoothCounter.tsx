'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface SmoothCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function SmoothCounter({
  value,
  suffix = '',
  prefix = '',
  className = '',
}: SmoothCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  const display = useTransform(spring, (latest) => Math.floor(latest));

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
