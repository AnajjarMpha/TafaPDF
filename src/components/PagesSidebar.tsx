import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Stamp as StampIcon,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Type,
  Image as ImageIcon,
  Square,
  PenTool,
  UploadCloud,
  Wrench,
  RotateCw,
  BookOpen
} from 'lucide-react';
import { PDFPage, PDFElement, StampElement } from '../types/pdf';
import { getLocalizedStamps, StampPreset } from '../constants/stamps';
import { TEMPLATES } from '../constants/templates';
import { SupportedLanguage, translations } from '../constants/i18n';

interface PagesSidebarProps {
  pages: PDFPage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onRotatePage: (index: number, degrees: number) => void;
  onAddStamp: (stamp: StampPreset) => void;
  onOpenTemplateModal: () => void;
  onOpenUploadModal: () => void;
  onOpenToolsModal: () => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PDFElement>) => void;
  onDeleteElement: (id: string) => void;
  language?: SupportedLanguage;
}

export const PagesSidebar: React.FC<PagesSidebarProps> = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onRotatePage,
  onAddStamp,
  onOpenTemplateModal,
  onOpenUploadModal,
  onOpenToolsModal,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'stamps' | 'layers'>('pages');
  const currentPage = pages[currentPageIndex] || pages[0];
  const t = translations[language] || translations.en;
  const localizedStamps = getLocalizedStamps(language);

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full shrink-0 select-none">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/50 p-1 gap-1">
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-1.5 px-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 truncate ${
            activeTab === 'pages'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="truncate">
            {language === 'ar' ? `الصفحات (${pages.length})` : language === 'es' ? `Páginas (${pages.length})` : language === 'fr' ? `Pages (${pages.length})` : `Pages (${pages.length})`}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('stamps')}
          className={`flex-1 py-1.5 px-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 truncate ${
            activeTab === 'stamps'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <StampIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{t.stampsTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 px-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 truncate ${
            activeTab === 'layers'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{t.layersTab}</span>
        </button>
      </div>

      {/* Tab 1: Pages Thumbnail View */}
      {activeTab === 'pages' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Add Page & Quick Tools Action */}
          <div className="p-2.5 border-b border-neutral-100 flex items-center justify-between gap-1">
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              title={t.openFileTitle}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{t.openFile}</span>
            </button>
            <button
              onClick={onAddPage}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addPage}</span>
            </button>
          </div>

          {/* Thumbnails List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pages.map((p, idx) => {
              const isCurrent = idx === currentPageIndex;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPage(idx)}
                  className={`group relative p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-red-600 bg-red-50/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Simulated miniature page preview */}
                    <div
                      className="w-14 h-20 bg-white border border-neutral-300 rounded shadow-2xs relative overflow-hidden flex flex-col justify-between shrink-0"
                      style={{
                        backgroundColor: p.backgroundColor || '#ffffff',
                        transform: p.rotation ? `rotate(${p.rotation}deg)` : undefined
                      }}
                    >
                      {p.backgroundImage ? (
                        <img
                          src={p.backgroundImage}
                          alt="preview"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <div className="p-1 space-y-1">
                          {p.elements.slice(0, 3).map((_, eIdx) => (
                            <div
                              key={eIdx}
                              className="h-1 bg-neutral-200 rounded-full w-full"
                            />
                          ))}
                        </div>
                      )}
                      <div className="text-[9px] font-mono text-neutral-400 text-center bg-white/90 border-t border-neutral-100 py-0.5">
                        A4 {p.rotation ? `(${p.rotation}°)` : ''}
                      </div>
                    </div>

                    {/* Page info & action buttons */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800">
                          {t.pageIndex.replace('{num}', String(idx + 1))}
                        </span>
                        <div className="flex items-center gap-1">
                          {p.pageType === 'cover' && (
                            <span className="text-[9px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                              {t.coverBadge}
                            </span>
                          )}
                          {p.pageType === 'toc' && (
                            <span className="text-[9px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.5 rounded">
                              {t.tocBadge}
                            </span>
                          )}
                          {p.pageType === 'chapter_start' && (
                            <span className="text-[9px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                              {t.chapterBadge}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] text-red-600 font-semibold bg-red-100 px-1.5 py-0.5 rounded">
                              {t.currentPageBadge}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                        {p.chapterTitle ? p.chapterTitle : t.elementsCount.replace('{count}', String(p.elements.length))}
                      </p>

                      {/* Quick rotate, reorder, duplicate and delete */}
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRotatePage(idx, 90);
                          }}
                          className="p-1 text-neutral-500 hover:text-red-600 rounded hover:bg-neutral-100"
                          title={t.rotate90}
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx > 0) onMovePage(idx, idx - 1);
                          }}
                          disabled={idx === 0}
                          className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-100"
                          title={t.moveUp}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx < pages.length - 1) onMovePage(idx, idx + 1);
                          }}
                          disabled={idx === pages.length - 1}
                          className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-100"
                          title={t.moveDown}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicatePage(idx);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
                          title={t.duplicatePage}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePage(idx);
                            }}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100"
                            title={t.deletePage}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Stamps Picker */}
      {activeTab === 'stamps' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          <div className="text-[11px] text-neutral-500 mb-2 font-medium">
            {t.stampClickHint}
          </div>
          {localizedStamps.map((stamp) => (
            <div
              key={stamp.id}
              onClick={() => onAddStamp(stamp)}
              className="p-3 border border-neutral-200 hover:border-neutral-400 rounded-xl cursor-pointer hover:shadow-xs transition-all bg-white flex flex-col items-center justify-center text-center"
            >
              <div
                className="px-4 py-1.5 rounded-lg border-2 font-black text-xs tracking-wider transform -rotate-2 uppercase"
                style={{
                  borderColor: stamp.borderColor || stamp.color,
                  color: stamp.color,
                  backgroundColor: `${stamp.color}10`
                }}
              >
                {stamp.title}
              </div>
              {stamp.subtitle && (
                <span className="text-[10px] text-neutral-400 mt-1 font-mono">
                  {stamp.subtitle}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Current Page Layers / Elements Tree */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 border-b border-neutral-100">
            <h3 className="text-xs font-bold text-neutral-800">
              {t.currentPageElements}
            </h3>
            <p className="text-[11px] text-neutral-500">
              {t.pageIndex.replace('{num}', String(currentPageIndex + 1))} ({currentPage.elements.length})
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {currentPage.elements.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                {t.noElementsOnPage}
              </div>
            ) : (
              currentPage.elements
                .slice()
                .reverse()
                .map((el) => {
                  const isSelected = selectedElementId === el.id;

                  const getIcon = () => {
                    switch (el.type) {
                      case 'text':
                        return <Type className="w-3.5 h-3.5 text-blue-500" />;
                      case 'image':
                        return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
                      case 'rect':
                      case 'circle':
                        return <Square className="w-3.5 h-3.5 text-purple-500" />;
                      case 'signature':
                        return <PenTool className="w-3.5 h-3.5 text-red-500" />;
                      case 'stamp':
                        return <StampIcon className="w-3.5 h-3.5 text-amber-500" />;
                      default:
                        return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
                    }
                  };

                  const getLabel = () => {
                    if (el.type === 'text') {
                      return el.text ? el.text.slice(0, 18) + (el.text.length > 18 ? '...' : '') : 'Text';
                    }
                    if (el.type === 'stamp') return `Stamp: ${el.text}`;
                    if (el.type === 'signature') return 'Signature';
                    if (el.type === 'image') return 'Image';
                    if (el.type === 'whiteout') return 'Whiteout';
                    if (el.type === 'rect') return 'Rectangle';
                    if (el.type === 'circle') return 'Circle';
                    if (el.type === 'draw') return el.isHighlighter ? 'Highlight' : 'Pen';
                    return 'Element';
                  };

                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement(el.id)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-red-50 text-red-900 border border-red-200 font-semibold'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getIcon()}
                        <span className="truncate">{getLabel()}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateElement(el.id, { locked: !el.locked });
                          }}
                          className={`p-1 rounded hover:bg-neutral-200 ${
                            el.locked ? 'text-red-600' : 'text-neutral-400'
                          }`}
                          title={el.locked ? t.unlockElement : t.lockElement}
                        >
                          {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteElement(el.id);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-neutral-200"
                          title={t.delete}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
