'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Image, Type, Quote, Clock, Trash2, Loader2 } from 'lucide-react';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { createStory, fetchProductsList } from '@/services/brand-story.service';
import type { ProductListItem } from '@/services/brand-story.service';

type StoryType = 'heritage' | 'craftsmanship' | 'collection' | 'artisan';

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'quote' | 'timeline';
  content: string;
  caption?: string;
  mediaUrl?: string;
}

export default function NewStoryPage() {
  const router = useRouter();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    story_type: 'heritage' as StoryType,
    story_type_subtype: '',
    excerpt: '',
    image_url: '',
    content: [] as ContentSection[],
    product_list: [] as string[],
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await fetchProductsList();
      setProducts(data);
    } catch {
      // Products are optional, don't block the form
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const readTime = Math.max(1, Math.ceil(
      formData.content.reduce((acc, section) => {
        if (section.type === 'text' || section.type === 'quote') {
          return acc + section.content.split(' ').length;
        }
        return acc;
      }, 0) / 200
    ));

    try {
      await createStory({
        title: formData.title,
        story_type: formData.story_type,
        story_type_subtype: formData.story_type_subtype,
        excerpt: formData.excerpt,
        image_url: formData.image_url,
        status: formData.status,
        content: formData.content as unknown as Record<string, unknown>[],
        product_list: formData.product_list,
        sections: formData.content.length,
        read_time: readTime,
      });
      router.push('/brand/stories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
      setIsSubmitting(false);
    }
  };

  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type,
      content: '',
      caption: undefined,
      mediaUrl: undefined
    };
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, newSection]
    }));
  };

  const updateSection = (index: number, updates: Partial<ContentSection>) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map((section, i) =>
        i === index ? { ...section, ...updates } : section
      )
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const toggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      product_list: prev.product_list.includes(productId)
        ? prev.product_list.filter(id => id !== productId)
        : [...prev.product_list, productId]
    }));
  };

  const storyTypes: { value: StoryType; label: string; description: string }[] = [
    { value: 'heritage', label: 'Heritage', description: 'Brand history and legacy' },
    { value: 'craftsmanship', label: 'Craftsmanship', description: 'Artisan techniques and skills' },
    { value: 'collection', label: 'Collection', description: 'Collection stories and inspiration' },
    { value: 'artisan', label: 'Artisan', description: 'Meet the makers' }
  ];

  const sectionTypes = [
    { type: 'text' as const, label: 'Text Block', icon: Type },
    { type: 'image' as const, label: 'Image', icon: Image },
    { type: 'quote' as const, label: 'Quote', icon: Quote },
    { type: 'timeline' as const, label: 'Timeline', icon: Clock }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Create Story"
        breadcrumbs={[
          { label: 'Stories', href: '/brand/stories' },
          { label: 'New Story' }
        ]}
        actions={
          <SecondaryButton href="/brand/stories" icon={ArrowLeft}>
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
            <h2 className="font-medium text-charcoal-deep">Story Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., The Art of Cannage"
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Story Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {storyTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, story_type: type.value })}
                    className={`p-3 border text-left transition-colors ${
                      formData.story_type === type.value
                        ? 'border-charcoal-deep bg-parchment'
                        : 'border-sand hover:border-charcoal-deep/50'
                    }`}
                  >
                    <p className={`text-sm font-medium ${formData.story_type === type.value ? 'text-charcoal-deep' : 'text-stone'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-taupe mt-0.5">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                required
                rows={2}
                maxLength={200}
                placeholder="A brief summary that appears in listings..."
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              />
              <p className="text-xs text-taupe mt-1">{formData.excerpt.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                Hero Image URL
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
                  <div className="w-20 h-12 bg-parchment flex-shrink-0">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h2 className="font-medium text-charcoal-deep">Content Sections</h2>
            <span className="text-sm text-taupe">{formData.content.length} section{formData.content.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-6 space-y-4">
            {formData.content.map((section, index) => (
              <div key={section.id} className="border border-sand p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.1em] uppercase text-taupe">
                    {section.type === 'text' ? 'Text Block' :
                     section.type === 'image' ? 'Image' :
                     section.type === 'quote' ? 'Quote' :
                     section.type === 'timeline' ? 'Timeline' : section.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="text-error hover:text-error/80 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {section.type === 'text' && (
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(index, { content: e.target.value })}
                    rows={4}
                    placeholder="Write your content..."
                    className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  />
                )}

                {section.type === 'image' && (
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={section.mediaUrl || ''}
                      onChange={(e) => updateSection(index, { mediaUrl: e.target.value })}
                      placeholder="Image URL..."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                    <input
                      type="text"
                      value={section.caption || ''}
                      onChange={(e) => updateSection(index, { caption: e.target.value })}
                      placeholder="Caption (optional)..."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                )}

                {section.type === 'quote' && (
                  <div className="space-y-3">
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(index, { content: e.target.value })}
                      rows={2}
                      placeholder="Quote text..."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                    />
                    <input
                      type="text"
                      value={section.caption || ''}
                      onChange={(e) => updateSection(index, { caption: e.target.value })}
                      placeholder="Attribution (e.g., John Smith, Creative Director)..."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                )}

                {section.type === 'timeline' && (
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(index, { content: e.target.value })}
                    rows={3}
                    placeholder="Timeline items separated by |, e.g.: 1947: Founded | 1960: Expansion | 2020: Innovation"
                    className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                  />
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-4 border-t border-sand/30">
              {sectionTypes.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addSection(type)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h2 className="font-medium text-charcoal-deep">Related Products</h2>
            <span className="text-sm text-taupe">{formData.product_list.length} selected</span>
          </div>
          <div className="p-6">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="animate-spin text-taupe" />
              </div>
            ) : products.length === 0 ? (
              <p className="text-sm text-taupe text-center py-4">No products available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                {products.map(product => {
                  const pid = String(product.product_id);
                  const isSelected = formData.product_list.includes(pid);
                  return (
                    <button
                      key={product.product_id}
                      type="button"
                      onClick={() => toggleProduct(pid)}
                      className={`flex items-center gap-2 p-2 border text-left transition-colors ${
                        isSelected
                          ? 'border-charcoal-deep bg-parchment'
                          : 'border-sand hover:border-charcoal-deep/50'
                      }`}
                    >
                      <div className="w-8 h-8 bg-parchment flex-shrink-0">
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <p className={`text-xs truncate ${isSelected ? 'text-charcoal-deep' : 'text-stone'}`}>
                        {product.product_name}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/brand/stories"
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
            disabled={isSubmitting || !formData.title || !formData.excerpt}
            className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="submit"
            onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
            disabled={isSubmitting || !formData.title || !formData.excerpt}
            className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
