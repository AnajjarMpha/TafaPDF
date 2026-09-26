import React, { useEffect, useRef } from 'react';
import { PlatformSiteSettings } from '../types/siteSettings';
import { DollarSign, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

interface AdUnitProps {
  slotType: 'top-banner' | 'sidebar-banner' | 'modal-banner';
  settings: PlatformSiteSettings;
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({ slotType, settings, className = '' }) => {
  const adRef = useRef<HTMLDivElement | null>(null);

  const isEnabled = settings.adsense.enabled;
  const isTestMode = settings.adsense.testMode;
  const publisherId = settings.adsense.publisherId?.trim();

  const slotId =
    slotType === 'top-banner'
      ? settings.adsense.adSlots.topBanner
      : slotType === 'sidebar-banner'
      ? settings.adsense.adSlots.sidebarBanner
      : settings.adsense.adSlots.exportModalBanner;

  useEffect(() => {
    if (isEnabled && !isTestMode && publisherId && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        // Adsbygoogle script might still be loading or restricted in sandbox
      }
    }
  }, [isEnabled, isTestMode, publisherId, slotId]);

  if (!isEnabled) {
    return null;
  }

  // Custom Ad snippet provided by user
  if (settings.adsense.customAdCode?.trim()) {
    return (
      <div
        className={`w-full overflow-hidden text-center my-2 ${className}`}
        dangerouslySetInnerHTML={{ __html: settings.adsense.customAdCode }}
      />
    );
  }

  // Test Mode / Preview Placeholder
  if (isTestMode || !publisherId) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 p-3 text-center transition-all hover:bg-neutral-100/80 ${className}`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
            <span className="flex items-center justify-center w-4 h-4 rounded bg-amber-500/10 text-amber-600">
              <DollarSign className="w-3 h-3" />
            </span>
            <span>Google AdSense Unit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-neutral-200 text-neutral-700">
              {slotType === 'top-banner' ? '728x90 Leaderboard' : slotType === 'sidebar-banner' ? '300x250 Medium' : '468x60 Banner'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 max-w-sm">
            {publisherId ? (
              <span className="font-mono text-neutral-700 font-semibold">{publisherId}</span>
            ) : (
              <span>(Publisher ID is not configured yet in Admin Settings)</span>
            )}
          </div>

          <div className="text-[10px] text-neutral-400 flex items-center gap-1">
            <span>Slot ID: {slotId || 'Auto-Responsive'}</span>
            <span>•</span>
            <span className="text-amber-600 font-medium">Preview Mode Active</span>
          </div>
        </div>
      </div>
    );
  }

  // Live Google AdSense Container
  return (
    <div ref={adRef} className={`w-full overflow-hidden text-center my-2 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId.startsWith('ca-pub-') ? publisherId : `ca-pub-${publisherId}`}
        data-ad-slot={slotId || undefined}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
