import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, Upload, Check, Trash2, X } from 'lucide-react';
import { SupportedLanguage, translations } from '../constants/i18n';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (dataUrl: string, name?: string) => void;
  language?: SupportedLanguage;
}

const CALLIGRAPHY_FONTS = [
  { name: 'Dancing Script (Classic)', font: 'Dancing Script, cursive, serif', sample: 'Signature' },
  { name: 'Amiri / Diwani (Classical)', font: 'Amiri, serif', sample: 'Official Sign' },
  { name: 'Plus Jakarta (Modern)', font: 'Plus Jakarta Sans, sans-serif', sample: 'Authorized' },
  { name: 'Caveat (Freehand)', font: 'Caveat, cursive, sans-serif', sample: 'Personal' }
];

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onApplySignature,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  
  // Draw State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#0f172a');
  const [penWidth, setPenWidth] = useState(3);

  // Type State
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(CALLIGRAPHY_FONTS[0].font);

  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const t = translations[language] || translations.en;

  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSignature = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onApplySignature(dataUrl, 'Signature');
      onClose();
    } else if (activeTab === 'type') {
      if (!typedName.trim()) return;
      // Render text into canvas
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = penColor;
        ctx.font = `italic 42px ${selectedFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
        const dataUrl = canvas.toDataURL('image/png');
        onApplySignature(dataUrl, typedName);
        onClose();
      }
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      onApplySignature(uploadedImage, 'Uploaded Stamp');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{t.sigHeader}</h2>
              <p className="text-xs text-neutral-500">{t.sigSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 px-6 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'draw'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{t.tabDraw}</span>
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'type'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{t.tabType}</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.tabUpload}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'draw' && (
            <div>
              <div className="relative border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50/50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-48 cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-400 text-xs">
                    {language === 'ar' ? 'وقع هنا بالماوس أو شاشة اللمس' : 'Sign here using your mouse or touchscreen'}
                  </div>
                )}
                {hasDrawn && (
                  <button
                    onClick={clearCanvas}
                    className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-neutral-100 text-neutral-600 rounded-md shadow-xs border border-neutral-200 text-xs flex items-center gap-1"
                    title={t.clearBtn}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>{t.clearBtn}</span>
                  </button>
                )}
              </div>

              {/* Color & Width options */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600">{t.penColor}</span>
                  <div className="flex items-center gap-1.5">
                    {['#0f172a', '#1e40af', '#15803d', '#991b1b'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setPenColor(color)}
                        className={`w-6 h-6 rounded-full border transition-transform ${
                          penColor === color ? 'scale-125 ring-2 ring-red-500 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600">{t.penWidth}</span>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={penWidth}
                    onChange={(e) => setPenWidth(Number(e.target.value))}
                    className="w-24 accent-red-600"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t.typeNamePlaceholder}
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              {/* Preview in various calligraphy fonts */}
              <div className="space-y-2">
                <span className="text-xs text-neutral-500 block">
                  {language === 'ar' ? 'اختر نمط الخط:' : 'Select typography style:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CALLIGRAPHY_FONTS.map((fontItem) => (
                    <div
                      key={fontItem.font}
                      onClick={() => setSelectedFont(fontItem.font)}
                      className={`p-3 border rounded-xl cursor-pointer transition-all ${
                        selectedFont === fontItem.font
                          ? 'border-red-600 bg-red-50/30 ring-1 ring-red-500'
                          : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-[10px] text-neutral-400 block mb-1">
                        {fontItem.name}
                      </span>
                      <div
                        className="text-lg truncate py-1"
                        style={{ fontFamily: fontItem.font, color: penColor }}
                      >
                        {typedName || fontItem.sample}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color options */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-neutral-600">{t.penColor}</span>
                <div className="flex items-center gap-1.5">
                  {['#0f172a', '#1e40af', '#15803d', '#991b1b'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        penColor === color ? 'scale-125 ring-2 ring-red-500 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors block text-center">
                <Upload className="w-8 h-8 text-neutral-400 mb-2 mx-auto" />
                <span className="text-xs font-semibold text-neutral-700">
                  {t.dropSigImage}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedImage && (
                <div className="p-3 bg-neutral-100 rounded-lg flex items-center justify-center max-h-40 overflow-hidden">
                  <img src={uploadedImage} alt="Uploaded signature" className="max-h-32 object-contain" />
                </div>
              )}
            </div>
          )}

          <div className="text-[11px] text-neutral-400 mt-4 leading-relaxed">
            {t.sigNotice}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            {t.closeBtn}
          </button>

          <button
            onClick={handleSaveSignature}
            disabled={activeTab === 'draw' ? !hasDrawn : activeTab === 'type' ? !typedName.trim() : !uploadedImage}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t.applySigBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
