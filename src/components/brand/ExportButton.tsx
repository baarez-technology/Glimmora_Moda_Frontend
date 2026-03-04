'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

export interface ExportOption {
  label: string;
  onClick: () => void;
}

interface ExportButtonProps {
  options: ExportOption[];
  label?: string;
}

export default function ExportButton({ options, label = 'Export' }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-white rounded-lg hover:bg-charcoal-deep/90 transition-colors text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-sand/50 rounded-lg shadow-lg z-50 py-1">
          {options.map((option, i) => (
            <button
              key={i}
              onClick={() => { option.onClick(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-charcoal-deep hover:bg-ivory-cream transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
