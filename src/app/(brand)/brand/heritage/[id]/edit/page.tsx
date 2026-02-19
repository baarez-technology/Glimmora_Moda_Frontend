'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Clock, Award, Sparkles, Star, Layers, Users, Loader2 } from 'lucide-react';
import { fetchHeritageEvent, updateHeritageEvent } from '@/services/brand-heritage.service';
import type { HeritageEventResponse } from '@/services/brand-heritage.service';

type SignificanceType = 'milestone' | 'collection' | 'innovation' | 'cultural' | 'collaboration' | 'award';

export default function EditHeritageEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<HeritageEventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHeritageEvent(eventId);
      setEvent(data);
      setFormData({
        year: data.year,
        title: data.title,
        short_description: data.short_description,
        full_description: data.full_description || '',
        image_url: data.image_url || '',
        video_url: data.video_url || '',
        significance_type: (data.significance_type || 'milestone') as SignificanceType,
        significance_type_subtype: data.significance_type_subtype || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load heritage event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateHeritageEvent(eventId, {
        year: formData.year,
        title: formData.title,
        short_description: formData.short_description,
        full_description: formData.full_description,
        image_url: formData.image_url,
        video_url: formData.video_url,
        significance_type: formData.significance_type,
        significance_type_subtype: formData.significance_type_subtype,
      });
      router.push('/brand/heritage');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update heritage event');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-taupe" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center">
        <Clock size={48} className="mx-auto text-taupe/40 mb-4" />
        <p className="text-stone">{error || 'Heritage event not found'}</p>
        <Link
          href="/brand/heritage"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Heritage
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-sand px-8 py-6">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link href="/brand/heritage" className="text-taupe hover:text-charcoal-deep transition-colors">
            Heritage
          </Link>
          <span className="text-taupe">/</span>
          <span className="text-taupe">{event.title}</span>
          <span className="text-taupe">/</span>
          <span className="text-charcoal-deep">Edit</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-charcoal-deep">Edit Heritage Event</h1>
          <Link
            href="/brand/heritage"
            className="flex items-center gap-2 px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
          >
            <ArrowLeft size={16} />
            Cancel
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Event Details */}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/brand/heritage"
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
          {event.is_active === true && (
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.short_description}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
