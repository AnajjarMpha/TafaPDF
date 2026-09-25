import React, { useRef, useState, useEffect } from 'react';
import { PDFPage, PDFElement, ToolType, DrawPoint, PageMargins, TextElement, BookSettings } from '../types/pdf';
import { RotateCw, Trash2, Copy, Move, Check, CornerRightDown, Type } from 'lucide-react';
import { SupportedLanguage, translations } from '../constants/i18n';

interface PageCanvasProps {
  page: PDFPage;
  pageIndex: number;
  totalPages?: number;
  zoom: number; // e.g. 1.0 = 100%
  activeTool: ToolType;
  selectedElementId: string | null;
  margins?: PageMargins;
  bookSettings?: BookSettings;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<PDFElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onAddElement: (element: PDFElement) => void;
  watermark?: {
    enabled: boolean;
    text: string;
    opacity: number;
    color: string;
    fontSize: number;
    rotation: number;
  };
  showGrid?: boolean;
  domRef?: React.RefObject<HTMLDivElement | null>;
  language?: SupportedLanguage;
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  page,
  pageIndex,
  totalPages = 1,
  zoom,
  activeTool,
  selectedElementId,
  margins,
  bookSettings,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onAddElement,
  watermark,
  showGrid = false,
  domRef,
  language = 'en'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const t = translations[language] || translations.en;

  // Dragging Element State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0 });

  // Resizing Element State
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    elX: 0,
    elY: 0,
    width: 0,
    height: 0
  });

  // Freehand Drawing State
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<DrawPoint[]>([]);

  // Whiteout creation drag
  const [isCreatingWhiteout, setIsCreatingWhiteout] = useState(false);
  const [whiteoutStart, setWhiteoutStart] = useState<{ x: number; y: number } | null>(null);
  const [whiteoutCurrent, setWhiteoutCurrent] = useState<{ x: number; y: number } | null>(null);

  const selectedElement = page.elements.find((el) => el.id === selectedElementId);

  // Handle click on canvas:
  // If activeTool is 'text', clicking ANYWHERE on the page (even over uploaded PDF) inserts an editable text box!
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === 'text') {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = Math.round((e.clientX - rect.left) / zoom);
      const clickY = Math.round((e.clientY - rect.top) / zoom);

      const newId = `txt-custom-${Date.now()}`;
      const newTextEl: TextElement = {
        id: newId,
        type: 'text',
        x: Math.max(10, Math.min(page.width - 250, clickX)),
        y: Math.max(10, Math.min(page.height - 40, clickY)),
        width: 260,
        height: 40,
        zIndex: page.elements.length + 10,
        text: t.clickToTypePrompt,
        fontSize: 16,
        fontFamily: language === 'ar' ? 'Cairo' : 'Plus Jakarta Sans',
        fontWeight: 'normal',
        color: '#0f172a',
        backgroundColor: '#ffffff', // Clean white background so it floats and masks whatever is underneath
        textAlign: language === 'ar' ? 'right' : 'left',
        lineHeight: 1.5
      };

      onAddElement(newTextEl);
      setEditingTextId(newId);
      return;
    }

    // Default deselect
    const target = e.target as HTMLElement;
    if (
      target === containerRef.current ||
      target.classList.contains('canvas-background') ||
      target.tagName === 'IMG'
    ) {
      onSelectElement(null);
      setEditingTextId(null);
    }
  };

  // Dragging handlers
  const handleElementMouseDown = (e: React.MouseEvent, element: PDFElement) => {
    if (activeTool === 'text') return; // let text click place new text
    if (activeTool !== 'select' && activeTool !== 'hand') return;
    if (editingTextId === element.id) return;

    e.stopPropagation();
    onSelectElement(element.id);

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elX: element.x,
      elY: element.y
    });
  };

  // Resize handler start
  const handleResizeHandleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;

    setResizingHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      elX: selectedElement.x,
      elY: selectedElement.y,
      width: selectedElement.width,
      height: selectedElement.height
    });
  };

  // Global mouse move & up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Element Dragging
      if (isDragging && selectedElement) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        const newX = Math.max(0, Math.min(page.width - selectedElement.width, dragStart.elX + dx));
        const newY = Math.max(0, Math.min(page.height - selectedElement.height, dragStart.elY + dy));
        onUpdateElement(selectedElement.id, {
          x: Math.round(newX),
          y: Math.round(newY)
        });
      }

      // Element Resizing
      if (resizingHandle && selectedElement) {
        const dx = (e.clientX - resizeStart.x) / zoom;
        const dy = (e.clientY - resizeStart.y) / zoom;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.elX;
        let newY = resizeStart.elY;

        if (resizingHandle.includes('e')) {
          newWidth = Math.max(20, resizeStart.width + dx);
        }
        if (resizingHandle.includes('s')) {
          newHeight = Math.max(15, resizeStart.height + dy);
        }
        if (resizingHandle.includes('w')) {
          const possibleWidth = resizeStart.width - dx;
          if (possibleWidth >= 20) {
            newWidth = possibleWidth;
            newX = resizeStart.elX + dx;
          }
        }
        if (resizingHandle.includes('n')) {
          const possibleHeight = resizeStart.height - dy;
          if (possibleHeight >= 15) {
            newHeight = possibleHeight;
            newY = resizeStart.elY + dy;
          }
        }

        onUpdateElement(selectedElement.id, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        });
      }

      // Whiteout drag
      if (isCreatingWhiteout && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setWhiteoutCurrent({ x, y });
      }

      // Freehand drawing
      if (isDrawingFreehand && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setCurrentDrawPoints((prev) => [...prev, { x, y }]);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
      if (resizingHandle) setResizingHandle(null);

      // Finish whiteout creation
      if (isCreatingWhiteout && whiteoutStart && whiteoutCurrent) {
        setIsCreatingWhiteout(false);
        const minX = Math.min(whiteoutStart.x, whiteoutCurrent.x);
        const minY = Math.min(whiteoutStart.y, whiteoutCurrent.y);
        const width = Math.abs(whiteoutCurrent.x - whiteoutStart.x);
        const height = Math.abs(whiteoutCurrent.y - whiteoutStart.y);

        if (width > 5 && height > 5) {
          onAddElement({
            id: `whiteout-${Date.now()}`,
            type: 'whiteout',
            x: Math.round(minX),
            y: Math.round(minY),
            width: Math.round(width),
            height: Math.round(height),
            fillColor: '#ffffff',
            zIndex: page.elements.length + 1
          });
        }
        setWhiteoutStart(null);
        setWhiteoutCurrent(null);
      }

      if (isDrawingFreehand) {
        setIsDrawingFreehand(false);
        if (currentDrawPoints.length > 2) {
          // Calculate bounds
          const xs = currentDrawPoints.map((p) => p.x);
          const ys = currentDrawPoints.map((p) => p.y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);

          // Relative points
          const relPoints = currentDrawPoints.map((p) => ({
            x: p.x - minX,
            y: p.y - minY
          }));

          const isHighlight = activeTool === 'highlight';
          onAddElement({
            id: `draw-${Date.now()}`,
            type: 'draw',
            x: Math.round(minX),
            y: Math.round(minY),
            width: Math.max(20, Math.round(maxX - minX)),
            height: Math.max(20, Math.round(maxY - minY)),
            points: relPoints,
            color: isHighlight ? 'rgba(250, 204, 21, 0.45)' : '#dc2626',
            strokeWidth: isHighlight ? 18 : 3,
            isHighlighter: isHighlight,
            zIndex: page.elements.length + 1
          });
        }
        setCurrentDrawPoints([]);
      }
    };

    if (isDragging || resizingHandle || isDrawingFreehand || isCreatingWhiteout) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    resizingHandle,
    isDrawingFreehand,
    isCreatingWhiteout,
    whiteoutStart,
    whiteoutCurrent,
    selectedElement,
    dragStart,
    resizeStart,
    currentDrawPoints,
    zoom,
    activeTool,
    page.width,
    page.height
  ]);

  // Canvas Mouse Down for freehand & whiteout tools
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'draw' || activeTool === 'highlight') {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      setIsDrawingFreehand(true);
      setCurrentDrawPoints([{ x, y }]);
    } else if (activeTool === 'whiteout') {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      setIsCreatingWhiteout(true);
      setWhiteoutStart({ x, y });
      setWhiteoutCurrent({ x, y });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Page Sheet Container */}
      <div
        ref={(el) => {
          containerRef.current = el;
          if (domRef) {
            (domRef as any).current = el;
          }
        }}
        dir="ltr"
        data-page-id={page.id}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        style={{
          width: `${page.width * zoom}px`,
          height: `${page.height * zoom}px`,
          backgroundColor: page.backgroundColor || '#ffffff',
          transformOrigin: 'top center',
          transform: page.rotation ? `rotate(${page.rotation}deg)` : undefined
        }}
        className={`relative shadow-2xl border border-neutral-300 transition-all select-none overflow-hidden ${
          activeTool === 'hand'
            ? 'cursor-grab active:cursor-grabbing'
            : activeTool === 'text'
            ? 'cursor-text ring-2 ring-blue-400'
            : activeTool === 'draw' || activeTool === 'highlight' || activeTool === 'whiteout'
            ? 'cursor-crosshair'
            : 'cursor-default'
        }`}
      >
        {/* Helper Banner when Text Tool is active */}
        {activeTool === 'text' && (
          <div className="no-export absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md z-50 whitespace-nowrap flex items-center gap-1.5 pointer-events-none">
            <Type className="w-3.5 h-3.5" />
            <span>انقر في أي مكان داخل المستند لإضافة أو تعديل النص مباشرة</span>
          </div>
        )}

        {/* Scaled Inner Content Wrapper */}
        <div
          dir="ltr"
          style={{
            width: `${page.width}px`,
            height: `${page.height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
          className="absolute top-0 left-0 origin-top-left pointer-events-auto overflow-hidden"
        >
          {/* Uploaded PDF Original Page High-Res Render (Underlay) */}
          {page.backgroundImage && (
            <img
              src={page.backgroundImage}
              alt={`مستند PDF صفحة ${pageIndex + 1}`}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
            />
          )}

          {/* Grid pattern when enabled */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-1"
              style={{
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          )}

          {/* Page Margins Guides Overlay (when toggled on) */}
          {margins?.showGuides && (
            <div
              className="no-export absolute pointer-events-none z-2 border border-dashed border-red-400/80 transition-all"
              style={{
                top: `${margins.top}px`,
                bottom: `${margins.bottom}px`,
                right: `${margins.right}px`,
                left: `${margins.left}px`
              }}
            >
              <span className={`absolute top-1 ${language === 'ar' ? 'right-2' : 'left-2'} text-[9px] font-mono text-red-500 bg-white/80 px-1 rounded`}>
                {t.marginGuideText.replace('{val}', String(margins.top))}
              </span>
            </div>
          )}

          {/* Book Running Header (when enabled) */}
          {bookSettings?.headerEnabled && page.pageType !== 'cover' && (
            <div
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className="absolute top-4 left-10 right-10 flex items-center justify-between pb-1 text-[11px] font-serif select-none pointer-events-none z-10"
              style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}
            >
              <span className="truncate max-w-[320px]">
                {page.chapterTitle || bookSettings.headerText || bookSettings.bookTitle}
              </span>
              <span className="font-mono text-[10px]">{pageIndex + 1}</span>
            </div>
          )}

          {/* Book Running Footer / Page Numbering (when enabled) */}
          {bookSettings?.pageNumberingEnabled && (!bookSettings.skipNumberingOnCover || page.pageType !== 'cover') && (
            <div
              className={`absolute bottom-4 left-10 right-10 flex text-[11px] font-mono select-none pointer-events-none z-10 ${
                bookSettings.pageNumberPosition === 'bottom-center'
                  ? 'justify-center'
                  : bookSettings.pageNumberPosition === 'bottom-left'
                  ? 'justify-start'
                  : bookSettings.pageNumberPosition === 'bottom-right'
                  ? 'justify-end'
                  : (pageIndex % 2 === 0 ? 'justify-end' : 'justify-start') // alternate spreads
              }`}
              style={{ color: '#94a3b8' }}
            >
              <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                {bookSettings.pageNumberFormat === '- 1 -'
                  ? `- ${pageIndex + 1} -`
                  : bookSettings.pageNumberFormat === '1 / N'
                  ? `${pageIndex + 1} / ${totalPages}`
                  : pageIndex + 1}
              </span>
            </div>
          )}

          {/* Watermark Overlay */}
          {watermark?.enabled && watermark.text && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
              style={{
                opacity: watermark.opacity || 0.15,
                transform: `rotate(${watermark.rotation || -35}deg)`
              }}
            >
              <span
                style={{
                  fontSize: `${watermark.fontSize || 72}px`,
                  color: watermark.color || '#ef4444'
                }}
                className="font-bold tracking-widest uppercase text-center whitespace-nowrap"
              >
                {watermark.text}
              </span>
            </div>
          )}

          {/* Render Elements */}
          {page.elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => {
              const isSelected = selectedElementId === element.id;
              const isEditing = editingTextId === element.id;

              return (
                <div
                  key={element.id}
                  id={`el-${element.id}`}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(element.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (element.type === 'text') {
                      setEditingTextId(element.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    zIndex: element.zIndex,
                    opacity: element.opacity !== undefined ? element.opacity : 1,
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined
                  }}
                  className={`group ${
                    isSelected ? 'ring-2 ring-red-500 ring-offset-1 z-30' : ''
                  }`}
                >
                  {/* Element Type: Whiteout / Eraser Block */}
                  {element.type === 'whiteout' && (
                    <div
                      className="w-full h-full bg-white shadow-xs border border-dashed border-neutral-300 group-hover:border-red-400"
                      style={{
                        backgroundColor: element.fillColor || '#ffffff'
                      }}
                      title="مربع تبييض وحجب النص السابق"
                    />
                  )}

                  {/* Element Type: Text */}
                  {element.type === 'text' && (
                    <div
                      className="w-full h-full p-1 overflow-hidden"
                      style={{
                        backgroundColor: element.backgroundColor || 'transparent'
                      }}
                    >
                      {isEditing ? (
                        <textarea
                          autoFocus
                          value={element.text}
                          onChange={(e) =>
                            onUpdateElement(element.id, { text: e.target.value })
                          }
                          onBlur={() => setEditingTextId(null)}
                          style={{
                            fontSize: `${element.fontSize}px`,
                            fontFamily: element.fontFamily || 'Cairo',
                            fontWeight: element.fontWeight || 'normal',
                            color: element.color || '#0f172a',
                            textAlign: element.textAlign || 'right',
                            lineHeight: element.lineHeight || 1.6,
                            letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
                            textIndent: element.paragraphIndent ? `${element.paragraphIndent}px` : undefined,
                            direction: 'rtl'
                          }}
                          className="w-full h-full bg-white text-neutral-900 resize-none border border-blue-400 rounded outline-hidden p-1 shadow-xs"
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: `${element.fontSize}px`,
                            fontFamily: element.fontFamily || 'Cairo',
                            fontWeight: element.fontWeight || 'normal',
                            fontStyle: element.fontStyle || 'normal',
                            textDecoration: element.textDecoration || 'none',
                            color: element.color || '#0f172a',
                            textAlign: element.textAlign || 'right',
                            lineHeight: element.lineHeight || 1.6,
                            letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
                            textIndent: element.paragraphIndent ? `${element.paragraphIndent}px` : undefined,
                            direction: 'rtl',
                            whiteSpace: 'pre-wrap'
                          }}
                          className="w-full h-full select-text break-words cursor-text hover:outline-dashed hover:outline-1 hover:outline-blue-400"
                          title="انقر مرتين لتعديل النص مباشرة"
                        >
                          {element.text || 'نص فارغ'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Element Type: Image */}
                  {element.type === 'image' && (
                    <img
                      src={element.src}
                      alt="عنصر صورة"
                      draggable={false}
                      className="w-full h-full select-none"
                      style={{
                        borderRadius: `${element.borderRadius || 0}px`,
                        borderWidth: `${element.borderWidth || 0}px`,
                        borderColor: element.borderColor || 'transparent',
                        objectFit: element.objectFit || 'contain'
                      }}
                    />
                  )}

                  {/* Element Type: Rect Shape */}
                  {element.type === 'rect' && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: element.fillColor || 'transparent',
                        borderColor: element.strokeColor || '#0f172a',
                        borderWidth: `${element.strokeWidth || 1}px`,
                        borderStyle: element.borderStyle || 'solid',
                        borderRadius: `${element.borderRadius || 0}px`
                      }}
                    />
                  )}

                  {/* Element Type: Circle Shape */}
                  {element.type === 'circle' && (
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        backgroundColor: element.fillColor || 'transparent',
                        borderColor: element.strokeColor || '#0f172a',
                        borderWidth: `${element.strokeWidth || 1}px`,
                        borderStyle: element.borderStyle || 'solid'
                      }}
                    />
                  )}

                  {/* Element Type: Line */}
                  {element.type === 'line' && (
                    <div
                      className="w-full h-full flex items-center"
                      style={{
                        borderBottom: `${element.strokeWidth || 2}px ${element.borderStyle || 'solid'} ${element.strokeColor || '#0f172a'}`
                      }}
                    />
                  )}

                  {/* Element Type: Signature */}
                  {element.type === 'signature' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 border-b border-dashed border-neutral-300">
                      <img
                        src={element.signatureDataUrl}
                        alt="توقيع معتمد"
                        draggable={false}
                        className="max-h-full max-w-full object-contain pointer-events-none"
                      />
                      {element.signerName && (
                        <span className="text-[10px] text-neutral-400 font-sans mt-0.5">
                          {element.signerName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Element Type: Stamp */}
                  {element.type === 'stamp' && (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center p-2 uppercase tracking-wider font-bold select-none ${
                        element.shape === 'oval' ? 'rounded-full' : 'rounded-lg'
                      }`}
                      style={{
                        border: `3px solid ${element.color}`,
                        outline: `1.5px dashed ${element.color}`,
                        outlineOffset: '-5px',
                        color: element.color
                      }}
                    >
                      <div className="text-sm font-bold text-center leading-tight">
                        {element.text}
                      </div>
                      {element.subtext && (
                        <div className="text-[10px] font-mono tracking-widest opacity-90 mt-0.5">
                          {element.subtext}
                        </div>
                      )}
                      {element.date && (
                        <div className="text-[9px] font-mono opacity-75 mt-0.5">
                          {element.date}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Element Type: Freehand Drawing */}
                  {element.type === 'draw' && (
                    <svg
                      className="w-full h-full overflow-visible pointer-events-none"
                      viewBox={`0 0 ${element.width} ${element.height}`}
                    >
                      <polyline
                        points={element.points.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={element.color}
                        strokeWidth={element.strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={element.isHighlighter ? 0.45 : 1}
                      />
                    </svg>
                  )}

                  {/* Interactive Selection Resize Nodes */}
                  {isSelected && (
                    <div className="selection-handle no-export absolute inset-0 pointer-events-none">
                      {/* Top-Left */}
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'nw')}
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-full cursor-nwse-resize pointer-events-auto shadow-xs"
                      />
                      {/* Top-Right */}
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'ne')}
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-full cursor-nesw-resize pointer-events-auto shadow-xs"
                      />
                      {/* Bottom-Left */}
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'sw')}
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-full cursor-nesw-resize pointer-events-auto shadow-xs"
                      />
                      {/* Bottom-Right */}
                      <div
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, 'se')}
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-red-600 rounded-full cursor-nwse-resize pointer-events-auto shadow-xs"
                      />

                      {/* Floating Mini Action Bar over Selected Element */}
                      <div
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white rounded-lg shadow-lg px-2 py-1 flex items-center gap-1.5 pointer-events-auto whitespace-nowrap text-xs z-50"
                      >
                        <button
                          onClick={() => onDuplicateElement(element.id)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
                          title={t.duplicate}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteElement(element.id)}
                          className="p-1 hover:bg-red-600/80 rounded text-red-300 hover:text-white transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-neutral-400 font-mono pl-1 border-r border-neutral-700 pr-1">
                          {element.width}×{element.height}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Active Whiteout Drag Preview */}
          {isCreatingWhiteout && whiteoutStart && whiteoutCurrent && (
            <div
              className="absolute bg-white/90 border-2 border-dashed border-red-500 pointer-events-none z-50"
              style={{
                left: `${Math.min(whiteoutStart.x, whiteoutCurrent.x)}px`,
                top: `${Math.min(whiteoutStart.y, whiteoutCurrent.y)}px`,
                width: `${Math.abs(whiteoutCurrent.x - whiteoutStart.x)}px`,
                height: `${Math.abs(whiteoutCurrent.y - whiteoutStart.y)}px`
              }}
            />
          )}

          {/* Active Freehand Live Preview SVG */}
          {isDrawingFreehand && currentDrawPoints.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
              <polyline
                points={currentDrawPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={activeTool === 'highlight' ? 'rgba(250, 204, 21, 0.5)' : '#dc2626'}
                strokeWidth={activeTool === 'highlight' ? 18 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Page Number Label */}
      <div className="mt-3 text-xs font-mono text-neutral-500 font-medium">
        صفحة {pageIndex + 1} {page.rotation ? `(${page.rotation}°)` : ''}
      </div>
    </div>
  );
};
