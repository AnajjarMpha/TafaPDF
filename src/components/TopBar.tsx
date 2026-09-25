import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FolderOpen,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Wrench,
  SquareDashedBottom,
  Globe,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations } from '../constants/i18n';

interface TopBarProps {
  documentTitle: string;
  onUpdateTitle: (title: string) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
  onOpenExportModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenUploadModal: () => void;
  onOpenToolsModal: () => void;
  onOpenBookStudioModal?: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  documentTitle,
  onUpdateTitle,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentPageIndex,
  totalPages,
  onPageChange,
  onOpenExportModal,
  onOpenTemplateModal,
  onOpenUploadModal,
  onOpenToolsModal,
  onOpenBookStudioModal,
  onSaveProject,
  onLoadProject,
  isFullscreen,
  onToggleFullscreen,
  language,
  onLanguageChange
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const t = translations[language] || translations.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
  };

  return (
    <header className="relative bg-white border-b border-neutral-200 select-none z-40">
      {/* Main Bar */}
      <div className="h-14 px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-3 max-w-full overflow-hidden">
        {/* Zone 1: Brand & Document Info */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          {/* Logo & Brand Name */}
          <a
            href="/"
            className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 flex items-center gap-1.5 sm:gap-2 group shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xs ring-1 ring-red-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3 0 1.12-.61 2.1-1.5 2.61V13c0 .55-.45 1-1 1s-1-.45-1-1v-1.39C10.61 11.1 10 10.12 10 9c0-1.66 1.34-3 2-3zm4.5 12h-9c-.55 0-1-.45-1-1s.45-1 1-1h9c.55 0 1 .45 1 1s-.45 1-1 1z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm sm:text-base tracking-tight text-neutral-950 font-sans flex items-center gap-0.5">
                {t.brandName}<span className="text-red-600">PDF</span>
                <span className="text-[9px] font-mono font-medium text-neutral-400 hidden xs:inline">{t.brandDomain}</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-medium text-neutral-500 hidden md:inline truncate max-w-[140px]">
                {t.brandSubtitle}
              </span>
            </div>
          </a>

          <div className="h-4 w-px bg-neutral-200 mx-0.5 sm:mx-1 hidden xs:block shrink-0" />

          {/* Editable Document Title */}
          <div className="flex items-center min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="px-1.5 py-0.5 text-xs border border-red-500 rounded bg-white text-neutral-900 focus:outline-hidden max-w-[120px] sm:max-w-[160px]"
                />
                <button
                  onClick={handleTitleSubmit}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempTitle(documentTitle);
                  setIsEditingTitle(true);
                }}
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-1.5 sm:px-2 py-1 rounded-md transition-colors truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[160px] md:max-w-[200px]"
                title={t.editTitleTooltip}
              >
                {documentTitle}
              </button>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation & Undo / Zoom Controls (Adaptive Center) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border border-neutral-200 rounded-lg p-0.5 bg-neutral-50 shrink-0">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-white transition-colors"
              title={t.undo}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-white transition-colors"
              title={t.redo}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Switcher */}
          <div className="flex items-center gap-0.5 sm:gap-1 border border-neutral-200 rounded-lg px-1 sm:px-1.5 py-0.5 sm:py-1 bg-neutral-50 text-xs shrink-0">
            <button
              onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="p-0.5 hover:text-neutral-900 text-neutral-500 disabled:opacity-30"
              title={t.prevPage}
            >
              {language === 'ar' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            <span className="font-mono tabular-nums font-semibold px-0.5 sm:px-1 text-neutral-800 text-[11px] sm:text-xs">
              {currentPageIndex + 1}/{totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === totalPages - 1}
              className="p-0.5 hover:text-neutral-900 text-neutral-500 disabled:opacity-30"
              title={t.nextPage}
            >
              {language === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Zoom Controls (hidden on very small viewports, visible sm+) */}
          <div className="hidden sm:flex items-center gap-0.5 sm:gap-1 border border-neutral-200 rounded-lg px-1 sm:px-1.5 py-0.5 sm:py-1 bg-neutral-50 text-xs shrink-0">
            <button
              onClick={() => onZoomChange(Math.max(0.4, Number((zoom - 0.1).toFixed(1))))}
              className="p-0.5 text-neutral-600 hover:text-neutral-900"
              title={t.zoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono tabular-nums text-[11px] sm:text-xs font-semibold px-0.5 text-neutral-800 min-w-7 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(2.0, Number((zoom + 0.1).toFixed(1))))}
              className="p-0.5 text-neutral-600 hover:text-neutral-900"
              title={t.zoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Zone 3: Language Selector, Export & Overflow Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors shadow-2xs shrink-0"
              title={t.switchLanguage}
            >
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden md:inline font-sans font-medium">{currentLangObj.name}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {showLangMenu && (
              <div
                className={`absolute top-full mt-1.5 ${
                  language === 'ar' ? 'left-0' : 'right-0'
                } w-44 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95`}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  {t.switchLanguage}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      language === lang.code
                        ? 'bg-red-50 text-red-700 font-bold'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save Button (hidden on mobile xs) */}
          <button
            onClick={onSaveProject}
            className="hidden sm:block p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            title={t.saveProject}
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Fullscreen Toggle (hidden on small viewports) */}
          <button
            onClick={onToggleFullscreen}
            className="hidden md:block p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            title={t.fullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Primary Export Action */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.exportPdf}</span>
          </button>

          {/* Mobile / Responsive Overflow Drawer Button */}
          <div className="relative" ref={mobileMenuRef}>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors md:hidden shrink-0"
              title={t.moreActions}
              aria-label={t.moreActions}
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Mobile / Compact Dropdown Panel */}
            {showMobileMenu && (
              <div
                className={`absolute top-full mt-2 ${
                  language === 'ar' ? 'left-0' : 'right-0'
                } w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-2.5 z-50 space-y-2 animate-in fade-in zoom-in-95`}
              >
                <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  {t.moreActions}
                </div>

                {/* Quick actions inside drawer */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onOpenUploadModal();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 text-red-600" />
                    <span>{t.openFile}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenToolsModal();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <Wrench className="w-4 h-4 text-neutral-600" />
                    <span>{t.pdfTools}</span>
                  </button>

                  {onOpenBookStudioModal && (
                    <button
                      onClick={() => {
                        onOpenBookStudioModal();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>{t.bookStudio}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenTemplateModal();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>{t.templates}</span>
                  </button>

                  <div className="pt-2 border-t border-neutral-100" />

                  <button
                    onClick={() => {
                      onSaveProject();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4 text-neutral-600" />
                    <span>{t.saveProject}</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleFullscreen();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4 text-red-600" /> : <Maximize2 className="w-4 h-4 text-neutral-600" />}
                    <span>{t.fullscreen}</span>
                  </button>
                </div>

                {/* Mobile Language Switcher Section */}
                <div className="pt-2 border-t border-neutral-100">
                  <div className="px-2 pb-1 text-[10px] font-bold text-neutral-400 uppercase">
                    {t.switchLanguage}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setShowMobileMenu(false);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          language === lang.code
                            ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                            : 'text-neutral-600 hover:bg-neutral-50 border border-transparent'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
