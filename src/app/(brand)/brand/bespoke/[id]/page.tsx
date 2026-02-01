'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Circle,
  Ruler,
  Palette,
  Scissors,
  Mail,
  Camera,
  ChevronDown
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { BespokeOrderStatus, BespokeOrderType } from '@/types/uhni';

export default function BespokeOrderDetailPage() {
  const params = useParams();
  const { getBespokeOrderById, updateBespokeOrderStatus } = useBrand();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const orderId = params.id as string;
  const order = getBespokeOrderById(orderId);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Bespoke order not found</p>
        <Link
          href="/brand/bespoke"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Bespoke Orders
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: BespokeOrderStatus) => {
    switch (status) {
      case 'consultation':
        return 'bg-info/10 text-info';
      case 'design_approval':
        return 'bg-warning/10 text-warning';
      case 'production':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'fitting':
        return 'bg-champagne/30 text-gold-muted';
      case 'final_adjustments':
        return 'bg-info/10 text-info';
      case 'complete':
        return 'bg-success/10 text-success';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: BespokeOrderStatus) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeIcon = (type: BespokeOrderType) => {
    switch (type) {
      case 'made_to_measure':
        return Ruler;
      case 'custom_design':
        return Palette;
      case 'modification':
        return Scissors;
      default:
        return Scissors;
    }
  };

  const getTypeLabel = (type: BespokeOrderType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStepIcon = (status: 'completed' | 'current' | 'upcoming') => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-success" />;
      case 'current':
        return <Clock size={20} className="text-gold-deep" />;
      case 'upcoming':
        return <Circle size={20} className="text-taupe/40" />;
    }
  };

  const statusOptions: BespokeOrderStatus[] = [
    'consultation',
    'design_approval',
    'production',
    'fitting',
    'final_adjustments',
    'complete'
  ];

  const handleStatusUpdate = (newStatus: BespokeOrderStatus) => {
    setIsUpdating(true);
    updateBespokeOrderStatus(order.id, newStatus);
    setShowStatusDropdown(false);
    setTimeout(() => setIsUpdating(false), 500);
  };

  const TypeIcon = getTypeIcon(order.type);

  return (
    <div>
      <BrandPageHeader
        title={order.title}
        breadcrumbs={[
          { label: 'Bespoke Orders', href: '/brand/bespoke' },
          { label: order.id.toUpperCase() }
        ]}
        actions={
          <SecondaryButton href="/brand/bespoke" icon={ArrowLeft}>
            Back to Orders
          </SecondaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 flex items-center justify-between ${getStatusBadge(order.status)}`}>
          <div className="flex items-center gap-3">
            <TypeIcon size={20} />
            <div>
              <p className="text-sm font-medium">{getTypeLabel(order.type)}</p>
              <p className="text-xs opacity-80">Status: {getStatusLabel(order.status)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">
              Est. Completion: {formatDate(order.estimatedCompletion)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <h2 className="font-medium text-charcoal-deep">Order Timeline</h2>
                {/* Status Update Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
                  >
                    Update Status <ChevronDown size={14} />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-10">
                      {statusOptions.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-parchment transition-colors ${
                            order.status === status ? 'bg-parchment text-charcoal-deep' : 'text-stone'
                          }`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="relative">
                  {order.timeline.map((step, index) => (
                    <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        {getStepIcon(step.status)}
                        {index < order.timeline.length - 1 && (
                          <div className={`w-0.5 flex-1 mt-2 ${
                            step.status === 'completed' ? 'bg-success' : 'bg-sand'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`text-sm font-medium ${
                          step.status === 'current' ? 'text-charcoal-deep' : 'text-stone'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-taupe mt-0.5">{step.description}</p>
                        <p className="text-xs text-taupe mt-1">
                          {step.completedAt
                            ? `Completed: ${formatDate(step.completedAt)}`
                            : step.estimatedDate
                            ? `Estimated: ${formatDate(step.estimatedDate)}`
                            : ''}
                        </p>
                        {step.notes && (
                          <p className="text-xs text-stone mt-1 italic">{step.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Specifications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.specifications.reduce((groups, spec) => {
                    const existing = groups.find(g => g.category === spec.category);
                    if (existing) {
                      existing.specs.push(spec);
                    } else {
                      groups.push({ category: spec.category, specs: [spec] });
                    }
                    return groups;
                  }, [] as { category: string; specs: typeof order.specifications }[]).map(group => (
                    <div key={group.category}>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                        {group.category}
                      </p>
                      <div className="space-y-2">
                        {group.specs.map((spec, index) => (
                          <div key={index} className="flex items-start justify-between py-2 border-b border-sand/30 last:border-0">
                            <span className="text-sm text-stone">{spec.label}</span>
                            <div className="text-right">
                              <span className="text-sm text-charcoal-deep">{spec.value}</span>
                              {spec.notes && (
                                <p className="text-xs text-taupe">{spec.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Measurements */}
            {order.measurements && Object.keys(order.measurements).length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <Ruler size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Measurements</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(order.measurements).map(([key, value]) => (
                      <div key={key} className="text-center p-4 bg-parchment/30">
                        <p className="text-2xl font-display text-charcoal-deep">{value}</p>
                        <p className="text-[10px] tracking-[0.1em] uppercase text-taupe mt-1">
                          {key.charAt(0).toUpperCase() + key.slice(1)} (cm)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Images */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Progress Images</h2>
                </div>
                <button className="text-xs text-charcoal-deep hover:text-gold-muted transition-colors">
                  + Add Image
                </button>
              </div>
              <div className="p-6">
                {order.progressImages.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-sand">
                    <Camera size={32} className="mx-auto text-taupe/40 mb-2" />
                    <p className="text-sm text-taupe">No progress images yet</p>
                    <p className="text-xs text-taupe/60 mt-1">Upload images to share with the client</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {order.progressImages.map((img, index) => (
                      <div key={index} className="aspect-square bg-parchment">
                        <img
                          src={img}
                          alt={`Progress ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Order ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{order.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Last Updated</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(order.updatedAt)}</span>
                </div>
                <div className="pt-4 border-t border-sand/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-taupe uppercase tracking-wider">Total Price</span>
                    <span className="text-lg font-medium text-charcoal-deep">{formatCurrency(order.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe uppercase tracking-wider">Deposit Paid</span>
                    <span className="text-sm text-success">{formatCurrency(order.depositPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-taupe uppercase tracking-wider">Balance Due</span>
                    <span className="text-sm text-charcoal-deep">{formatCurrency(order.price - order.depositPaid)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Atelier Contact */}
            {order.atelierContact && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <Mail size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Atelier Contact</h2>
                </div>
                <div className="p-6">
                  <a
                    href={`mailto:${order.atelierContact}`}
                    className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
                  >
                    {order.atelierContact}
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Description</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-stone leading-relaxed">{order.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
