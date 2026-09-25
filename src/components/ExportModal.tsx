import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, Printer, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { exportDocumentToPDF, exportPageToImage, ExportOptions } from '../utils/pdfExport';
import { SupportedLanguage, translations } from '../constants/i18n';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  totalPages: number;
  currentPageIndex: number;
  pageContainerRefs: HTMLElement[];
  language?: SupportedLanguage;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  totalPages,
  currentPageIndex,
  pageContainerRefs,
  language = 'en'
}) => {
  const t = translations[language] || translations.en;
  const [filename, setFilename] = useState(documentTitle || t.defaultBookFilename);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'print'>('pdf');
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [pageRange, setPageRange] = useState<'all' | 'current'>('all');
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setErrorMsg(null);
    setStatusMessage(t.exporting);

    try {
      if (exportFormat === 'print') {
        window.print();
        setIsExporting(false);
        onClose();
        return;
      }

      if (exportFormat === 'png') {
        const targetPage = pageContainerRefs[pageRange === 'current' ? currentPageIndex : 0];
        if (!targetPage) throw new Error('Target page element could not be found');
        setStatusMessage('Rendering high definition PNG image...');
        await exportPageToImage(targetPage, `${filename || 'document'}.png`);
        setIsExporting(false);
        onClose();
        return;
      }

      // PDF export
      await exportDocumentToPDF(pageContainerRefs, {
        filename: `${filename || 'document'}.pdf`,
        quality,
        pageRange,
        currentPageIndex,
        onProgress: (prog, msg) => {
          setProgress(prog);
          setStatusMessage(msg);
        }
      });

      await new Promise((r) => setTimeout(r, 600));
      setIsExporting(false);
      onClose();
    } catch (err: any) {
      console.error('Export failed:', err);
      setErrorMsg(err?.message || 'Error occurred while exporting document');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{t.exportHeader}</h2>
              <p className="text-xs text-neutral-500">{t.exportSub}</p>
            </div>
          </div>
          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Filename input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {t.filenameLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                disabled={isExporting}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                placeholder={t.defaultBookFilename}
              />
              <span className="text-xs font-mono font-medium text-neutral-500 px-2 py-2 bg-neutral-100 rounded-lg border border-neutral-200">
                .{exportFormat === 'pdf' ? 'pdf' : exportFormat === 'png' ? 'png' : 'print'}
              </span>
            </div>
          </div>

          {/* Export format tabs */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              {t.exportFormatLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setExportFormat('pdf')}
                className={`p-3 border rounded-lg text-center transition-all flex flex-col items-center gap-1.5 ${
                  exportFormat === 'pdf'
                    ? 'border-red-600 bg-red-50/50 text-red-700 font-bold ring-1 ring-red-500'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <FileText className="w-5 h-5 text-red-600" />
                <span className="text-xs">PDF Document</span>
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setExportFormat('png')}
                className={`p-3 border rounded-lg text-center transition-all flex flex-col items-center gap-1.5 ${
                  exportFormat === 'png'
                    ? 'border-red-600 bg-red-50/50 text-red-700 font-bold ring-1 ring-red-500'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <span className="text-xs">PNG Image</span>
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setExportFormat('print')}
                className={`p-3 border rounded-lg text-center transition-all flex flex-col items-center gap-1.5 ${
                  exportFormat === 'print'
                    ? 'border-red-600 bg-red-50/50 text-red-700 font-bold ring-1 ring-red-500'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <Printer className="w-5 h-5 text-neutral-700" />
                <span className="text-xs">{t.directPrint}</span>
              </button>
            </div>
          </div>

          {/* If PDF, quality selection */}
          {exportFormat === 'pdf' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700">
                {t.qualityLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', label: 'Standard (Web)', desc: '96 DPI' },
                  { id: 'high', label: 'High (Print)', desc: '150-300 DPI' },
                  { id: 'ultra', label: 'Ultra (Publishing)', desc: '400+ DPI' }
                ].map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setQuality(q.id as any)}
                    className={`p-2 border rounded-lg text-center transition-colors ${
                      quality === q.id
                        ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <div className="text-xs">{q.label}</div>
                    <div className="text-[10px] opacity-70 font-mono">{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Page Range */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              {t.pagesRangeLabel}
            </label>
            <div className="flex items-center gap-4 text-xs text-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageRange"
                  checked={pageRange === 'all'}
                  disabled={isExporting}
                  onChange={() => setPageRange('all')}
                  className="accent-red-600"
                />
                <span>{t.allPages.replace('{total}', String(totalPages))}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageRange"
                  checked={pageRange === 'current'}
                  disabled={isExporting}
                  onChange={() => setPageRange('current')}
                  className="accent-red-600"
                />
                <span>{t.currentPageOnly.replace('{num}', String(currentPageIndex + 1))}</span>
              </label>
            </div>
          </div>

          {/* Progress bar during export */}
          {isExporting && (
            <div className="mt-4 p-4 border border-red-100 rounded-xl bg-red-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-red-900">
                <div className="flex items-center gap-2 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  <span>{statusMessage}</span>
                </div>
                <span className="font-mono tabular-nums font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            {t.closeBtn}
          </button>
          <button
            onClick={handleStartExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t.startExport}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
