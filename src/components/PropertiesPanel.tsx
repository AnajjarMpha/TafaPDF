import React from 'react';
import {
  PDFElement,
  PDFPage,
  TextElement,
  ShapeElement,
  ImageElement,
  PDFDocument,
  PageMargins
} from '../types/pdf';
import {
  Sliders,
  Type,
  Maximize2,
  Layers,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Sun,
  ShieldAlert,
  Grid,
  MoveVertical,
  MoveHorizontal,
  SquareDashedBottom,
  BookOpen,
  BookMarked,
  Hash,
  Lock,
  Unlock
} from 'lucide-react';
import { SupportedLanguage, translations } from '../constants/i18n';

interface PropertiesPanelProps {
  selectedElement: PDFElement | null;
  currentPage: PDFPage;
  documentData: PDFDocument;
  onUpdateElement: (id: string, updates: Partial<PDFElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onUpdatePage: (updates: Partial<PDFPage>) => void;
  onUpdateWatermark: (watermark: PDFDocument['watermark']) => void;
  onUpdateMargins: (margins: PageMargins) => void;
  onUpdateBookSettings?: (settings: any) => void;
  onOpenBookStudio?: () => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  language?: SupportedLanguage;
}

const MARGIN_PRESETS: { id: string; name: string; top: number; bottom: number; left: number; right: number }[] = [
  { id: 'none', name: 'Zero Margins (0px)', top: 0, bottom: 0, left: 0, right: 0 },
  { id: 'narrow', name: 'Narrow (18px)', top: 18, bottom: 18, left: 18, right: 18 },
  { id: 'normal', name: 'Standard (36px)', top: 36, bottom: 36, left: 36, right: 36 },
  { id: 'wide', name: 'Wide (54px)', top: 54, bottom: 54, left: 54, right: 54 },
  { id: 'legal', name: 'Book Formal (72px)', top: 72, bottom: 72, left: 72, right: 72 }
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  currentPage,
  documentData,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onUpdatePage,
  onUpdateWatermark,
  onUpdateMargins,
  onUpdateBookSettings,
  onOpenBookStudio,
  showGrid,
  setShowGrid,
  language = 'en'
}) => {
  const t = translations[language] || translations.en;
  const margins = documentData.margins || {
    top: 36,
    bottom: 36,
    left: 36,
    right: 36,
    showGuides: false
  };

  return (
    <div className="w-72 bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 select-none overflow-y-auto">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-bold text-neutral-800">
            {selectedElement ? t.propertiesTitle : t.pageSettingsTitle}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* If an element is selected */}
        {selectedElement ? (
          <>
            {/* Dimensions and Coordinates */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {t.dimensions} (px)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">{t.width}</label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        width: Math.max(10, Number(e.target.value))
                      })
                    }
                    className="w-full px-2 py-1 border border-neutral-300 rounded font-mono text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">{t.height}</label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        height: Math.max(10, Number(e.target.value))
                      })
                    }
                    className="w-full px-2 py-1 border border-neutral-300 rounded font-mono text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">{t.posX}</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        x: Number(e.target.value)
                      })
                    }
                    className="w-full px-2 py-1 border border-neutral-300 rounded font-mono text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-0.5">{t.posY}</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        y: Number(e.target.value)
                      })
                    }
                    className="w-full px-2 py-1 border border-neutral-300 rounded font-mono text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Opacity */}
              <div className="pt-2">
                <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                  <span>{t.opacity}</span>
                  <span className="font-mono">
                    {Math.round((selectedElement.opacity ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedElement.opacity ?? 1}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })
                  }
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                  <span>{t.rotation}</span>
                  <span className="font-mono">{selectedElement.rotation || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={selectedElement.rotation || 0}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })
                  }
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Text Specific Settings */}
            {selectedElement.type === 'text' && (
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  {t.bookTypography}
                </span>

                {/* Font Family Selector in Properties Panel */}
                <div>
                  <label className="text-[11px] text-neutral-600 block mb-1">{t.arabicFont}</label>
                  <select
                    value={(selectedElement as TextElement).fontFamily || 'Cairo'}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { fontFamily: e.target.value })
                    }
                    className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans {language === 'ar' ? '(لاتيني عصري)' : '(Modern Latin)'}</option>
                    <option value="Arial">Arial {language === 'ar' ? '(قياسي)' : '(Standard)'}</option>
                    <option value="Cairo">Cairo {language === 'ar' ? '(كايْرو عصري)' : '(Modern Arabic/Latin)'}</option>
                    <option value="Amiri">Amiri {language === 'ar' ? '(أميري كلاسيكي وروايات)' : '(Classic Serif / Books)'}</option>
                    <option value="Tajawal">Tajawal {language === 'ar' ? '(تجوال مريح للكتب)' : '(Clean Book Sans)'}</option>
                    <option value="Courier New">Courier New {language === 'ar' ? '(آلة كاتبة)' : '(Typewriter / Mono)'}</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                    <span>{t.lineHeight}</span>
                    <span className="font-mono">
                      {(selectedElement as TextElement).lineHeight || 1.6}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.1"
                    value={(selectedElement as TextElement).lineHeight || 1.6}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { lineHeight: Number(e.target.value) })
                    }
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                {/* Paragraph Indent (Special for Books) */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                    <span>{t.paragraphIndent}</span>
                    <span className="font-mono">
                      {(selectedElement as TextElement).paragraphIndent || 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="4"
                    value={(selectedElement as TextElement).paragraphIndent || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { paragraphIndent: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* Letter Spacing */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                    <span>{t.letterSpacing}</span>
                    <span className="font-mono">
                      {(selectedElement as TextElement).letterSpacing || 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="6"
                    step="0.5"
                    value={(selectedElement as TextElement).letterSpacing || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { letterSpacing: Number(e.target.value) })
                    }
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">{t.textBgColor}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={(selectedElement as TextElement).backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })
                      }
                      className="w-6 h-6 border rounded cursor-pointer p-0"
                    />
                    <button
                      onClick={() =>
                        onUpdateElement(selectedElement.id, { backgroundColor: 'transparent' })
                      }
                      className="text-[10px] text-neutral-400 hover:text-neutral-700 underline"
                    >
                      {t.removeBg}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shape Specific Settings */}
            {(selectedElement.type === 'rect' || selectedElement.type === 'circle') && (
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Border & Fill
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Border Style:</span>
                  <select
                    value={(selectedElement as ShapeElement).borderStyle || 'solid'}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        borderStyle: e.target.value as any
                      })
                    }
                    className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>
            )}

            {/* Quick Actions (Duplicate & Delete & Lock) */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Actions
              </span>

              <button
                onClick={() =>
                  onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })
                }
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
              >
                {selectedElement.locked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-red-600" />
                    <span>{t.unlockElement}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.lockElement}</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => onDuplicateElement(selectedElement.id)}
                  className="flex items-center justify-center gap-1.5 p-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-semibold text-neutral-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.duplicate}</span>
                </button>
                <button
                  onClick={() => onDeleteElement(selectedElement.id)}
                  className="flex items-center justify-center gap-1.5 p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.delete}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Document & Page Settings when nothing is selected */
          <>
            {/* Page Margins Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <SquareDashedBottom className="w-3.5 h-3.5 text-red-600" />
                  <span>{t.marginsGuides}</span>
                </span>
              </div>

              {/* Margins Quick Presets */}
              <div className="grid grid-cols-1 gap-1.5">
                {MARGIN_PRESETS.map((preset) => {
                  const isSelected =
                    margins.top === preset.top &&
                    margins.bottom === preset.bottom &&
                    margins.left === preset.left &&
                    margins.right === preset.right;

                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateMargins({
                          ...margins,
                          top: preset.top,
                          bottom: preset.bottom,
                          left: preset.left,
                          right: preset.right
                        })
                      }
                      className={`text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-1 ring-red-400'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span>{preset.name}</span>
                      <span className="font-mono text-[10px] opacity-60">
                        {preset.top}px
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Toggle Visual Margin Guides */}
              <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer mt-2">
                <div className="flex items-center gap-2 text-neutral-800">
                  <SquareDashedBottom className="w-4 h-4 text-red-500" />
                  <span className="text-[11px]">{t.showGuides}</span>
                </div>
                <input
                  type="checkbox"
                  checked={margins.showGuides}
                  onChange={(e) =>
                    onUpdateMargins({ ...margins, showGuides: e.target.checked })
                  }
                  className="accent-red-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Page Background */}
            <div className="space-y-2 pt-3 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {t.pageBackground}
              </span>
              <div className="flex items-center gap-2">
                {['#ffffff', '#f8fafc', '#fafaf9', '#fefce8', '#f0fdf4'].map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdatePage({ backgroundColor: color })}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full border border-neutral-300 transition-transform ${
                      currentPage.backgroundColor === color
                        ? 'scale-110 ring-2 ring-red-500'
                        : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Grid & Alignment Guides */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {t.gridOverlay}
              </span>
              <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                <div className="flex items-center gap-2 text-neutral-800">
                  <Grid className="w-4 h-4 text-neutral-500" />
                  <span>{t.showGrid}</span>
                </div>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="accent-red-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Watermark Settings */}
            <div className="pt-3 border-t border-neutral-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  {t.watermark}
                </span>
                <input
                  type="checkbox"
                  checked={documentData.watermark?.enabled || false}
                  onChange={(e) =>
                    onUpdateWatermark({
                      ...(documentData.watermark || {
                        text: 'CONFIDENTIAL',
                        opacity: 0.15,
                        color: '#ef4444',
                        fontSize: 72,
                        rotation: -35
                      }),
                      enabled: e.target.checked
                    })
                  }
                  className="accent-red-600 rounded cursor-pointer"
                />
              </div>

              {documentData.watermark?.enabled && (
                <div className="p-3 bg-neutral-50 rounded-lg space-y-3 border border-neutral-200">
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">
                      {t.watermarkText}
                    </label>
                    <input
                      type="text"
                      value={documentData.watermark.text}
                      onChange={(e) =>
                        onUpdateWatermark({
                          ...documentData.watermark!,
                          text: e.target.value
                        })
                      }
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                      <span>{t.watermarkOpacity}</span>
                      <span>{Math.round(documentData.watermark.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.4"
                      step="0.05"
                      value={documentData.watermark.opacity}
                      onChange={(e) =>
                        onUpdateWatermark({
                          ...documentData.watermark!,
                          opacity: Number(e.target.value)
                        })
                      }
                      className="w-full accent-red-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500">{t.watermarkColor}</span>
                    <input
                      type="color"
                      value={documentData.watermark.color}
                      onChange={(e) =>
                        onUpdateWatermark({
                          ...documentData.watermark!,
                          color: e.target.value
                        })
                      }
                      className="w-6 h-6 border rounded cursor-pointer p-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Book Settings Section */}
            <div className="pt-3 border-t border-neutral-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  {t.bookStudio}
                </span>
                {onOpenBookStudio && (
                  <button
                    onClick={onOpenBookStudio}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-bold underline"
                  >
                    {t.bookStudio}
                  </button>
                )}
              </div>

              {/* Quick Book Toggles */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-amber-950">{t.enablePagination}:</span>
                  <input
                    type="checkbox"
                    checked={documentData.bookSettings?.pageNumberingEnabled ?? false}
                    onChange={(e) =>
                      onUpdateBookSettings &&
                      onUpdateBookSettings({
                        ...(documentData.bookSettings || {
                          bookTitle: documentData.title.replace('.pdf', ''),
                          authorName: documentData.author || '',
                          headerEnabled: false,
                          headerText: '',
                          footerEnabled: true,
                          pageNumberingEnabled: true,
                          pageNumberFormat: '1',
                          pageNumberPosition: 'bottom-center',
                          skipNumberingOnCover: true
                        }),
                        pageNumberingEnabled: e.target.checked
                      })
                    }
                    className="accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-amber-950">{t.enableHeader}:</span>
                  <input
                    type="checkbox"
                    checked={documentData.bookSettings?.headerEnabled ?? false}
                    onChange={(e) =>
                      onUpdateBookSettings &&
                      onUpdateBookSettings({
                        ...(documentData.bookSettings || {
                          bookTitle: documentData.title.replace('.pdf', ''),
                          authorName: documentData.author || '',
                          headerEnabled: true,
                          headerText: '',
                          footerEnabled: true,
                          pageNumberingEnabled: true,
                          pageNumberFormat: '1',
                          pageNumberPosition: 'bottom-center',
                          skipNumberingOnCover: true
                        }),
                        headerEnabled: e.target.checked
                      })
                    }
                    className="accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                {onOpenBookStudio && (
                  <button
                    onClick={onOpenBookStudio}
                    className="w-full mt-1 py-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-300/80 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookMarked className="w-3.5 h-3.5 text-amber-800" />
                    <span>{t.bookStudioHeader}</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
