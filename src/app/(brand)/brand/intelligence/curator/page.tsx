'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Globe,
  MessageSquare,
  FileText,
  Shield,
} from 'lucide-react';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

type ContentType = 'story_arc' | 'cultural_narrative' | 'product_description' | 'agi_response';
type CuratorStatus = 'pending_review' | 'approved' | 'rejected' | 'revision_needed';

interface CurationItem {
  id: string;
  title: string;
  contentType: ContentType;
  preview: string;
  status: CuratorStatus;
  confidenceScore: number;
  createdAt: string;
  author: string;
}

interface BrandVoiceSettings {
  tone: 'formal' | 'approachable' | 'playful' | 'authoritative';
  culturalBoundaries: { rule: string; type: 'allow' | 'avoid' }[];
  dignityGuidelines: string[];
}

const mockCurationQueue: CurationItem[] = [
  {
    id: 'cur-001',
    title: 'Spring 2026 Heritage Narrative',
    contentType: 'story_arc',
    preview: 'Rooted in the rolling hills of Tuscany, this collection draws upon three generations of artisanal mastery. Each thread carries the weight of tradition — reimagined for the modern connoisseur who values provenance above all.',
    status: 'pending_review',
    confidenceScore: 0.92,
    createdAt: '2026-03-15T10:30:00Z',
    author: 'AGI Content Engine',
  },
  {
    id: 'cur-002',
    title: 'Maison Artistry Campaign Copy',
    contentType: 'cultural_narrative',
    preview: 'Where East meets West in a dialogue of silk and structure. The Maison Artistry line celebrates cultural exchange without appropriation — a delicate balance achieved through consultation with textile historians and contemporary designers from both traditions.',
    status: 'pending_review',
    confidenceScore: 0.87,
    createdAt: '2026-03-14T16:45:00Z',
    author: 'AGI Content Engine',
  },
  {
    id: 'cur-003',
    title: 'Limited Edition Handbag Description',
    contentType: 'product_description',
    preview: 'The Belvedere clutch — hand-stitched from Italian nappa leather with 18k gold-plated hardware. Only 50 pieces exist worldwide. Each is numbered and accompanied by a certificate of authenticity signed by the master craftsman.',
    status: 'approved',
    confidenceScore: 0.95,
    createdAt: '2026-03-13T09:15:00Z',
    author: 'AGI Content Engine',
  },
  {
    id: 'cur-004',
    title: 'Client Inquiry Response Template',
    contentType: 'agi_response',
    preview: 'Thank you for your interest in our Private Collection. As a valued patron, you are invited to a preview event before the public launch. Our concierge team will reach out within 24 hours to arrange a private viewing at your convenience.',
    status: 'revision_needed',
    confidenceScore: 0.78,
    createdAt: '2026-03-12T14:00:00Z',
    author: 'AGI Response Module',
  },
  {
    id: 'cur-005',
    title: 'Autumn/Winter 2026 Story Arc',
    contentType: 'story_arc',
    preview: 'A meditation on impermanence and beauty. The A/W 2026 collection explores wabi-sabi through the lens of European tailoring — intentional imperfections in hand-finished garments that celebrate the human touch in an age of automation.',
    status: 'pending_review',
    confidenceScore: 0.89,
    createdAt: '2026-03-16T11:20:00Z',
    author: 'AGI Content Engine',
  },
  {
    id: 'cur-006',
    title: 'Sustainability Commitment Statement',
    contentType: 'cultural_narrative',
    preview: 'Our commitment to sustainability is not a marketing exercise — it is a responsibility we inherited from our founders. Every material decision is weighed against its environmental impact, and every supplier is held to the same exacting standards.',
    status: 'rejected',
    confidenceScore: 0.71,
    createdAt: '2026-03-11T08:30:00Z',
    author: 'AGI Content Engine',
  },
];

const mockVoiceSettings: BrandVoiceSettings = {
  tone: 'formal',
  culturalBoundaries: [
    { rule: 'Reference heritage and craftsmanship traditions', type: 'allow' },
    { rule: 'Discuss sustainability practices and certifications', type: 'allow' },
    { rule: 'Share artisan stories with consent', type: 'allow' },
    { rule: 'Compare brand directly against competitors', type: 'avoid' },
    { rule: 'Make unverified sustainability claims', type: 'avoid' },
    { rule: 'Use culturally appropriative language or imagery', type: 'avoid' },
    { rule: 'Reference political events or controversial figures', type: 'avoid' },
  ],
  dignityGuidelines: [
    'Maintain understated elegance in all communications — never oversell',
    'Respect client privacy — never reference purchase history in public-facing content',
    'Avoid superlatives unless factually verifiable (e.g., "the finest" requires proof)',
    'All cultural references must be reviewed by a cultural sensitivity advisor',
    'AGI-generated responses must never impersonate a human team member',
  ],
};

const getContentTypeConfig = (type: ContentType) => {
  switch (type) {
    case 'story_arc':
      return { label: 'Story Arc', className: 'bg-purple-100 text-purple-700', icon: BookOpen };
    case 'cultural_narrative':
      return { label: 'Cultural Narrative', className: 'bg-blue-100 text-blue-700', icon: Globe };
    case 'product_description':
      return { label: 'Product Description', className: 'bg-amber-100 text-amber-700', icon: FileText };
    case 'agi_response':
      return { label: 'AGI Response', className: 'bg-green-100 text-green-700', icon: MessageSquare };
  }
};

const getStatusConfig = (status: CuratorStatus) => {
  switch (status) {
    case 'pending_review':
      return { label: 'Pending Review', className: 'bg-gold-soft/10 text-gold-deep' };
    case 'approved':
      return { label: 'Approved', className: 'bg-success/10 text-success' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-red-100 text-red-700' };
    case 'revision_needed':
      return { label: 'Revision Needed', className: 'bg-amber-100 text-amber-700' };
  }
};

export default function CuratorStudioPage() {
  const [queue, setQueue] = useState<CurationItem[]>(mockCurationQueue);

  const activeCurations = queue.filter(i => i.status === 'pending_review' || i.status === 'revision_needed').length;
  const pendingReviews = queue.filter(i => i.status === 'pending_review').length;
  const publishedNarratives = queue.filter(i => i.status === 'approved').length;
  const avgConfidence = queue.length > 0
    ? Math.round((queue.reduce((sum, i) => sum + i.confidenceScore, 0) / queue.length) * 100)
    : 0;

  const handleApprove = (id: string) => {
    setQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'approved' as CuratorStatus } : item
    ));
  };

  const handleReject = (id: string) => {
    setQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'rejected' as CuratorStatus } : item
    ));
  };

  const handleRequestRevision = (id: string) => {
    setQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'revision_needed' as CuratorStatus } : item
    ));
  };

  return (
    <IntelligencePageWrapper
      title="Curator-in-the-Loop AGI Studio"
      subtitle="Approve and refine story arcs, cultural narratives, AGI response boundaries. Preview AGI behavior before public exposure."
      acronym="CILS™"
    >
      <div className="p-8 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Active Curations</p>
            <p className="font-display text-2xl text-charcoal-deep">{activeCurations}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Pending Reviews</p>
            <p className="font-display text-2xl text-charcoal-deep">{pendingReviews}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Published Narratives</p>
            <p className="font-display text-2xl text-charcoal-deep">{publishedNarratives}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Brand Tone Score</p>
            <p className="font-display text-2xl text-charcoal-deep">{avgConfidence}%</p>
          </div>
        </div>

        {/* Curation Queue */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={20} className="text-gold-muted" />
            <h2 className="font-medium text-charcoal-deep">Curation Queue</h2>
          </div>
          <div className="space-y-4">
            {queue.map(item => {
              const typeConfig = getContentTypeConfig(item.contentType);
              const statusConfig = getStatusConfig(item.status);
              const TypeIcon = typeConfig.icon;

              return (
                <div key={item.id} className="bg-white border border-sand/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${typeConfig.className}`}>
                          <TypeIcon size={12} />
                          {typeConfig.label}
                        </span>
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <h3 className="font-display text-lg text-charcoal-deep">{item.title}</h3>
                      <p className="text-xs text-taupe mt-1">
                        {item.author} &middot; {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">AI Confidence</p>
                      <p className="font-display text-xl text-charcoal-deep">{Math.round(item.confidenceScore * 100)}%</p>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="bg-parchment/50 border border-sand/30 p-4 mb-4">
                    <p className="text-sm text-charcoal-deep leading-relaxed italic">
                      &ldquo;{item.preview}&rdquo;
                    </p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-4">
                    <div className="h-1.5 bg-parchment overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.confidenceScore >= 0.9 ? 'bg-success' :
                          item.confidenceScore >= 0.8 ? 'bg-gold-muted' : 'bg-error'
                        }`}
                        style={{ width: `${item.confidenceScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {item.status === 'pending_review' && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestRevision(item.id)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-sand text-charcoal-deep text-xs tracking-[0.1em] uppercase hover:border-charcoal-deep transition-colors"
                      >
                        <RotateCcw size={14} />
                        Request Revision
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-sand text-stone text-xs tracking-[0.1em] uppercase hover:border-error hover:text-error transition-colors"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                  {item.status === 'revision_needed' && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-sand text-stone text-xs tracking-[0.1em] uppercase hover:border-error hover:text-error transition-colors"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                  {(item.status === 'approved' || item.status === 'rejected') && (
                    <div className="flex items-center gap-2 text-xs text-taupe">
                      {item.status === 'approved' ? (
                        <><CheckCircle size={12} className="text-success" /> Approved and published</>
                      ) : (
                        <><XCircle size={12} className="text-error" /> Rejected — will not be published</>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Voice Settings */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Shield size={20} className="text-gold-muted" />
            <h2 className="font-medium text-charcoal-deep">Brand Voice Settings</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tone Selector */}
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-4">Current Tone</p>
              <div className="grid grid-cols-2 gap-3">
                {(['formal', 'approachable', 'playful', 'authoritative'] as const).map(tone => (
                  <div
                    key={tone}
                    className={`p-4 border text-center ${
                      mockVoiceSettings.tone === tone
                        ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                        : 'border-sand text-stone'
                    }`}
                  >
                    <span className="text-sm tracking-[0.1em] uppercase capitalize">{tone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Boundaries */}
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-4">Cultural Boundaries</p>
              <div className="space-y-2">
                {mockVoiceSettings.culturalBoundaries.map((boundary, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2">
                    <span className={`mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center text-[10px] ${
                      boundary.type === 'allow'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {boundary.type === 'allow' ? '✓' : '✕'}
                    </span>
                    <span className="text-sm text-charcoal-deep">{boundary.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dignity Guidelines */}
          <div className="bg-white border border-sand/50 p-6 mt-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-4">Dignity Guidelines</p>
            <div className="space-y-3">
              {mockVoiceSettings.dignityGuidelines.map((guideline, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2 border-b border-sand/30 last:border-0">
                  <span className="mt-0.5 w-6 h-6 bg-parchment flex items-center justify-center text-xs text-stone flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-charcoal-deep leading-relaxed">{guideline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </IntelligencePageWrapper>
  );
}
