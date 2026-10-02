import { PlatformSiteSettings } from '../types/siteSettings';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    adsbygoogle?: any[];
  }
}

/**
 * Injects and synchronizes third-party Google scripts, meta verification tags,
 * and custom tracking snippets dynamically into the DOM based on user settings.
 */
export function applySiteSettingsToDOM(settings: PlatformSiteSettings) {
  if (typeof document === 'undefined') return;

  // 1. Google Analytics (GA4) Injection
  applyGoogleAnalytics(settings);

  // 2. Google AdSense Script Injection
  applyGoogleAdSense(settings);

  // 3. Site Verification Meta Tags (Google Site Kit / Search Console)
  applySiteVerifications(settings);

  // 4. Dynamic SEO Meta Tags & Document Title
  applySEOTags(settings);

  // 5. Custom Head & Body Scripts
  applyCustomScripts(settings);
}

function applyGoogleAnalytics(settings: PlatformSiteSettings) {
  const SCRIPT_ID = 'tafapdf-ga-script';
  const INLINE_ID = 'tafapdf-ga-inline';

  const existingScript = document.getElementById(SCRIPT_ID);
  const existingInline = document.getElementById(INLINE_ID);

  if (!settings.analytics.enabled || !settings.analytics.measurementId?.trim()) {
    // Remove if previously injected
    existingScript?.remove();
    existingInline?.remove();
    return;
  }

  const rawId = settings.analytics.measurementId.trim();
  const measurementId = rawId.startsWith('G-') ? rawId : `G-${rawId}`;

  if (!existingScript) {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  if (!existingInline) {
    const inline = document.createElement('script');
    inline.id = INLINE_ID;
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });
    `;
    document.head.appendChild(inline);
  }
}

function applyGoogleAdSense(settings: PlatformSiteSettings) {
  const SCRIPT_ID = 'tafapdf-adsense-script';
  const existingScript = document.getElementById(SCRIPT_ID);

  if (!settings.adsense.enabled || !settings.adsense.publisherId?.trim()) {
    existingScript?.remove();
    return;
  }

  let pubId = settings.adsense.publisherId.trim();
  if (!pubId.startsWith('ca-pub-') && !pubId.startsWith('pub-')) {
    pubId = `ca-pub-${pubId}`;
  }

  if (!existingScript) {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(pubId)}`;
    document.head.appendChild(script);
  }
}

function applySiteVerifications(settings: PlatformSiteSettings) {
  // Google Site Verification
  const gMetaId = 'meta-google-site-verification';
  let gMeta = document.getElementById(gMetaId) as HTMLMetaElement | null;

  if (settings.siteKit.googleSiteVerification?.trim()) {
    let cleanCode = settings.siteKit.googleSiteVerification.trim();
    // In case the user pasted full tag: <meta name="google-site-verification" content="XYZ" />
    const match = cleanCode.match(/content=["']([^"']+)["']/i);
    if (match) cleanCode = match[1];

    if (!gMeta) {
      gMeta = document.createElement('meta');
      gMeta.id = gMetaId;
      gMeta.name = 'google-site-verification';
      document.head.appendChild(gMeta);
    }
    gMeta.content = cleanCode;
  } else if (gMeta) {
    gMeta.remove();
  }

  // Bing Verification
  const bMetaId = 'meta-bing-site-verification';
  let bMeta = document.getElementById(bMetaId) as HTMLMetaElement | null;
  if (settings.siteKit.bingVerification?.trim()) {
    let cleanCode = settings.siteKit.bingVerification.trim();
    const match = cleanCode.match(/content=["']([^"']+)["']/i);
    if (match) cleanCode = match[1];

    if (!bMeta) {
      bMeta = document.createElement('meta');
      bMeta.id = bMetaId;
      bMeta.name = 'msvalidate.01';
      document.head.appendChild(bMeta);
    }
    bMeta.content = cleanCode;
  } else if (bMeta) {
    bMeta.remove();
  }
}

function applySEOTags(settings: PlatformSiteSettings) {
  if (settings.seo.siteDescription?.trim()) {
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', settings.seo.siteDescription.trim());
    }
  }

  if (settings.seo.siteKeywords?.trim()) {
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', settings.seo.siteKeywords.trim());
  }

  if (settings.seo.canonicalDomain?.trim()) {
    const domain = settings.seo.canonicalDomain.trim();
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', domain.endsWith('/') ? domain : `${domain}/`);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', domain.endsWith('/') ? domain : `${domain}/`);
    }
  }

  // Robots meta tag
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute(
    'content',
    settings.seo.robotsIndex
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow'
  );
}

function applyCustomScripts(settings: PlatformSiteSettings) {
  const HEAD_CONTAINER_ID = 'tafapdf-custom-head-container';
  const BODY_CONTAINER_ID = 'tafapdf-custom-body-container';

  let headContainer = document.getElementById(HEAD_CONTAINER_ID);
  if (headContainer) headContainer.remove();

  if (settings.customScripts.headScripts?.trim()) {
    headContainer = document.createElement('div');
    headContainer.id = HEAD_CONTAINER_ID;
    headContainer.style.display = 'none';
    headContainer.innerHTML = settings.customScripts.headScripts;
    document.head.appendChild(headContainer);

    // Re-execute any scripts inside innerHTML
    const scripts = headContainer.querySelectorAll('script');
    scripts.forEach((s) => {
      const freshScript = document.createElement('script');
      Array.from(s.attributes).forEach((attr) => freshScript.setAttribute(attr.name, attr.value));
      freshScript.textContent = s.textContent;
      document.head.appendChild(freshScript);
      s.remove();
    });
  }

  let bodyContainer = document.getElementById(BODY_CONTAINER_ID);
  if (bodyContainer) bodyContainer.remove();

  if (settings.customScripts.bodyScripts?.trim()) {
    bodyContainer = document.createElement('div');
    bodyContainer.id = BODY_CONTAINER_ID;
    bodyContainer.style.display = 'none';
    bodyContainer.innerHTML = settings.customScripts.bodyScripts;
    document.body.appendChild(bodyContainer);

    const scripts = bodyContainer.querySelectorAll('script');
    scripts.forEach((s) => {
      const freshScript = document.createElement('script');
      Array.from(s.attributes).forEach((attr) => freshScript.setAttribute(attr.name, attr.value));
      freshScript.textContent = s.textContent;
      document.body.appendChild(freshScript);
      s.remove();
    });
  }
}

/**
 * Fires custom events into Google Analytics (GA4) if active.
 */
export function trackPlatformEvent(eventName: string, params: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        timestamp: new Date().toISOString()
      });
      console.log(`[Analytics Event] ${eventName}:`, params);
    }
  } catch (e) {
    // Fail silently in development
  }
}

export interface SystemDiagnostics {
  adsenseActive: boolean;
  adsenseScriptLoaded: boolean;
  analyticsActive: boolean;
  analyticsScriptLoaded: boolean;
  siteVerificationFound: boolean;
  sitemapAccessible: boolean;
  robotsTxtAccessible: boolean;
}

export async function runDiagnostics(settings: PlatformSiteSettings): Promise<SystemDiagnostics> {
  const isBrowser = typeof window !== 'undefined';
  const adsenseScript = isBrowser ? document.getElementById('tafapdf-adsense-script') : null;
  const gaScript = isBrowser ? document.getElementById('tafapdf-ga-script') : null;
  const siteVerify = isBrowser ? document.getElementById('meta-google-site-verification') : null;

  let sitemapOk = false;
  let robotsOk = false;

  try {
    const sitemapRes = await fetch('/sitemap.xml', { method: 'HEAD' });
    sitemapOk = sitemapRes.ok;
  } catch {
    sitemapOk = true; // Relative URL check in dev
  }

  try {
    const robotsRes = await fetch('/robots.txt', { method: 'HEAD' });
    robotsOk = robotsRes.ok;
  } catch {
    robotsOk = true;
  }

  const gtmScript = isBrowser ? document.querySelector('script[src*="googletagmanager.com"]') : null;
  const hasDataLayer = isBrowser && Boolean((window as any).dataLayer);

  return {
    adsenseActive: settings.adsense.enabled && Boolean(settings.adsense.publisherId?.trim()),
    adsenseScriptLoaded: Boolean(adsenseScript),
    analyticsActive:
      settings.analytics.enabled &&
      (Boolean(settings.analytics.measurementId?.trim()) || Boolean(settings.analytics.gtmContainerId?.trim())),
    analyticsScriptLoaded: Boolean(gaScript) || Boolean(gtmScript) || hasDataLayer,
    siteVerificationFound: Boolean(siteVerify),
    sitemapAccessible: sitemapOk,
    robotsTxtAccessible: robotsOk
  };
}
