import { PlatformSiteSettings } from '../types/siteSettings';

const STORAGE_KEY = 'tafapdf_site_settings_v1';

export const DEFAULT_SITE_SETTINGS: PlatformSiteSettings = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  adsense: {
    enabled: false,
    publisherId: '',
    autoAdsEnabled: true,
    testMode: false,
    adSlots: {
      topBanner: '',
      exportModalBanner: '',
      sidebarBanner: ''
    },
    customAdCode: ''
  },
  analytics: {
    enabled: false,
    measurementId: '',
    gtmContainerId: '',
    trackDocumentEvents: true
  },
  siteKit: {
    googleSiteVerification: '',
    bingVerification: '',
    yandexVerification: ''
  },
  seo: {
    siteTitle: 'TafaPDF.com – Professional Book Studio & Advanced PDF Editor',
    siteDescription: 'Create, format and publish books, edit PDF documents, sign electronically, and export commercial print-ready files with ease.',
    siteKeywords: 'pdf editor, book studio, create pdf, edit pdf, sign pdf, merge pdf, split pdf, compress pdf, tafapdf, arabic pdf editor',
    canonicalDomain: 'https://tafapdf.com',
    robotsIndex: true,
    customRobotsTxt: `# Robots.txt for TafaPDF.com\nUser-agent: *\nAllow: /\nAllow: /sitemap.xml\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://tafapdf.com/sitemap.xml`,
    sitemapUrl: 'https://tafapdf.com/sitemap.xml'
  },
  customScripts: {
    headScripts: '',
    bodyScripts: ''
  },
  security: {
    adminPin: '',
    isPinRequired: false
  }
};

export function loadSiteSettings(): PlatformSiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      adsense: { ...DEFAULT_SITE_SETTINGS.adsense, ...(parsed.adsense || {}) },
      analytics: { ...DEFAULT_SITE_SETTINGS.analytics, ...(parsed.analytics || {}) },
      siteKit: { ...DEFAULT_SITE_SETTINGS.siteKit, ...(parsed.siteKit || {}) },
      seo: { ...DEFAULT_SITE_SETTINGS.seo, ...(parsed.seo || {}) },
      customScripts: { ...DEFAULT_SITE_SETTINGS.customScripts, ...(parsed.customScripts || {}) },
      security: { ...DEFAULT_SITE_SETTINGS.security, ...(parsed.security || {}) }
    };
  } catch (err) {
    console.error('Failed to load site settings from localStorage:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveSiteSettings(settings: PlatformSiteSettings): boolean {
  try {
    const toSave: PlatformSiteSettings = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (err) {
    console.error('Failed to save site settings to localStorage:', err);
    return false;
  }
}

export function resetSiteSettings(): PlatformSiteSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
  return DEFAULT_SITE_SETTINGS;
}
