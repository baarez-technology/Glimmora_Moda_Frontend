'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface MorphingCardProps {
  image: string;
  title: string;
  href: string;
  index: number;
}

export default function MorphingCard({ image, title, href, index }: MorphingCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative"
    >
      <Link
        href={href}
        className="block relative group"
        data-magnetic
        data-cursor-text="Explore"
      >
        {/* Card Container */}
        <motion.div
          className="relative overflow-hidden bg-noir"
          initial={{ borderRadius: '0%' }}
          animate={{ borderRadius: isHovered ? '24px' : '0%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Image */}
          <motion.div
            className="aspect-[3/4] relative"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
            {/* Overlay gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent"
              animate={{ opacity: isHovered ? 0.8 : 0.3 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Title - slides up on hover */}
          <motion.div
            className="absolute inset-x-0 bottom-0 p-6 lg:p-8"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 60, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-white/60 block mb-2">
              Maison {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-2xl lg:text-3xl text-white tracking-tight">
              {title}
            </h3>
          </motion.div>
        </motion.div>

        {/* Floating accent line */}
        <motion.div
          className="absolute -bottom-2 left-6 right-6 h-px bg-white/30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      </Link>
    </motion.div>
  );
}
