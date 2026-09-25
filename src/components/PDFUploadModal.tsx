import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, X, FileCode, Check } from 'lucide-react';
import { loadPDFFile, PDFLoadProgress } from '../utils/pdfImporter';
import { loadWordOrTextFile } from '../utils/wordImporter';
import { PDFDocument } from '../types/pdf';
import { SupportedLanguage } from '../constants/i18n';

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedDoc: PDFDocument) => void;
  language?: SupportedLanguage;
}

const UI_TEXT = {
  en: {
    header: 'Open & Import Documents',
    sub: 'Upload and edit PDF documents, Word files (.docx), and plain text (.txt)',
    dragDrop: 'Drag and drop any PDF, Word or TXT file here',
    orBrowse: 'or click to browse from your device',
    localNotice: 'All conversion and rendering is processed 100% locally in your browser',
    cancel: 'Cancel',
    preparing: 'Preparing file...',
    convertingWord: (name: string) => `Converting ${name} to formatted PDF canvas...`,
    renderingPdf: 'Decoding and rendering PDF pages...',
    convertingDesc: 'Converting content into high-fidelity editable vector pages',
    invalidFile: 'Please choose a PDF file, Word document (.docx, .doc), or Text file (.txt).'
  },
  ar: {
    header: 'فتح واستيراد المستندات',
    sub: 'تحميل وتعديل ملفات PDF، مستندات Word، وملفات النصوص TXT',
    dragDrop: 'اسحب أي ملف PDF أو Word أو TXT هنا',
    orBrowse: 'أو انقر لاختيار الملف من جهازك',
    localNotice: 'يتم التحويل والتنسيق محلياً داخل المتصفح بالكامل وبأمان تام',
    cancel: 'إلغاء',
    preparing: 'جاري تجهيز الملف...',
    convertingWord: (name: string) => `جاري تحويل مستند ${name} إلى صفحات PDF منسقة...`,
    renderingPdf: 'جاري فك تشفير وتصيير صفحات ملف الـ PDF...',
    convertingDesc: 'يتم تحويل وتنسيق المحتوى إلى صفحات PDF قياسية قابلة للتحرير المباشر',
    invalidFile: 'يرجى اختيار ملف PDF، مستند Word (.docx, .doc)، أو ملف نصي (.txt).'
  },
  es: {
    header: 'Abrir e Importar Documentos',
    sub: 'Subir y editar archivos PDF, documentos Word (.docx) y texto (.txt)',
    dragDrop: 'Arrastra y suelta tu archivo PDF, Word o TXT aquí',
    orBrowse: 'o haz clic para examinar desde tu dispositivo',
    localNotice: 'Toda la conversión se procesa 100% localmente en tu navegador',
    cancel: 'Cancelar',
    preparing: 'Preparando archivo...',
    convertingWord: (name: string) => `Convirtiendo ${name} a páginas PDF formateadas...`,
    renderingPdf: 'Decodificando y renderizando páginas PDF...',
    convertingDesc: 'Convirtiendo el contenido en páginas editables de alta fidelidad',
    invalidFile: 'Por favor seleccione un archivo PDF, Word (.docx, .doc) o archivo de texto (.txt).'
  },
  fr: {
    header: 'Ouvrir et Importer des Documents',
    sub: 'Téléversez et modifiez des PDF, documents Word (.docx) et fichiers texte (.txt)',
    dragDrop: 'Glissez et déposez votre fichier PDF, Word ou TXT ici',
    orBrowse: 'ou cliquez pour parcourir vos fichiers',
    localNotice: 'Toute la conversion est effectuée 100% localement dans votre navigateur',
    cancel: 'Annuler',
    preparing: 'Préparation du fichier...',
    convertingWord: (name: string) => `Conversion de ${name} en pages PDF formatées...`,
    renderingPdf: 'Décodage et rendu des pages du PDF...',
    convertingDesc: 'Transformation du contenu en pages vectorielles haute fidélité',
    invalidFile: 'Veuillez choisir un fichier PDF, document Word (.docx, .doc) ou fichier texte (.txt).'
  }
};

export const PDFUploadModal: React.FC<PDFUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  language = 'en'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [percent, setPercent] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = UI_TEXT[language] || UI_TEXT.en;

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    const fileName = file.name.toLowerCase();
    const isPDF = file.type === 'application/pdf' || fileName.endsWith('.pdf');
    const isWord = fileName.endsWith('.docx') || fileName.endsWith('.doc');
    const isText = fileName.endsWith('.txt');

    if (!isPDF && !isWord && !isText) {
      setErrorMsg(t.invalidFile);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setPercent(null);

    try {
      let importedDoc: PDFDocument;

      if (isPDF) {
        setStatusText(t.renderingPdf);
        importedDoc = await loadPDFFile(file, (progress) => {
          setStatusText(progress.status);
          setPercent(Math.round((progress.currentPage / progress.totalPages) * 100));
        });
      } else {
        // Word or TXT
        setStatusText(t.convertingWord(file.name));
        importedDoc = await loadWordOrTextFile(file, (progress) => {
          setStatusText(progress.status);
          setPercent(progress.percent);
        });
      }

      await new Promise((r) => setTimeout(r, 400));
      setIsLoading(false);
      onImportSuccess(importedDoc);
      onClose();
    } catch (err: any) {
      console.error('Import failed:', err);
      setIsLoading(false);
      setErrorMsg(err?.message || 'Error occurred while loading document');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{t.header}</h2>
              <p className="text-xs text-neutral-500">{t.sub}</p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!isLoading ? (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-600 bg-red-50/50 scale-[1.01]'
                    : 'border-neutral-300 hover:border-red-400 hover:bg-neutral-50/50'
                }`}
              >
                {/* Supported icons row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex flex-col items-center justify-center font-bold shadow-xs">
                    <FileText className="w-6 h-6" />
                    <span className="text-[9px] font-mono mt-0.5">PDF</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-bold shadow-xs">
                    <FileText className="w-6 h-6" />
                    <span className="text-[9px] font-mono mt-0.5">DOCX</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-bold shadow-xs">
                    <FileCode className="w-6 h-6" />
                    <span className="text-[9px] font-mono mt-0.5">TXT</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-neutral-800 text-center">
                  {t.dragDrop}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">{t.orBrowse}</p>

                <div className="flex items-center gap-2 mt-4 text-[11px] text-neutral-500 font-mono">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">.pdf</span>
                  <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">.docx / .doc</span>
                  <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">.txt</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf,.docx,.doc,.txt,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            /* Loading State */
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-red-100 border-t-red-600 animate-spin" />
                {percent !== null && (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-red-600">
                    {percent}%
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-neutral-900">
                  {statusText || t.preparing}
                </h4>
                <p className="text-xs text-neutral-500">
                  {t.convertingDesc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-xs">
            <span className="text-neutral-500">{t.localNotice}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
