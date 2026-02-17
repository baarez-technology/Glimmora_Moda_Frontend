'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';

interface CursorImageProps {
  items: {
    id: string;
    name: string;
    image: string;
    href: string;
  }[];
}

export default function CursorImage({ items }: CursorImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative"
    >
      {/* Floating Image */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{ x, y }}
        initial={{ opacity: 0 }}
      >
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] overflow-hidden"
          animate={{
            opacity: activeIndex !== null ? 1 : 0,
            scale: activeIndex !== null ? 1 : 0.8,
            rotate: activeIndex !== null ? -3 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: activeIndex === index ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Text List */}
      <div className="relative z-10">
        {items.map((item, index) => (
          <motion.a
            key={item.id}
            href={item.href}
            className="block border-b border-ivory-warm/10 py-8 lg:py-12 group"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <span className="font-body text-xs text-charcoal-warm/40 w-8">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <motion.h3
                  className="font-display text-4xl lg:text-6xl xl:text-7xl text-noir tracking-tight"
                  whileHover={{ x: 20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {item.name}
                </motion.h3>
              </div>
              <motion.span
                className="font-body text-xs tracking-widest uppercase text-charcoal-warm opacity-0 group-hover:opacity-100"
                initial={{ x: -20 }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              >
                Explore →
              </motion.span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
