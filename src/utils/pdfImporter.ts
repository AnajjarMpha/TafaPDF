import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFPage, TextElement } from '../types/pdf';

// Configure pdfjs worker using unpkg or cdnjs
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface PDFLoadProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

interface RawTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, transX, transY]
  fontName: string;
}

/**
 * Loads a user-uploaded PDF File, extracts existing text items as real editable TextElements,
 * and renders a clean background layer so the user can click, edit, and move all texts directly!
 */
export async function loadPDFFile(
  file: File,
  onProgress?: (progress: PDFLoadProgress) => void
): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({
    currentPage: 0,
    totalPages: 1,
    status: 'جاري فك تشفير وتجهيز ملف الـ PDF واستخراج النصوص...'
  });

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: PDFPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.({
      currentPage: pageNum,
      totalPages: numPages,
      status: `معالجة واستخراج نصوص الصفحة ${pageNum} من ${numPages}...`
    });

    const page = await pdfDoc.getPage(pageNum);
    
    // Standard target is 794px width (A4 width at 96 DPI)
    const initialViewport = page.getViewport({ scale: 1.0 });
    const targetWidth = 794;
    const scaleFactor = targetWidth / initialViewport.width;
    
    // Render at 2x resolution for crisp graphics/vectors
    const renderScale = scaleFactor * 2.0;
    const viewport = page.getViewport({ scale: renderScale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      await page.render(renderContext as any).promise;
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
    const pageHeight = Math.round(initialViewport.height * scaleFactor);

    // Extract text content from the PDF page
    const textContent = await page.getTextContent();
    const textItems = textContent.items as RawTextItem[];
    const elements: TextElement[] = [];

    // Group adjacent text items into coherent paragraphs/lines
    interface LineGroup {
      items: RawTextItem[];
      y: number;
      minX: number;
      maxX: number;
      height: number;
    }

    const lineGroups: LineGroup[] = [];

    for (const item of textItems) {
      if (!item.str || !item.str.trim()) continue;

      // item.transform: [scaleX, skewY, skewX, scaleY, x, y] (PDF coordinate system, Y starts from bottom)
      const pdfX = item.transform[4];
      const pdfY = item.transform[5];
      const fontHeight = Math.abs(item.transform[3]) || Math.abs(item.height) || 12;

      // Convert to web coordinates (Y starts from top)
      const x = Math.round(pdfX * scaleFactor);
      const y = Math.round((initialViewport.height - pdfY - fontHeight) * scaleFactor);
      const width = Math.max(20, Math.round(item.width * scaleFactor));
      const height = Math.max(16, Math.round(fontHeight * scaleFactor * 1.3));

      // Try to find a line group that has a similar Y coordinate (+- 6px)
      const existingGroup = lineGroups.find((g) => Math.abs(g.y - y) <= 6);
      if (existingGroup) {
        existingGroup.items.push(item);
        existingGroup.minX = Math.min(existingGroup.minX, x);
        existingGroup.maxX = Math.max(existingGroup.maxX, x + width);
        existingGroup.height = Math.max(existingGroup.height, height);
      } else {
        lineGroups.push({
          items: [item],
          y,
          minX: x,
          maxX: x + width,
          height
        });
      }
    }

    // Convert line groups to editable TextElements
    let zIdx = 1;
    for (const group of lineGroups) {
      // Sort items by X coordinate
      group.items.sort((a, b) => a.transform[4] - b.transform[4]);
      const combinedText = group.items.map((i) => i.str).join(' ').trim();
      if (!combinedText) continue;

      const firstItem = group.items[0];
      const fontHeight = Math.abs(firstItem.transform[3]) || 13;
      const calculatedFontSize = Math.max(11, Math.min(72, Math.round(fontHeight * scaleFactor)));

      // Detect if text is Arabic / RTL
      const isArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(combinedText);

      elements.push({
        id: `pdf-text-${pageNum}-${zIdx}-${Date.now()}`,
        type: 'text',
        x: Math.max(10, group.minX),
        y: Math.max(10, group.y),
        width: Math.min(targetWidth - 20, Math.max(80, group.maxX - group.minX + 30)),
        height: Math.max(24, group.height + 6),
        zIndex: zIdx++,
        text: combinedText,
        fontSize: calculatedFontSize,
        fontFamily: isArabic ? 'Cairo' : 'Plus Jakarta Sans',
        fontWeight: calculatedFontSize >= 20 ? 'bold' : 'normal',
        color: '#0f172a',
        backgroundColor: '#ffffff', // Background cover so edited text cleanly masks previous bitmap
        textAlign: isArabic ? 'right' : 'left',
        lineHeight: 1.4
      });
    }

    pages.push({
      id: `uploaded-p-${pageNum}-${Date.now()}`,
      pageNumber: pageNum,
      width: targetWidth,
      height: pageHeight || 1123,
      orientation: targetWidth > pageHeight ? 'landscape' : 'portrait',
      backgroundColor: '#ffffff',
      backgroundImage: dataUrl,
      elements: elements // populated with editable text elements directly!
    });
  }

  onProgress?.({
    currentPage: numPages,
    totalPages: numPages,
    status: 'تم استخراج النصوص وتحويل المستند لوضع التحرير الكامل بنجاح!'
  });

  const cleanTitle = file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`;

  return {
    id: `doc-${Date.now()}`,
    title: cleanTitle,
    author: 'المستخدم',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pageSize: 'A4',
    margins: {
      top: 36,
      bottom: 36,
      left: 36,
      right: 36,
      showGuides: false
    },
    bookSettings: {
      bookTitle: cleanTitle.replace('.pdf', ''),
      authorName: 'المؤلف',
      headerEnabled: false,
      headerText: '',
      footerEnabled: true,
      pageNumberingEnabled: true,
      pageNumberFormat: '1',
      pageNumberPosition: 'bottom-center',
      skipNumberingOnCover: true
    },
    pages
  };
}
