'use client';

import { useState } from 'react';
import { Award, Check, MapPin, Clock, Shield, ChevronDown, Package, Droplets, Wrench } from 'lucide-react';
import type { FashionPassport as FashionPassportType } from '@/types';

interface FashionPassportProps {
  passport: FashionPassportType;
}

export default function FashionPassport({ passport }: FashionPassportProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-muted/20 rounded-full flex items-center justify-center">
            <Award size={20} className="text-gold-deep" />
          </div>
          <div className="text-left">
            <p className="font-medium text-charcoal-deep">Digital Fashion Passport</p>
            <p className="text-sm text-stone">Authenticity & provenance verified</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {passport.authenticity.verified && (
            <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full flex items-center gap-1">
              <Check size={12} />
              Verified
            </span>
          )}
          <ChevronDown
            size={20}
            className={`text-greige transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-sand pt-4 space-y-4">
          {/* Serial Number */}
          <div className="flex items-center justify-between p-3 bg-parchment rounded-lg">
            <span className="text-sm text-stone">Serial Number</span>
            <span className="font-mono text-sm text-charcoal-deep">{passport.serialNumber}</span>
          </div>

          {/* Authenticity */}
          <div className="p-4 bg-success/5 rounded-xl border border-success/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-success" />
              <p className="font-medium text-charcoal-deep">Authenticity</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-greige">Verified On</p>
                <p className="text-charcoal-deep">
                  {new Date(passport.authenticity.verifiedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-greige">Method</p>
                <p className="text-charcoal-deep">{passport.authenticity.verificationMethod}</p>
              </div>
            </div>
          </div>

          {/* Provenance */}
          <div className="p-4 bg-parchment rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-stone" />
              <p className="font-medium text-charcoal-deep">Provenance</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-greige">Created In</p>
                <p className="text-charcoal-deep">{passport.provenance.createdIn}</p>
              </div>
              <div>
                <p className="text-greige">Creation Date</p>
                <p className="text-charcoal-deep">
                  {new Date(passport.provenance.createdAt).toLocaleDateString()}
                </p>
              </div>
              {passport.provenance.artisans && (
                <div>
                  <p className="text-greige">Artisans Involved</p>
                  <p className="text-charcoal-deep">{passport.provenance.artisans}</p>
                </div>
              )}
              {passport.provenance.craftingHours && (
                <div>
                  <p className="text-greige">Crafting Hours</p>
                  <p className="text-charcoal-deep">{passport.provenance.craftingHours} hours</p>
                </div>
              )}
            </div>
          </div>

          {/* Materials */}
          <div className="p-4 bg-parchment rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Package size={18} className="text-stone" />
              <p className="font-medium text-charcoal-deep">Materials</p>
            </div>
            <div className="space-y-3">
              {passport.materials.map((material, index) => (
                <div key={index} className="flex items-start justify-between text-sm pb-3 border-b border-sand last:border-0 last:pb-0">
                  <div>
                    <p className="text-charcoal-deep">{material.name}</p>
                    <p className="text-greige">Origin: {material.origin}</p>
                  </div>
                  <div className="text-right">
                    {material.certification && (
                      <span className="inline-block px-2 py-0.5 bg-success/10 text-success text-xs rounded mb-1">
                        {material.certification}
                      </span>
                    )}
                    {material.sustainability && (
                      <p className="text-xs text-stone">{material.sustainability}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ownership */}
          <div className="p-4 bg-parchment rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-stone" />
              <p className="font-medium text-charcoal-deep">Ownership</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-greige">Current Owner</span>
                <span className="text-charcoal-deep">{passport.ownership.currentOwner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-greige">Purchase Date</span>
                <span className="text-charcoal-deep">
                  {new Date(passport.ownership.purchaseDate).toLocaleDateString()}
                </span>
              </div>
              {passport.ownership.transferHistory && passport.ownership.transferHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-sand">
                  <p className="text-greige mb-2">Transfer History</p>
                  {passport.ownership.transferHistory.map((transfer, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-stone">{transfer.type}</span>
                      <span className="text-stone">{new Date(transfer.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Care */}
          <div className="p-4 bg-parchment rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={18} className="text-stone" />
              <p className="font-medium text-charcoal-deep">Care & Servicing</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-greige">Servicing Available</span>
                <span className={passport.care.servicingAvailable ? 'text-success' : 'text-stone'}>
                  {passport.care.servicingAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              {passport.care.warrantyExpires && (
                <div className="flex justify-between">
                  <span className="text-greige">Warranty Expires</span>
                  <span className="text-charcoal-deep">
                    {new Date(passport.care.warrantyExpires).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-sand">
                <p className="text-greige mb-2">Care Instructions</p>
                <ul className="space-y-1">
                  {passport.care.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2 text-stone">
                      <Droplets size={14} className="text-greige mt-0.5 flex-shrink-0" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
