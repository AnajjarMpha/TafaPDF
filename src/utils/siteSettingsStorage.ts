import { PlatformSiteSettings } from '../types/siteSettings';

const STORAGE_KEY = 'tafapdf_site_settings_v1';
const SESSION_AUTH_KEY = 'tafapdf_admin_session_auth_v1';

export const ADMIN_CREDENTIALS = {
  username: 'Anajjar',
  password: '20121990Mph@'
};

export function verifyAdminCredentials(user: string, pass: string): boolean {
  return (
    user.trim().toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() &&
    pass === ADMIN_CREDENTIALS.password
  );
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(auth: boolean): void {
  try {
    if (auth) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'authenticated');
    } else {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    }
  } catch (err) {
    console.error(err);
  }
}

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
    enabled: true,
    measurementId: '',
    gtmContainerId: 'GTM-WV35DHZ2',
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
    canonicalDomain: 'https://app.tafapdf.com',
    robotsIndex: true,
    customRobotsTxt: `# Robots.txt for TafaPDF.com\nUser-agent: *\nAllow: /\nAllow: /sitemap.xml\nDisallow: /admin\nDisallow: /adminapp\nDisallow: /api/\n\nHost: https://app.tafapdf.com\nSitemap: https://app.tafapdf.com/sitemap.xml`,
    sitemapUrl: 'https://app.tafapdf.com/sitemap.xml'
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

/**
 * Fetches the bundled static site-config.json file from the repository/server.
 * This ensures that when the project is deployed to GitHub / GitHub Pages,
 * all global visitors get the saved Google AdSense and Analytics configurations!
 */
export async function fetchRemoteSiteConfig(): Promise<PlatformSiteSettings | null> {
  try {
    const res = await fetch('/site-config.json?v=' + Date.now(), {
      cache: 'no-cache',
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const remoteData = await res.json();
    if (remoteData && typeof remoteData === 'object' && remoteData.version) {
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...remoteData,
        adsense: { ...DEFAULT_SITE_SETTINGS.adsense, ...(remoteData.adsense || {}) },
        analytics: { ...DEFAULT_SITE_SETTINGS.analytics, ...(remoteData.analytics || {}) },
        siteKit: { ...DEFAULT_SITE_SETTINGS.siteKit, ...(remoteData.siteKit || {}) },
        seo: { ...DEFAULT_SITE_SETTINGS.seo, ...(remoteData.seo || {}) },
        customScripts: { ...DEFAULT_SITE_SETTINGS.customScripts, ...(remoteData.customScripts || {}) },
        security: { ...DEFAULT_SITE_SETTINGS.security, ...(remoteData.security || {}) }
      };
    }
  } catch (err) {
    // Fail silently in development or offline
  }
  return null;
}

/**
 * Commits updated site-config.json directly to the user's GitHub repository
 * using the GitHub REST API. This allows updating production without running git commands.
 */
export async function commitConfigToGitHub(params: {
  repo: string; // e.g. "Anajjar/tafapdf"
  token: string; // GitHub Personal Access Token (PAT)
  branch?: string; // defaults to "main"
  settings: PlatformSiteSettings;
}): Promise<{ success: boolean; message: string; commitUrl?: string }> {
  const { repo, token, branch = 'main', settings } = params;
  const cleanRepo = repo.replace(/^https:\/\/github\.com\//i, '').replace(/\.git$/i, '').trim();

  if (!cleanRepo.includes('/')) {
    return { success: false, message: 'Invalid repository format. Please use "owner/repo" (e.g. Anajjar/tafapdf).' };
  }

  if (!token.trim()) {
    return { success: false, message: 'GitHub Personal Access Token is required.' };
  }

  const filePath = 'public/site-config.json';
  const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`;

  try {
    // Step 1: Check if file already exists to get its SHA
    let existingSha: string | undefined = undefined;
    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (getRes.ok) {
      const fileData = await getRes.json();
      existingSha = fileData.sha;
    }

    // Step 2: Format json content and base64 encode
    const jsonString = JSON.stringify(settings, null, 2);
    const contentBase64 = btoa(unescape(encodeURIComponent(jsonString)));

    // Step 3: PUT commit to GitHub
    const putRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'chore(config): update platform Google AdSense, Analytics & SEO settings',
        content: contentBase64,
        branch,
        sha: existingSha
      })
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      return {
        success: false,
        message: errData.message || `GitHub API error: ${putRes.status} ${putRes.statusText}`
      };
    }

    const commitResult = await putRes.json();
    return {
      success: true,
      message: 'Successfully committed site-config.json to GitHub!',
      commitUrl: commitResult.commit?.html_url
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error communicating with GitHub API.'
    };
  }
}
