import React, { useState } from 'react';
import {
  FileText,
  Merge,
  Split,
  FileCheck,
  Minimize2,
  RotateCw,
  Printer,
  Sparkles,
  Layers,
  ArrowRightLeft,
  X,
  Check,
  Download,
  AlertCircle
} from 'lucide-react';
import { PDFDocument, PDFPage } from '../types/pdf';
import { SupportedLanguage, translations } from '../constants/i18n';

interface PDFToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: PDFDocument;
  currentPageIndex: number;
  onRotateCurrentPage: (degrees: number) => void;
  onRotateAllPages: (degrees: number) => void;
  onDeletePagesRange: (startPage: number, endPage: number) => void;
  onDuplicatePageRange: (startPage: number, endPage: number) => void;
  onSplitDocument: (splitAtPage: number) => void;
  onMergeDocument: (importedDoc: PDFDocument) => void;
  onCompressDocument: () => void;
  onOpenUploadModal: () => void;
  language?: SupportedLanguage;
}

export const PDFToolsModal: React.FC<PDFToolsModalProps> = ({
  isOpen,
  onClose,
  documentData,
  currentPageIndex,
  onRotateCurrentPage,
  onRotateAllPages,
  onDeletePagesRange,
  onDuplicatePageRange,
  onSplitDocument,
  onMergeDocument,
  onCompressDocument,
  onOpenUploadModal,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'rotate' | 'split' | 'merge' | 'compress' | 'reorder'>('rotate');
  
  // Split state
  const [splitPage, setSplitPage] = useState<number>(Math.max(1, Math.min(documentData.pages.length, 2)));
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Range delete
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(1);

  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{t.toolsHeader}</h2>
              <p className="text-xs text-neutral-500">{t.toolsSub}</p>
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
            { id: 'rotate', label: t.rotateTab, icon: <RotateCw className="w-3.5 h-3.5" /> },
            { id: 'split', label: t.splitTab, icon: <Split className="w-3.5 h-3.5" /> },
            { id: 'merge', label: t.mergeTab, icon: <Merge className="w-3.5 h-3.5" /> },
            { id: 'compress', label: t.compressTab, icon: <Minimize2 className="w-3.5 h-3.5" /> },
            { id: 'reorder', label: t.reorderTab, icon: <Layers className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600 bg-red-50/20'
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
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: ROTATE */}
          {activeTab === 'rotate' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h4 className="text-xs font-bold text-neutral-800 mb-1">
                  {t.rotateCurrentBtn} ({t.pageIndex.replace('{num}', String(currentPageIndex + 1))})
                </h4>
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <button
                    onClick={() => {
                      onRotateCurrentPage(90);
                      showNotification(t.actionSuccess);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-300 hover:border-red-500 rounded-lg text-xs font-semibold text-neutral-700 hover:text-red-600 transition-colors shadow-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-red-600" />
                    <span>+90° ({language === 'ar' ? 'يميناً' : 'Clockwise'})</span>
                  </button>
                  <button
                    onClick={() => {
                      onRotateCurrentPage(-90);
                      showNotification(t.actionSuccess);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-300 hover:border-red-500 rounded-lg text-xs font-semibold text-neutral-700 hover:text-red-600 transition-colors shadow-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-blue-600 -scale-x-100" />
                    <span>-90° ({language === 'ar' ? 'يساراً' : 'Counter-Clockwise'})</span>
                  </button>
                  <button
                    onClick={() => {
                      onRotateCurrentPage(180);
                      showNotification(t.actionSuccess);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-300 hover:border-red-500 rounded-lg text-xs font-semibold text-neutral-700 transition-colors shadow-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-neutral-600" />
                    <span>180°</span>
                  </button>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h4 className="text-xs font-bold text-neutral-800 mb-1">
                  {t.rotateAllBtn} ({documentData.pages.length} {language === 'ar' ? 'صفحات' : 'pages'})
                </h4>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      onRotateAllPages(90);
                      showNotification(t.actionSuccess);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t.rotateAllBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPLIT */}
          {activeTab === 'split' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800">
                  {t.splitBtn}
                </h4>
                <p className="text-xs text-neutral-500">
                  {t.splitAtLabel} (Total: {documentData.pages.length} pages)
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-xs text-neutral-700 font-medium">
                    {t.splitAtLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, documentData.pages.length - 1)}
                    value={splitPage}
                    onChange={(e) => setSplitPage(Number(e.target.value))}
                    className="w-20 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-center font-mono focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={() => {
                      if (documentData.pages.length <= 1) {
                        return;
                      }
                      onSplitDocument(splitPage);
                      showNotification(t.actionSuccess);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>{t.splitBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MERGE */}
          {activeTab === 'merge' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <Merge className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900">
                  {t.mergeTab}
                </h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  {t.mergeDesc}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUploadModal();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Merge className="w-4 h-4" />
                  <span>{t.mergeBtn}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: COMPRESS */}
          {activeTab === 'compress' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800">
                  {t.compressTab}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {t.compressDesc}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onCompressDocument();
                      showNotification(t.actionSuccess);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span>{t.compressBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RANGE MANAGEMENT */}
          {activeTab === 'reorder' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800">
                  {t.deleteRangeBtn}
                </h4>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span>{t.rangeFrom}</span>
                  <input
                    type="number"
                    min="1"
                    max={documentData.pages.length}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-neutral-300 rounded text-center"
                  />
                  <span>{t.rangeTo}</span>
                  <input
                    type="number"
                    min={rangeStart}
                    max={documentData.pages.length}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-neutral-300 rounded text-center"
                  />
                  <button
                    onClick={() => {
                      if (rangeEnd - rangeStart + 1 >= documentData.pages.length) {
                        return;
                      }
                      onDeletePagesRange(rangeStart, rangeEnd);
                      showNotification(t.actionSuccess);
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs"
                  >
                    {t.deleteRangeBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
