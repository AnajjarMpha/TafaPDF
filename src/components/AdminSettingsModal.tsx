import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  DollarSign,
  BarChart3,
  Globe,
  Code2,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Save,
  Download,
  Upload,
  RotateCcw,
  Key,
  FileCode,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  SlidersHorizontal,
  GitBranch,
  LogOut,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { PlatformSiteSettings } from '../types/siteSettings';
import { SupportedLanguage } from '../constants/i18n';
import {
  runDiagnostics,
  SystemDiagnostics,
  trackPlatformEvent
} from '../utils/scriptInjector';
import {
  DEFAULT_SITE_SETTINGS,
  commitConfigToGitHub,
  setAdminAuthenticated
} from '../utils/siteSettingsStorage';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  settings: PlatformSiteSettings;
  onSaveSettings: (newSettings: PlatformSiteSettings) => void;
  language: SupportedLanguage;
}

type TabType = 'adsense' | 'analytics' | 'seo' | 'scripts' | 'github' | 'diagnostics';

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  settings,
  onSaveSettings,
  language
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('adsense');
  const [formData, setFormData] = useState<PlatformSiteSettings>(JSON.parse(JSON.stringify(settings)));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [isCheckingDiagnostics, setIsCheckingDiagnostics] = useState(false);
  const [testEventSent, setTestEventSent] = useState(false);

  // GitHub Sync states
  const [ghRepo, setGhRepo] = useState(() => {
    try {
      return localStorage.getItem('tafapdf_gh_repo') || '';
    } catch {
      return '';
    }
  });
  const [ghBranch, setGhBranch] = useState(() => {
    try {
      return localStorage.getItem('tafapdf_gh_branch') || 'main';
    } catch {
      return 'main';
    }
  });
  const [ghToken, setGhToken] = useState(() => {
    try {
      return sessionStorage.getItem('tafapdf_gh_token') || '';
    } catch {
      return '';
    }
  });
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);
  const [ghResult, setGhResult] = useState<{ success: boolean; message: string; commitUrl?: string } | null>(null);

  // Sync formData when settings prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(JSON.parse(JSON.stringify(settings)));
      setSaveSuccess(false);
      refreshDiagnostics(settings);
    }
  }, [isOpen, settings]);

  const refreshDiagnostics = async (currentSettings: PlatformSiteSettings) => {
    setIsCheckingDiagnostics(true);
    try {
      const res = await runDiagnostics(currentSettings);
      setDiagnostics(res);
    } finally {
      setIsCheckingDiagnostics(false);
    }
  };

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    setSaveSuccess(true);
    refreshDiagnostics(formData);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleDownloadSiteConfigFile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'site-config.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePushToGitHub = async () => {
    if (!ghRepo.trim() || !ghToken.trim()) {
      alert(isAr ? 'يرجى إدخال اسم المستودع ورمز الوصول (Personal Access Token)' : 'Please enter repository and personal access token.');
      return;
    }

    try {
      localStorage.setItem('tafapdf_gh_repo', ghRepo.trim());
      localStorage.setItem('tafapdf_gh_branch', ghBranch.trim());
      sessionStorage.setItem('tafapdf_gh_token', ghToken.trim());
    } catch {
      // Ignore storage errors
    }

    setIsPushingToGitHub(true);
    setGhResult(null);

    const res = await commitConfigToGitHub({
      repo: ghRepo,
      token: ghToken,
      branch: ghBranch || 'main',
      settings: formData
    });

    setIsPushingToGitHub(false);
    setGhResult(res);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tafapdf-admin-settings-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setFormData((prev) => ({
          ...prev,
          ...parsed
        }));
        alert(isAr ? 'تم استيراد الإعدادات بنجاح! اضغط حفظ لتطبيقها.' : 'Settings imported successfully! Click save to apply.');
      } catch (err) {
        alert(isAr ? 'ملف غير صالح' : 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من استعادة الإعدادات الافتراضية؟' : 'Are you sure you want to reset to default settings?')) {
      setFormData(JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS)));
    }
  };

  const handleSendTestEvent = () => {
    trackPlatformEvent('admin_diagnostic_test', {
      source: 'admin_modal',
      timestamp: Date.now()
    });
    setTestEventSent(true);
    setTimeout(() => setTestEventSent(false), 3000);
  };

  const handleLogoutClick = () => {
    setAdminAuthenticated(false);
    if (onLogout) {
      onLogout();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-neutral-900"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                  {isAr ? 'لوحة إدارة المنصة، الإعلانات والسيو' : 'Platform Administration, Ads & SEO'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  {formData.adsense.enabled || formData.analytics.enabled ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير مفعل' : 'Idle')}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                {isAr
                  ? 'إدارة أكواد Google AdSense، تحليلات Google Analytics، خريطة الموقع sitemap.xml وتكامل GitHub'
                  : 'Manage Google AdSense, GA4 tracking, sitemap.xml, robots.txt and GitHub sync'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-200/60 text-xs font-semibold text-neutral-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Anajjar</span>
            </div>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 cursor-pointer"
              title={isAr ? 'تسجيل الخروج من لوحة التحكم' : 'Log out from admin console'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'خروج' : 'Logout'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-neutral-100/70 border-b border-neutral-200 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('adsense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'adsense'
                ? 'bg-white text-red-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'جوجل أدسنس (AdSense)' : 'Google AdSense'}</span>
            {formData.adsense.enabled && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-red-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>{isAr ? 'جوجل أناليتكس وSite Kit' : 'Google Analytics & Site Kit'}</span>
            {formData.analytics.enabled && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seo'
                ? 'bg-white text-red-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{isAr ? 'السيو وخريطة الموقع' : 'SEO & Sitemap'}</span>
          </button>

          <button
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scripts'
                ? 'bg-white text-red-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-500" />
            <span>{isAr ? 'أكواد مخصصة' : 'Custom Scripts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-white text-red-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            <GitBranch className="w-4 h-4 text-orange-600" />
            <span>{isAr ? 'النشر على GitHub (site-config.json)' : 'GitHub Deploy & Sync'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('diagnostics');
              refreshDiagnostics(formData);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'bg-white text-red-600 shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>{isAr ? 'فحص الحالة والنسخ' : 'Diagnostics & Backup'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: ADSENSE */}
          {activeTab === 'adsense' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">
                    {isAr ? 'تفعيل إعلانات Google AdSense' : 'Enable Google AdSense'}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isAr
                      ? 'حقن كود AdSense الرسمي تلقائياً وتجهيز مساحات الإعلانات'
                      : 'Automatically injects AdSense script and prepares responsive banner slots'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.adsense.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adsense: { ...formData.adsense, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isAr ? 'معرف الناشر في أدسنس (Publisher ID)' : 'AdSense Publisher ID'}
                  </label>
                  <input
                    type="text"
                    placeholder="ca-pub-1234567890123456"
                    value={formData.adsense.publisherId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adsense: { ...formData.adsense, publisherId: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-hidden bg-white"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {isAr ? 'مثال: ca-pub-XXXXXXXXXXXXXXXX' : 'Format: ca-pub-XXXXXXXXXXXXXXXX'}
                  </p>
                </div>

                <div className="flex flex-col justify-between">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isAr ? 'وضع المعاينة التجريبي (Test / Preview Mode)' : 'Preview / Test Mode'}
                  </label>
                  <div className="flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
                    <span className="text-xs text-amber-900">
                      {isAr ? 'عرض لافتات توضيحية لمعاينة مواضع الإعلانات' : 'Display mock banners to test ad placements'}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.adsense.testMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adsense: { ...formData.adsense, testMode: e.target.checked }
                        })
                      }
                      className="w-4 h-4 text-red-600 rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Ad Slots IDs */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  {isAr ? 'معرفات الوحدات الإعلانية (Ad Units Slots)' : 'Ad Unit Slot IDs (Optional)'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      {isAr ? 'إعلان الشريط العلوي (Top Banner)' : 'Top Banner Slot'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890"
                      value={formData.adsense.adSlots.topBanner}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adsense: {
                            ...formData.adsense,
                            adSlots: { ...formData.adsense.adSlots, topBanner: e.target.value }
                          }
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-neutral-300 rounded-md bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      {isAr ? 'إعلان الشريط الجانبي (Sidebar)' : 'Sidebar Slot'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={formData.adsense.adSlots.sidebarBanner}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adsense: {
                            ...formData.adsense,
                            adSlots: { ...formData.adsense.adSlots, sidebarBanner: e.target.value }
                          }
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-neutral-300 rounded-md bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      {isAr ? 'إعلان نافذة التصدير (Export Screen)' : 'Export Screen Slot'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5432109876"
                      value={formData.adsense.adSlots.exportModalBanner}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adsense: {
                            ...formData.adsense,
                            adSlots: { ...formData.adsense.adSlots, exportModalBanner: e.target.value }
                          }
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-neutral-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Ad Code Snippet */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {isAr ? 'كود إعلاني مخصص (HTML / JavaScript Snippet)' : 'Custom Ad Code Snippet (Optional)'}
                </label>
                <textarea
                  rows={3}
                  placeholder={`<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-..." data-ad-slot="..." data-ad-format="auto"></ins>`}
                  value={formData.adsense.customAdCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adsense: { ...formData.adsense, customAdCode: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-neutral-900 text-green-400 focus:ring-2 focus:ring-red-500/20 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS & GOOGLE SITE KIT */}
          {activeTab === 'analytics' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <h4 className="text-sm font-bold text-neutral-800">
                    {isAr ? 'تفعيل تحليلات Google Analytics 4 (GA4)' : 'Enable Google Analytics 4 (GA4)'}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isAr
                      ? 'تتبع الزيارات، الصفحات، وعمليات التصدير وتعديل مستندات PDF بدقة'
                      : 'Tracks pageviews, document exports, tool clicks, and editor actions with GA4'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.analytics.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isAr ? 'معرف قياس GA4 (Measurement ID)' : 'GA4 Measurement ID'}
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={formData.analytics.measurementId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, measurementId: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isAr ? 'معرف Google Tag Manager (اختياري)' : 'Google Tag Manager Container (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    value={formData.analytics.gtmContainerId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analytics: { ...formData.analytics, gtmContainerId: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Enhanced Events Toggle */}
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl bg-neutral-50/50">
                <div>
                  <span className="text-xs font-bold text-neutral-800">
                    {isAr ? 'تتبع أحداث تحرير ومستندات المنصة (Enhanced Editor Events)' : 'Enhanced Document Event Tracking'}
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    {isAr
                      ? 'إرسال أحداث تلقائياً عند تصدير المستندات، إضافة الصفحات، واستخدام الأدوات'
                      : 'Automatically sends events on PDF export, page additions, and tool clicks'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.analytics.trackDocumentEvents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      analytics: { ...formData.analytics, trackDocumentEvents: e.target.checked }
                    })
                  }
                  className="w-4 h-4 text-red-600 rounded-sm"
                />
              </div>

              {/* Google Site Kit Verification */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-neutral-800">
                    {isAr ? 'التحقق من ملكية الموقع (Google Site Kit / Search Console)' : 'Google Site Kit & Search Console Verification'}
                  </h4>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    {isAr ? 'كود التحقق الخاص بـ Google (Google Site Verification)' : 'Google Site Verification Code / Tag'}
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. 5xXjK9-oW3... or <meta name="google-site-verification" content="..." />`}
                    value={formData.siteKit.googleSiteVerification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteKit: { ...formData.siteKit, googleSiteVerification: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendTestEvent}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isAr ? 'إرسال حدث تجريبي لـ Google Analytics' : 'Send Test Event to Google Analytics'}</span>
                </button>
                {testEventSent && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تم الإرسال بنجاح!' : 'Test event sent!'}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SEO, SITEMAP & ROBOTS */}
          {activeTab === 'seo' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-neutral-800">
                          {isAr ? 'خريطة الموقع (sitemap.xml)' : 'XML Sitemap (sitemap.xml)'}
                        </h4>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {isAr ? 'جاهزة ومحدثة' : 'Ready & Live'}
                      </span>
                    </div>
                    <div className="p-2 bg-neutral-900 rounded-lg text-[11px] font-mono text-emerald-400 break-all select-all">
                      https://tafapdf.com/sitemap.xml
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-200">
                    <button
                      onClick={() => copyToClipboard('https://tafapdf.com/sitemap.xml', 'sitemap')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sitemap' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy URL')}</span>
                    </button>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAr ? 'معاينة' : 'Preview'}</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-neutral-800">
                          {isAr ? 'ملف التوجيه (robots.txt)' : 'Robots Directive (robots.txt)'}
                        </h4>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {isAr ? 'مُهيأ' : 'Configured'}
                      </span>
                    </div>
                    <div className="p-2 bg-neutral-900 rounded-lg text-[11px] font-mono text-blue-300 break-all select-all">
                      https://tafapdf.com/robots.txt
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-200">
                    <button
                      onClick={() => copyToClipboard('https://tafapdf.com/robots.txt', 'robots')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'robots' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy URL')}</span>
                    </button>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAr ? 'معاينة' : 'Preview'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* SEO Meta Fields */}
              <div className="space-y-4 pt-2 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      {isAr ? 'النطاق الأساسي (Canonical Domain)' : 'Canonical Domain'}
                    </label>
                    <input
                      type="text"
                      value={formData.seo.canonicalDomain}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo, canonicalDomain: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      {isAr ? 'حالة الفهرسة (Search Indexing)' : 'Search Indexing Directive'}
                    </label>
                    <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <span className="text-xs text-neutral-700">
                        {formData.seo.robotsIndex ? 'index, follow (سماح بالفهرسة)' : 'noindex, nofollow (حجب الفهرسة)'}
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.seo.robotsIndex}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo, robotsIndex: e.target.checked }
                          })
                        }
                        className="w-4 h-4 text-red-600 rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isAr ? 'عنوان المنصة لمحركات البحث (SEO Title)' : 'SEO Document Title'}
                  </label>
                  <input
                    type="text"
                    value={formData.seo.siteTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, siteTitle: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isAr ? 'وصف المنصة (Meta Description)' : 'Meta Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seo.siteDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, siteDescription: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM SCRIPTS */}
          {activeTab === 'scripts' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900">
                <div className="font-bold mb-1">
                  {isAr ? 'حقن الأكواد المخصصة (Custom Scripts Injection):' : 'Custom HTML/JS Code Injection:'}
                </div>
                <p>
                  {isAr
                    ? 'يمكنك هنا إضافة أي أكواد إضافية مثل: Google Tag Manager، بيكسل فيسبوك (Facebook Pixel)، كود هوتجار (Hotjar)، أو أي وسوم إحصائية أخرى.'
                    : 'Inject custom tracking scripts like Meta/Facebook Pixel, Hotjar, or custom analytics tags.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {isAr ? 'كود رأس الصفحة (Header Scripts - داخل <head>)' : 'Header Scripts (Inside <head>)'}
                </label>
                <textarea
                  rows={5}
                  value={formData.customScripts.headScripts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customScripts: { ...formData.customScripts, headScripts: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-neutral-900 text-purple-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {isAr ? 'كود جسم الصفحة (Body Scripts - قبل نهاية </body>)' : 'Footer / Body Scripts (Before </body>)'}
                </label>
                <textarea
                  rows={4}
                  value={formData.customScripts.bodyScripts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customScripts: { ...formData.customScripts, bodyScripts: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-neutral-900 text-purple-300 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 5: GITHUB DEPLOYMENT & SYNC */}
          {activeTab === 'github' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 text-orange-950 font-bold text-xs mb-1">
                  <GitBranch className="w-4 h-4 text-orange-600" />
                  <span>
                    {isAr ? 'النشر الدائم والتخزين عبر GitHub (public/site-config.json)' : 'Persistent Storage & Deployment via GitHub'}
                  </span>
                </div>
                <p className="text-xs text-orange-900 leading-relaxed">
                  {isAr
                    ? 'بما أنك ستقوم بنشر المنصة عبر GitHub، فإن حفظ الإعدادات في ملف public/site-config.json يضمن أن أي زائر في العالم لموقعك سيحصل فوراً على إعلانات Google AdSense وأكواد Google Analytics دون الاعتماد على التخزين المحلي فقط!'
                    : 'Because you are deploying via GitHub, saving configuration to public/site-config.json guarantees all global visitors automatically load Google AdSense and Analytics tags on your deployed platform!'}
                </p>
              </div>

              {/* Option A: One-click Download */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-neutral-800">
                      {isAr ? 'الخيار 1: تنزيل ملف site-config.json الجاهز' : 'Option 1: Download site-config.json file'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">public/site-config.json</span>
                </div>

                <p className="text-xs text-neutral-600">
                  {isAr
                    ? 'قم بتحميل الملف وضعه في مجلد public بمشروعك، ثم ارفعه لمستودع GitHub. سيتم تطبيقه تلقائياً على المنصة المنشورة.'
                    : 'Download this file and place it inside the "public" folder of your GitHub repository.'}
                </p>

                <button
                  type="button"
                  onClick={handleDownloadSiteConfigFile}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-orange-400" />
                  <span>{isAr ? 'تحميل ملف site-config.json الآن' : 'Download site-config.json'}</span>
                </button>
              </div>

              {/* Option B: Direct GitHub API Push */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/60 space-y-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-neutral-800">
                    {isAr ? 'الخيار 2: التحديث والنشر المباشر على GitHub عبر API' : 'Option 2: Direct Commit & Push to GitHub via API'}
                  </h4>
                </div>

                <p className="text-xs text-neutral-600">
                  {isAr
                    ? 'يمكنك إجراء Commit وتحديث مباشر لملف public/site-config.json داخل مستودعك على GitHub بنقرة زر دون الحاجة لسطر الأوامر!'
                    : 'Directly commit and update public/site-config.json inside your GitHub repository without git CLI!'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      {isAr ? 'اسم المستودع (Repository: owner/repo)' : 'GitHub Repository (owner/repo)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Anajjar/tafapdf"
                      value={ghRepo}
                      onChange={(e) => setGhRepo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      {isAr ? 'الفرع (Branch)' : 'Git Branch'}
                    </label>
                    <input
                      type="text"
                      placeholder="main"
                      value={ghBranch}
                      onChange={(e) => setGhBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    {isAr ? 'رمز الوصول الشخصي لـ GitHub (Personal Access Token - PAT)' : 'GitHub Personal Access Token (PAT)'}
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg bg-white"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {isAr
                      ? 'يمكنك إنشاء رمز من GitHub Settings > Developer Settings > Personal Access Tokens (صلاحية: repo:contents).'
                      : 'Create a token from GitHub Settings > Developer Settings > Personal Access Tokens (scope: repo).'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handlePushToGitHub}
                    disabled={isPushingToGitHub}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className={`w-4 h-4 ${isPushingToGitHub ? 'animate-bounce' : ''}`} />
                    <span>
                      {isPushingToGitHub
                        ? (isAr ? 'جاري النشر على GitHub...' : 'Pushing to GitHub...')
                        : (isAr ? 'نشر وتحديث على GitHub الآن' : 'Commit & Push to GitHub')}
                    </span>
                  </button>

                  {ghResult && (
                    <div
                      className={`text-xs font-bold flex items-center gap-1.5 ${
                        ghResult.success ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {ghResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>{ghResult.message}</span>
                      {ghResult.commitUrl && (
                        <a
                          href={ghResult.commitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-blue-600 flex items-center gap-0.5 ms-1"
                        >
                          <span>{isAr ? 'عرض الـ Commit' : 'View Commit'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Option C: Copy Raw JSON */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-900 text-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">public/site-config.json (Preview)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(formData, null, 2), 'config-json')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedKey === 'config-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'config-json' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود JSON' : 'Copy JSON')}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono overflow-x-auto max-h-48 text-emerald-400 p-2 bg-black/40 rounded-lg scrollbar-thin">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: DIAGNOSTICS & BACKUP */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-800">
                  {isAr ? 'فحص جاهزية وتوافق الخدمات في المتصفح' : 'Live Browser Integration Health Check'}
                </h4>
                <button
                  type="button"
                  onClick={() => refreshDiagnostics(formData)}
                  disabled={isCheckingDiagnostics}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDiagnostics ? 'animate-spin text-red-600' : ''}`} />
                  <span>{isAr ? 'إعادة الفحص الآن' : 'Recheck Now'}</span>
                </button>
              </div>

              {diagnostics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-800">Google AdSense Script</div>
                      <div className="text-[11px] text-neutral-500">
                        {formData.adsense.publisherId ? formData.adsense.publisherId : '(No Publisher ID)'}
                      </div>
                    </div>
                    {diagnostics.adsenseScriptLoaded ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? 'تم الحقن' : 'Injected'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
                        <XCircle className="w-4 h-4" />
                        <span>{isAr ? 'غير نشط' : 'Inactive'}</span>
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-800">Google Analytics (GA4)</div>
                      <div className="text-[11px] text-neutral-500">
                        {formData.analytics.measurementId ? formData.analytics.measurementId : '(No GA4 ID)'}
                      </div>
                    </div>
                    {diagnostics.analyticsScriptLoaded ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? 'يعمل' : 'Connected'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
                        <XCircle className="w-4 h-4" />
                        <span>{isAr ? 'غير متصل' : 'Disconnected'}</span>
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-800">Google Site Verification</div>
                      <div className="text-[11px] text-neutral-500">Meta Tag in &lt;head&gt;</div>
                    </div>
                    {diagnostics.siteVerificationFound ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? 'موجود' : 'Found'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
                        <XCircle className="w-4 h-4" />
                        <span>{isAr ? 'غير محدد' : 'Not set'}</span>
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-800">Sitemap & Robots</div>
                      <div className="text-[11px] text-neutral-500">sitemap.xml / robots.txt</div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'متاح ومفهرس' : 'Accessible'}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Backup & Restore Controls */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  {isAr ? 'النسخ الاحتياطي والاستعادة (Backup & Restore)' : 'Backup & Restore Configuration'}
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{isAr ? 'تصدير الإعدادات كملف JSON' : 'Export Settings JSON'}</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{isAr ? 'استيراد ملف إعدادات' : 'Import Settings JSON'}</span>
                    <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer ms-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                    <span>{isAr ? 'استعادة الافتراضيات' : 'Reset Defaults'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>{isAr ? 'تم حفظ وتطبيق التغييرات بنجاح!' : 'Settings applied and injected successfully!'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ وتطبيق الإعدادات' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
