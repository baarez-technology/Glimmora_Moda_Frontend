'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, Sparkles, Star, Layers, Users } from 'lucide-react';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { createHeritageEvent } from '@/services/brand-heritage.service';

type SignificanceType = 'milestone' | 'collection' | 'innovation' | 'cultural' | 'collaboration' | 'award';

export default function NewHeritageEventPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: '',
    short_description: '',
    full_description: '',
    image_url: '',
    video_url: '',
    significance_type: 'milestone' as SignificanceType,
    significance_type_subtype: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createHeritageEvent({
        year: formData.year,
        title: formData.title,
        short_description: formData.short_description,
        full_description: formData.full_description,
        image_url: formData.image_url,
        video_url: formData.video_url,
        significance_type: formData.significance_type,
        significance_type_subtype: formData.significance_type_subtype,
        product_list: [],
      });
      router.push('/brand/heritage');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create heritage event');
      setIsSubmitting(false);
    }
  };

  const significanceOptions: { value: SignificanceType; label: string; description: string; icon: React.ElementType }[] = [
    { value: 'milestone', label: 'Milestone', description: 'Major brand achievement', icon: Star },
    { value: 'collection', label: 'Collection', description: 'Notable collection launch', icon: Layers },
    { value: 'innovation', label: 'Innovation', description: 'Technical or design breakthrough', icon: Sparkles },
    { value: 'cultural', label: 'Cultural', description: 'Cultural impact or movement', icon: Users },
    { value: 'collaboration', label: 'Collaboration', description: 'Notable partnership', icon: Users },
    { value: 'award', label: 'Award', description: 'Recognition or honor', icon: Award }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Add Heritage Event"
        breadcrumbs={[
          { label: 'Heritage', href: '/brand/heritage' },
          { label: 'New Event' }
        ]}
        actions={
          <SecondaryButton href="/brand/heritage" icon={ArrowLeft}>
            Cancel
          </SecondaryButton>
        }
      />

      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Event Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  min={1800}
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., The New Look Debut"
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Short Description *
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                required
                placeholder="A brief summary of the event..."
                maxLength={200}
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
              <p className="text-xs text-taupe mt-1">{formData.short_description.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Full Description
              </label>
              <textarea
                value={formData.full_description}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                rows={5}
                placeholder="Tell the full story of this heritage moment..."
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Image URL
                </label>
                <div className="flex gap-4">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                  {formData.image_url && (
                    <div className="w-12 h-12 bg-parchment flex-shrink-0">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Significance */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Significance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {significanceOptions.map(option => {
                const Icon = option.icon;
                const isSelected = formData.significance_type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, significance_type: option.value })}
                    className={`p-4 border text-left transition-colors ${
                      isSelected
                        ? 'border-charcoal-deep bg-parchment'
                        : 'border-sand hover:border-charcoal-deep/50'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-charcoal-deep' : 'text-taupe'} />
                    <p className={`text-sm font-medium mt-2 ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-taupe mt-0.5">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/brand/heritage"
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.short_description}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
