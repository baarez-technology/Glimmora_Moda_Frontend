'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const categories = [
  'Clothing', 'Accessories', 'Jewellery', 'Watches',
  'Bags', 'Shoes', 'Fragrance', 'Art', 'Other'
];

export default function NewSourcingRequestPage() {
  const { createSourcingRequest } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    priority: 'standard' as 'standard' | 'urgent' | 'when_available',
    deadline: '',
    specifications: '',
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.description || !formData.budget) return;

    createSourcingRequest({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      budget: Number(formData.budget),
      priority: formData.priority,
      deadline: formData.deadline || undefined,
      specifications: formData.specifications || undefined,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory-cream">
        <div className="bg-charcoal-deep">
          <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
            <div className="flex items-center gap-2 mb-4">
              <Search size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Private Request
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              New Sourcing Request
            </h1>
          </div>
        </div>
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h2 className="font-display text-2xl text-charcoal-deep mb-3">
              Sourcing Request Submitted
            </h2>
            <p className="text-stone max-w-md mx-auto mb-10">
              Our global network is now searching for your item.
              You will be notified when options are found — typically within 24-72 hours.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/uhni/sourcing"
                className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
              >
                View My Requests
              </Link>
              <Link
                href="/uhni"
                className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni/sourcing"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Sourcing
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Search size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Private Request
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              New Sourcing Request
            </h1>
            <p className="text-sand mt-3">Tell us what you're looking for</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              What are you looking for? *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Hermès Birkin 25 in Gold Togo"
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the item in detail — brand, style, era, condition..."
              rows={4}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Budget *
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone">€</span>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0"
                className="w-full pl-10 pr-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'standard', label: 'Standard', desc: 'Within your preferred timeline' },
                { value: 'urgent', label: 'Urgent', desc: 'Required within 2 weeks' },
                { value: 'when_available', label: 'When Available', desc: 'No time pressure, find the perfect piece' },
              ] as const).map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                  className={`p-4 text-left border transition-colors ${
                    formData.priority === p.value
                      ? 'border-charcoal-deep bg-parchment'
                      : 'border-sand bg-white hover:border-charcoal-deep/50'
                  }`}
                >
                  <p className="text-sm font-medium text-charcoal-deep">{p.label}</p>
                  <p className="text-xs text-stone mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Requested Deadline (Optional)
            </label>
            <input
              type="date"
              value={formData.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
            />
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-3">
              Specifications (Optional)
            </label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              placeholder="Size, material, color, condition requirements..."
              rows={3}
              className="w-full px-5 py-4 bg-white border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-sand">
            <button
              type="submit"
              disabled={!formData.title || !formData.category || !formData.description || !formData.budget}
              className="px-8 py-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
