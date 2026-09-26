export interface AdSenseSettings {
  enabled: boolean;
  publisherId: string; // e.g. "ca-pub-1234567890123456"
  autoAdsEnabled: boolean;
  testMode: boolean; // displays mock responsive ad banners for design/testing
  adSlots: {
    topBanner: string;
    exportModalBanner: string;
    sidebarBanner: string;
  };
  customAdCode: string; // optional raw AdSense unit script
}

export interface AnalyticsSettings {
  enabled: boolean;
  measurementId: string; // e.g. "G-XXXXXXXXXX"
  gtmContainerId: string; // e.g. "GTM-XXXXXXX"
  trackDocumentEvents: boolean; // track page edits, exports, tool usage
}

export interface SiteKitSettings {
  googleSiteVerification: string; // e.g. "xYz1234567890..."
  bingVerification: string;
  yandexVerification: string;
}

export interface SEOSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  canonicalDomain: string; // e.g. "https://tafapdf.com"
  robotsIndex: boolean;
  customRobotsTxt: string;
  sitemapUrl: string;
}

export interface CustomScriptsSettings {
  headScripts: string;
  bodyScripts: string;
}

export interface SecuritySettings {
  adminPin: string;
  isPinRequired: boolean;
}

export interface PlatformSiteSettings {
  version: number;
  lastUpdated: string;
  adsense: AdSenseSettings;
  analytics: AnalyticsSettings;
  siteKit: SiteKitSettings;
  seo: SEOSettings;
  customScripts: CustomScriptsSettings;
  security: SecuritySettings;
}
