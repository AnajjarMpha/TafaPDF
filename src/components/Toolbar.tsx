import React, { useRef } from 'react';
import {
  MousePointer,
  Hand,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Minus,
  PenTool,
  Highlighter,
  Pencil,
  Stamp,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  ChevronDown,
  Trash2,
  Copy,
  Layers,
  Eraser,
  UploadCloud,
  Wrench,
  SquareDashedBottom,
  BookOpen
} from 'lucide-react';
import { ToolType, PDFElement, TextElement, ShapeElement } from '../types/pdf';
import { SupportedLanguage, translations } from '../constants/i18n';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  selectedElement: PDFElement | null;
  onUpdateElement: (id: string, updates: Partial<PDFElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onAddText: (variant: 'heading' | 'subheading' | 'body') => void;
  onAddShape: (shape: 'rect' | 'circle' | 'line') => void;
  onUploadImage: (file: File) => void;
  onOpenSignatureModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenUploadModal: () => void;
  onOpenToolsModal: () => void;
  onOpenBookStudioModal: () => void;
  language?: SupportedLanguage;
}

const getFonts = (lang: SupportedLanguage) => [
  { id: 'Plus Jakarta Sans', name: lang === 'ar' ? 'Plus Jakarta Sans (لاتيني عصري)' : 'Plus Jakarta Sans (Modern Latin)' },
  { id: 'Arial', name: lang === 'ar' ? 'Arial (قياسي)' : 'Arial (Standard)' },
  { id: 'Cairo', name: lang === 'ar' ? 'Cairo (عصري متناسق)' : 'Cairo (Modern Arabic/Latin)' },
  { id: 'Amiri', name: lang === 'ar' ? 'Amiri (أميري كلاسيكي وروايات)' : 'Amiri (Classic Serif / Books)' },
  { id: 'Tajawal', name: lang === 'ar' ? 'Tajawal (تجوال مريح للكتب)' : 'Tajawal (Clean Book Sans)' },
  { id: 'Courier New', name: lang === 'ar' ? 'Courier New (آلة كاتبة)' : 'Courier New (Typewriter / Mono)' }
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onAddText,
  onAddShape,
  onUploadImage,
  onOpenSignatureModal,
  onOpenTemplateModal,
  onOpenUploadModal,
  onOpenToolsModal,
  onOpenBookStudioModal,
  language = 'en'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showShapeMenu, setShowShapeMenu] = React.useState(false);
  const [showTextMenu, setShowTextMenu] = React.useState(false);

  const t = translations[language] || translations.en;

  const isTextSelected = selectedElement?.type === 'text';
  const textEl = isTextSelected ? (selectedElement as TextElement) : null;
  const isShapeSelected = selectedElement?.type === 'rect' || selectedElement?.type === 'circle';
  const shapeEl = isShapeSelected ? (selectedElement as ShapeElement) : null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  return (
    <div className="bg-white border-b border-neutral-200 shadow-xs z-30 select-none">
      {/* Top Main Tool Ribbon (Fully responsive, no scrollbars or inner frames) */}
      <div className="flex flex-wrap items-center justify-between px-2 sm:px-4 py-1.5 gap-1.5 sm:gap-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {/* Upload Document File Button */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors shrink-0"
            title={t.openFileTitle}
          >
            <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t.openFile}</span>
          </button>

          {/* PDF Tools Modal */}
          <button
            onClick={onOpenToolsModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200 shrink-0"
            title={t.pdfToolsTitle}
          >
            <Wrench className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden xs:inline">{t.pdfTools}</span>
          </button>

          <div className="h-5 w-px bg-neutral-200 mx-0.5 sm:mx-1 shrink-0" />

          {/* Select Tool */}
          <button
            onClick={() => setActiveTool('select')}
            title={`${t.selectTool} (V)`}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTool === 'select'
                ? 'bg-red-50 text-red-700 ring-1 ring-red-400 font-bold'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">{t.selectTool}</span>
          </button>

          {/* Hand Tool */}
          <button
            onClick={() => setActiveTool('hand')}
            title={`${t.handTool} (H)`}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTool === 'hand'
                ? 'bg-red-50 text-red-700 ring-1 ring-red-400 font-bold'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">{t.handTool}</span>
          </button>

          <div className="h-5 w-px bg-neutral-200 mx-0.5 sm:mx-1 shrink-0" />

          {/* Add Text Tool */}
          <div className="relative flex items-center shrink-0">
            <button
              onClick={() => {
                setActiveTool(activeTool === 'text' ? 'select' : 'text');
              }}
              title={t.textMenu}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold rounded-l-lg transition-colors ${
                activeTool === 'text'
                  ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-500 shadow-xs'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Type className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTool === 'text' ? 'text-white' : 'text-blue-600'}`} />
              <span className="hidden sm:inline">{t.textMenu}</span>
            </button>
            <button
              onClick={() => setShowTextMenu(!showTextMenu)}
              className={`p-1 sm:p-1.5 border-l border-neutral-200 rounded-r-lg hover:bg-neutral-100 ${
                activeTool === 'text' ? 'bg-blue-700 text-white' : 'text-neutral-600'
              }`}
            >
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            {showTextMenu && (
              <div
                className={`absolute top-full mt-1.5 ${
                  language === 'ar' ? 'right-0' : 'left-0'
                } w-48 bg-white border border-neutral-200 shadow-xl rounded-xl py-1 z-50 text-xs`}
              >
                <button
                  onClick={() => {
                    setActiveTool('text');
                    onAddText('heading');
                    setShowTextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-800 font-bold"
                >
                  {t.addHeading}
                </button>
                <button
                  onClick={() => {
                    setActiveTool('text');
                    onAddText('subheading');
                    setShowTextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-800 font-semibold"
                >
                  {t.addSubheading}
                </button>
                <button
                  onClick={() => {
                    setActiveTool('text');
                    onAddText('body');
                    setShowTextMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-700"
                >
                  {t.addBody}
                </button>
              </div>
            )}
          </div>

          {/* Whiteout / Text Masking Tool */}
          <button
            onClick={() => setActiveTool(activeTool === 'whiteout' ? 'select' : 'whiteout')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTool === 'whiteout'
                ? 'bg-neutral-900 text-white shadow-xs font-bold'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
            title={t.whiteoutTooltip}
          >
            <Eraser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            <span className="hidden md:inline">{t.whiteoutTool}</span>
          </button>

          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            title={t.insertImage}
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span className="hidden md:inline">{t.insertImage}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
          />

          {/* Shapes Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowShapeMenu(!showShapeMenu)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
              <span className="hidden md:inline">{t.shapesMenu}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {showShapeMenu && (
              <div
                className={`absolute top-full mt-1.5 ${
                  language === 'ar' ? 'right-0' : 'left-0'
                } w-40 bg-white border border-neutral-200 shadow-xl rounded-xl py-1 z-50 text-xs`}
              >
                <button
                  onClick={() => {
                    onAddShape('rect');
                    setShowShapeMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <Square className="w-4 h-4 text-purple-600" />
                  <span>{t.rectangle}</span>
                </button>
                <button
                  onClick={() => {
                    onAddShape('circle');
                    setShowShapeMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <Circle className="w-4 h-4 text-purple-600" />
                  <span>{t.circle}</span>
                </button>
                <button
                  onClick={() => {
                    onAddShape('line');
                    setShowShapeMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <Minus className="w-4 h-4 text-purple-600" />
                  <span>{t.line}</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-neutral-200 mx-0.5 sm:mx-1 shrink-0" />

          {/* Digital Signature */}
          <button
            onClick={onOpenSignatureModal}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            title={t.signatureTool}
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
            <span className="hidden lg:inline">{t.signatureTool}</span>
          </button>

          {/* Highlighter Tool */}
          <button
            onClick={() => setActiveTool(activeTool === 'highlight' ? 'select' : 'highlight')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTool === 'highlight'
                ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400 font-bold'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
            title={t.highlighterTool}
          >
            <Highlighter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span className="hidden lg:inline">{t.highlighterTool}</span>
          </button>

          {/* Freehand Pen */}
          <button
            onClick={() => setActiveTool(activeTool === 'draw' ? 'select' : 'draw')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
              activeTool === 'draw'
                ? 'bg-red-100 text-red-900 ring-1 ring-red-400 font-bold'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
            title={t.freehandTool}
          >
            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
            <span className="hidden lg:inline">{t.freehandTool}</span>
          </button>
        </div>

        {/* Book Studio & Templates Quick Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenBookStudioModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300 shadow-2xs shrink-0"
            title={t.bookStudioTooltip}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.bookStudio}</span>
          </button>

          <button
            onClick={onOpenTemplateModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200 shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span>{t.templates}</span>
          </button>
        </div>
      </div>

      {/* Secondary Context Ribbon: When Text is Selected */}
      {isTextSelected && textEl && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 bg-neutral-50/95 border-t border-neutral-200 text-xs">
          <span className="text-[11px] font-bold text-neutral-400 pl-1">{t.textFormatting}</span>

          {/* Font Family */}
          <select
            value={textEl.fontFamily || (language === 'ar' ? 'Cairo' : 'Plus Jakarta Sans')}
            onChange={(e) => onUpdateElement(textEl.id, { fontFamily: e.target.value })}
            className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800 focus:outline-hidden"
          >
            {getFonts(language).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <div className="flex items-center border border-neutral-300 rounded bg-white overflow-hidden">
            <button
              onClick={() =>
                onUpdateElement(textEl.id, { fontSize: Math.max(8, textEl.fontSize - 2) })
              }
              className="px-2 py-0.5 hover:bg-neutral-100 text-neutral-700 border-r border-neutral-200"
            >
              -
            </button>
            <span className="px-2.5 py-0.5 font-mono tabular-nums text-xs">
              {textEl.fontSize}px
            </span>
            <button
              onClick={() =>
                onUpdateElement(textEl.id, { fontSize: Math.min(96, textEl.fontSize + 2) })
              }
              className="px-2 py-0.5 hover:bg-neutral-100 text-neutral-700 border-l border-neutral-200"
            >
              +
            </button>
          </div>

          {/* Bold */}
          <button
            onClick={() =>
              onUpdateElement(textEl.id, {
                fontWeight: textEl.fontWeight === 'bold' ? 'normal' : 'bold'
              })
            }
            className={`p-1.5 rounded transition-colors ${
              textEl.fontWeight === 'bold'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
            title={t.boldTooltip}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            onClick={() =>
              onUpdateElement(textEl.id, {
                fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic'
              })
            }
            className={`p-1.5 rounded transition-colors ${
              textEl.fontStyle === 'italic'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
            title={t.italicTooltip}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            onClick={() =>
              onUpdateElement(textEl.id, {
                textDecoration: textEl.textDecoration === 'underline' ? 'none' : 'underline'
              })
            }
            className={`p-1.5 rounded transition-colors ${
              textEl.textDecoration === 'underline'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-700 hover:bg-neutral-200'
            }`}
            title={t.underlineTooltip}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-300 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5 border border-neutral-300 rounded bg-white p-0.5">
            <button
              onClick={() => onUpdateElement(textEl.id, { textAlign: 'left' })}
              className={`p-1 rounded ${
                textEl.textAlign === 'left' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500'
              }`}
              title={t.alignLeft}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement(textEl.id, { textAlign: 'center' })}
              className={`p-1 rounded ${
                textEl.textAlign === 'center' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500'
              }`}
              title={t.alignCenter}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement(textEl.id, { textAlign: 'right' })}
              className={`p-1 rounded ${
                textEl.textAlign === 'right' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500'
              }`}
              title={t.alignRight}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement(textEl.id, { textAlign: 'justify' })}
              className={`p-1 rounded ${
                textEl.textAlign === 'justify' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500'
              }`}
              title={t.alignJustify}
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Color Picker */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-neutral-500">{t.textColor}</span>
            <input
              type="color"
              value={textEl.color || '#0f172a'}
              onChange={(e) => onUpdateElement(textEl.id, { color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border border-neutral-300 p-0"
            />
          </div>

          {/* Duplicate / Delete */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => onDuplicateElement(textEl.id)}
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded"
              title={t.duplicate}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteElement(textEl.id)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Secondary Context Ribbon: When Shape is Selected */}
      {isShapeSelected && shapeEl && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 bg-neutral-50/95 border-t border-neutral-200 text-xs">
          <span className="text-[11px] font-bold text-neutral-400 pl-1">{t.shapesMenu}:</span>

          {/* Fill Color */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-500">{language === 'ar' ? 'تعبئة:' : language === 'es' ? 'Relleno:' : language === 'fr' ? 'Fond :' : 'Fill:'}</span>
            <input
              type="color"
              value={shapeEl.fillColor === 'transparent' ? '#ffffff' : shapeEl.fillColor}
              onChange={(e) => onUpdateElement(shapeEl.id, { fillColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border border-neutral-300 p-0"
            />
            <button
              onClick={() => onUpdateElement(shapeEl.id, { fillColor: 'transparent' })}
              className="text-[10px] text-neutral-500 hover:text-neutral-900 underline"
            >
              {language === 'ar' ? 'شفاف' : language === 'es' ? 'Transparente' : language === 'fr' ? 'Transparent' : 'Transparent'}
            </button>
          </div>

          {/* Stroke Color */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-500">{language === 'ar' ? 'إطار:' : language === 'es' ? 'Borde:' : language === 'fr' ? 'Bordure :' : 'Border:'}</span>
            <input
              type="color"
              value={shapeEl.strokeColor || '#0f172a'}
              onChange={(e) => onUpdateElement(shapeEl.id, { strokeColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border border-neutral-300 p-0"
            />
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-neutral-500">{language === 'ar' ? 'سُمك:' : language === 'es' ? 'Grosor:' : language === 'fr' ? 'Épaisseur :' : 'Width:'}</span>
            <input
              type="number"
              min="0"
              max="20"
              value={shapeEl.strokeWidth}
              onChange={(e) =>
                onUpdateElement(shapeEl.id, { strokeWidth: Number(e.target.value) })
              }
              className="w-12 px-1.5 py-0.5 border border-neutral-300 rounded text-center text-xs"
            />
          </div>

          {/* Corner Radius if Rect */}
          {shapeEl.type === 'rect' && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-500">{language === 'ar' ? 'استدارة:' : language === 'es' ? 'Radio:' : language === 'fr' ? 'Rayon :' : 'Radius:'}</span>
              <input
                type="number"
                min="0"
                max="50"
                value={shapeEl.borderRadius || 0}
                onChange={(e) =>
                  onUpdateElement(shapeEl.id, { borderRadius: Number(e.target.value) })
                }
                className="w-12 px-1.5 py-0.5 border border-neutral-300 rounded text-center text-xs"
              />
            </div>
          )}

          {/* Duplicate / Delete */}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => onDuplicateElement(shapeEl.id)}
              className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded"
              title={t.duplicate}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteElement(shapeEl.id)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
