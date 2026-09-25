import React, { useState } from 'react';
import {
  BookOpen,
  BookMarked,
  Layers,
  Sparkles,
  Hash,
  AlignJustify,
  FileText,
  Check,
  X,
  Palette,
  LayoutTemplate
} from 'lucide-react';
import { BookSettings, BookPageType, PDFPage } from '../types/pdf';
import { BOOK_PRESETS, BookStructureTemplate } from '../constants/bookPresets';
import { SupportedLanguage, translations } from '../constants/i18n';

interface BookStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookSettings: BookSettings;
  onUpdateBookSettings: (settings: BookSettings) => void;
  onApplyBookPreset: (preset: BookStructureTemplate) => void;
  onInsertBookPage: (type: BookPageType, title?: string) => void;
  currentPageIndex: number;
  language?: SupportedLanguage;
}

const PRESET_LOCALIZATIONS: Record<
  string,
  Record<SupportedLanguage, { name: string; category: string; description: string; badge: string }>
> = {
  novel_classic: {
    en: {
      name: 'Classic Literature & Novel',
      category: 'Fiction & Novel',
      description: 'Complete book structure: Elegant artistic cover, dedication page, literary introduction, and numbered chapters with alternating headers & footers.',
      badge: 'Best Seller'
    },
    ar: {
      name: 'رواية وأدب كلاسيكي (Novel)',
      category: 'رواية',
      description: 'هيكل كتاب كامل: غلاف فني أنيق، صفحة إهداء، مقدمة أدبية، وفصول مرقمة مع ترويسة وتذييل صفحات متناوب.',
      badge: 'الأكثر طلباً'
    },
    es: {
      name: 'Literatura Clásica y Novela',
      category: 'Novela',
      description: 'Estructura completa: Portada artística elegante, página de dedicatoria, introducción literaria y capítulos numerados con encabezados alternos.',
      badge: 'Más popular'
    },
    fr: {
      name: 'Littérature Classique et Roman',
      category: 'Roman',
      description: 'Structure complète : Couverture artistique élégante, page de dédicace, introduction littéraire et chapitres numérotés avec en-têtes alternés.',
      badge: 'Plus demandé'
    }
  },
  academic_research: {
    en: {
      name: 'Academic Research & University Book',
      category: 'Science & Education',
      description: 'Standard textbook format: University title page, detailed table of contents, executive summary, sections, and structured footnotes.',
      badge: 'Academic'
    },
    ar: {
      name: 'كتاب تعليمي / تدريبي جامعي',
      category: 'علمي وأكاديمي',
      description: 'تنسيق كتب ومقررات أكاديمية: صفحة غلاف موثقة، فهرس محتويات مفصل، ملخص تنفيذي، وأبواب مع هوامش مريحة للعين.',
      badge: 'أكاديمي'
    },
    es: {
      name: 'Investigación Académica y Libro Universitario',
      category: 'Educación',
      description: 'Formato estándar de libro de texto: Portada universitaria, índice detallado, resumen ejecutivo y capítulos con notas.',
      badge: 'Académico'
    },
    fr: {
      name: 'Recherche Académique et Livre Universitaire',
      category: 'Éducation',
      description: 'Format standard : Couverture universitaire, table des matières détaillée, résumé exécutif et chapitres structurés.',
      badge: 'Académique'
    }
  },
  self_development: {
    en: {
      name: 'Business & Self-Development Guide',
      category: 'Business & Growth',
      description: 'Modern non-fiction layout: Vibrant cover, key principles roadmap, actionable checklists, and chapter quote callouts.',
      badge: 'Business'
    },
    ar: {
      name: 'كتيب تعريفي وتقرير فاخر (Brochure / Report)',
      category: 'تطوير ذات وأعمال',
      description: 'تنسيق عصري ملون: غلاف تنفيذي معاصر، بطاقات ملونة للإحصائيات، أعمدة نصوص متوازنة، وأقسام بارزة.',
      badge: 'أعمال'
    },
    es: {
      name: 'Guía de Negocios y Desarrollo Personal',
      category: 'Negocios',
      description: 'Diseño moderno de no ficción: Portada vibrante, hoja de ruta de principios clave y llamadas visuales destacadas.',
      badge: 'Negocios'
    },
    fr: {
      name: 'Guide Entreprise et Développement Personnel',
      category: 'Affaires & Conseil',
      description: 'Mise en page moderne : Couverture dynamique, feuille de route des principes clés et encadrés d’action percutants.',
      badge: 'Entreprise'
    }
  }
};

export const BookStudioModal: React.FC<BookStudioModalProps> = ({
  isOpen,
  onClose,
  bookSettings,
  onUpdateBookSettings,
  onApplyBookPreset,
  onInsertBookPage,
  currentPageIndex,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'pages' | 'headers' | 'metadata'>('presets');
  const [chapterInputTitle, setChapterInputTitle] = useState('');
  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-neutral-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{t.bookStudioHeader}</h2>
              <p className="text-xs text-neutral-500">{t.bookStudioSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 px-6 bg-white overflow-x-auto shrink-0">
          {[
            { id: 'presets', label: t.presetsTab, icon: <BookMarked className="w-3.5 h-3.5" /> },
            { id: 'pages', label: t.pagesTab, icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
            { id: 'headers', label: t.headersTab, icon: <Hash className="w-3.5 h-3.5" /> },
            { id: 'metadata', label: t.metadataTab, icon: <FileText className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-700 bg-amber-50/30'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BOOK_PRESETS.map((preset) => {
                  const loc = PRESET_LOCALIZATIONS[preset.id]?.[language] || {
                    name: preset.name,
                    category: preset.category,
                    description: preset.description,
                    badge: preset.badge
                  };

                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        onApplyBookPreset(preset);
                        onClose();
                      }}
                      className="border border-neutral-200 hover:border-amber-500 rounded-xl p-4 bg-white hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {loc.category}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {preset.pages.length} {language === 'ar' ? 'صفحات' : 'pages'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900 group-hover:text-amber-700 transition-colors">
                          {loc.name}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-2 line-clamp-3 leading-relaxed">
                          {loc.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                        <span>{t.applyPresetBtn}</span>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SPECIALIZED BOOK PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">
                {t.insertBookPagePrompt.replace('{page}', String(currentPageIndex + 1))}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  {
                    type: 'cover' as BookPageType,
                    title: t.frontCoverTitle,
                    desc: t.frontCoverDesc
                  },
                  {
                    type: 'toc' as BookPageType,
                    title: t.tocTitle,
                    desc: t.tocDesc
                  },
                  {
                    type: 'chapter_start' as BookPageType,
                    title: t.chapterStartTitle,
                    desc: t.chapterStartDesc
                  },
                  {
                    type: 'body' as BookPageType,
                    title: t.bodyPageTitle,
                    desc: t.bodyPageDesc
                  },
                  {
                    type: 'dedication' as BookPageType,
                    title: t.dedicationTitle,
                    desc: t.dedicationDesc
                  },
                  {
                    type: 'back_cover' as BookPageType,
                    title: t.backCoverTitle,
                    desc: t.backCoverDesc
                  }
                ].map((item) => (
                  <div
                    key={item.type}
                    onClick={() => {
                      onInsertBookPage(item.type, chapterInputTitle || undefined);
                      onClose();
                    }}
                    className="p-3.5 border border-neutral-200 hover:border-amber-500 rounded-xl cursor-pointer hover:bg-amber-50/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900">{item.title}</h4>
                      <p className="text-[11px] text-neutral-500 mt-1">{item.desc}</p>
                    </div>
                    <button className="mt-3 text-[11px] text-amber-700 font-bold flex items-center gap-1">
                      <span>+ {t.insertPageBtn}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RUNNING HEADERS & NUMBERING */}
          {activeTab === 'headers' && (
            <div className="space-y-4 text-xs">
              {/* Pagination Controls */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900">{t.paginationSettings}</h4>
                    <p className="text-[11px] text-neutral-500">{t.enablePagination}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={bookSettings.pageNumberingEnabled}
                    onChange={(e) =>
                      onUpdateBookSettings({
                        ...bookSettings,
                        pageNumberingEnabled: e.target.checked
                      })
                    }
                    className="accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                {bookSettings.pageNumberingEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                    <div>
                      <label className="text-neutral-600 block mb-1">{t.numberPosition}</label>
                      <select
                        value={bookSettings.pageNumberPosition}
                        onChange={(e) =>
                          onUpdateBookSettings({
                            ...bookSettings,
                            pageNumberPosition: e.target.value as any
                          })
                        }
                        className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white"
                      >
                        <option value="bottom-center">{t.posBottomCenter}</option>
                        <option value="alternate">{t.posAlternate}</option>
                        <option value="bottom-right">{t.posBottomRight}</option>
                        <option value="bottom-left">{t.posBottomLeft}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-600 block mb-1">{t.numberFormat}</label>
                      <select
                        value={bookSettings.pageNumberFormat}
                        onChange={(e) =>
                          onUpdateBookSettings({
                            ...bookSettings,
                            pageNumberFormat: e.target.value as any
                          })
                        }
                        className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white font-mono"
                      >
                        <option value="1">1, 2, 3</option>
                        <option value="- 1 -">- 1 -, - 2 -</option>
                        <option value="1 / N">1 / Total (1 / 10)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bookSettings.skipNumberingOnCover}
                          onChange={(e) =>
                            onUpdateBookSettings({
                              ...bookSettings,
                              skipNumberingOnCover: e.target.checked
                            })
                          }
                          className="accent-amber-600 rounded"
                        />
                        <span className="text-neutral-700">{t.skipCoverNumbering}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Running Header Controls */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-900">{t.headerSettings}</h4>
                    <p className="text-[11px] text-neutral-500">{t.enableHeader}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={bookSettings.headerEnabled}
                    onChange={(e) =>
                      onUpdateBookSettings({
                        ...bookSettings,
                        headerEnabled: e.target.checked
                      })
                    }
                    className="accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                {bookSettings.headerEnabled && (
                  <div className="pt-2 border-t border-neutral-200">
                    <label className="text-neutral-600 block mb-1">{t.headerText}</label>
                    <input
                      type="text"
                      value={bookSettings.headerText}
                      onChange={(e) =>
                        onUpdateBookSettings({ ...bookSettings, headerText: e.target.value })
                      }
                      placeholder={bookSettings.bookTitle || 'Book Chapter Title'}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: METADATA & ISBN */}
          {activeTab === 'metadata' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">{t.bookTitle}</label>
                  <input
                    type="text"
                    value={bookSettings.bookTitle}
                    onChange={(e) =>
                      onUpdateBookSettings({ ...bookSettings, bookTitle: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">{t.subTitle}</label>
                  <input
                    type="text"
                    value={bookSettings.subTitle || ''}
                    onChange={(e) =>
                      onUpdateBookSettings({ ...bookSettings, subTitle: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">{t.authorName}</label>
                  <input
                    type="text"
                    value={bookSettings.authorName}
                    onChange={(e) =>
                      onUpdateBookSettings({ ...bookSettings, authorName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">{t.publisher}</label>
                  <input
                    type="text"
                    value={bookSettings.publisher || ''}
                    onChange={(e) =>
                      onUpdateBookSettings({ ...bookSettings, publisher: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-neutral-700 block mb-1 font-medium">{t.isbn}</label>
                  <input
                    type="text"
                    value={bookSettings.isbn || ''}
                    onChange={(e) =>
                      onUpdateBookSettings({ ...bookSettings, isbn: e.target.value })
                    }
                    placeholder="978-3-16-148410-0"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-xs shrink-0">
          <span className="text-neutral-500 font-sans">{t.brandName} Book Publishing Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
