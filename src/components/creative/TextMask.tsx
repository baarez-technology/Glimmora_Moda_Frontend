'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface TextMaskProps {
  text: string;
  image: string;
  subtext?: string;
}

export default function TextMask({ text, image, subtext }: TextMaskProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-noir flex items-center justify-center"
    >
      {/* Background Image */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-noir/30" />
      </motion.div>

      {/* Text Mask Container */}
      <motion.div
        className="relative z-10 text-center px-4"
        style={{ y: textY }}
      >
        {subtext && (
          <motion.p
            className="font-body text-[10px] tracking-[0.5em] uppercase text-white/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {subtext}
          </motion.p>
        )}
        <h1
          className="font-display text-[18vw] lg:text-[15vw] leading-[0.85] tracking-tighter text-transparent"
          style={{
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(1.2) contrast(1.1)',
          }}
        >
          {text}
        </h1>
      </motion.div>

      {/* Gradient Overlays */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-noir to-transparent z-20" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-noir to-transparent z-20" />
    </div>
  );
}
