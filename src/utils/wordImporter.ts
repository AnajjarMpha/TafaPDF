import mammoth from 'mammoth';
import { PDFDocument, PDFPage, TextElement } from '../types/pdf';

export interface DocumentImportProgress {
  status: string;
  percent: number;
}

/**
 * Splits plain text lines into neatly formatted A4 pages with TextElements.
 */
function createPagesFromParagraphs(
  paragraphs: { text: string; isHeading?: boolean }[],
  docTitle: string
): PDFDocument {
  const pages: PDFPage[] = [];
  const targetWidth = 794;
  const targetHeight = 1123;
  const marginTop = 60;
  const marginBottom = 60;
  const marginLeft = 60;
  const usableWidth = targetWidth - marginLeft * 2;
  const maxHeightPerPage = targetHeight - marginBottom;

  let currentPageNum = 1;
  let currentElements: TextElement[] = [];
  let currentY = marginTop;
  let zIndex = 1;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const text = p.text.trim();
    if (!text) {
      currentY += 16;
      continue;
    }

    const isArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
    const isHeading = p.isHeading || (text.length < 60 && (i === 0 || text.startsWith('#') || text.endsWith(':')));
    const fontSize = isHeading ? (i === 0 ? 24 : 18) : 14;
    const lineHeight = 1.5;

    // Approximate height calculation based on text length and wrapping
    const charsPerLine = Math.floor(usableWidth / (fontSize * 0.55));
    const linesCount = Math.max(1, Math.ceil(text.length / charsPerLine));
    const elementHeight = Math.max(30, Math.round(linesCount * fontSize * lineHeight + 12));

    // If element overflows current page height, create a new page
    if (currentY + elementHeight > maxHeightPerPage && currentElements.length > 0) {
      pages.push({
        id: `imported-doc-page-${currentPageNum}-${Date.now()}`,
        pageNumber: currentPageNum,
        width: targetWidth,
        height: targetHeight,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: currentElements
      });

      currentPageNum++;
      currentElements = [];
      currentY = marginTop;
      zIndex = 1;
    }

    currentElements.push({
      id: `imported-txt-${currentPageNum}-${zIndex}-${Date.now()}`,
      type: 'text',
      x: marginLeft,
      y: currentY,
      width: usableWidth,
      height: elementHeight,
      zIndex: zIndex++,
      text: text.replace(/^#+\s*/, ''),
      fontSize: fontSize,
      fontFamily: isArabic ? 'Cairo' : 'Plus Jakarta Sans',
      fontWeight: isHeading ? 'bold' : 'normal',
      color: isHeading ? '#0f172a' : '#334155',
      textAlign: isArabic ? 'right' : 'left',
      lineHeight: lineHeight
    });

    currentY += elementHeight + (isHeading ? 14 : 10);
  }

  // Push remaining elements as last page
  if (currentElements.length > 0 || pages.length === 0) {
    pages.push({
      id: `imported-doc-page-${currentPageNum}-${Date.now()}`,
      pageNumber: currentPageNum,
      width: targetWidth,
      height: targetHeight,
      orientation: 'portrait',
      backgroundColor: '#ffffff',
      elements: currentElements
    });
  }

  return {
    id: `doc-${Date.now()}`,
    title: docTitle.endsWith('.pdf') ? docTitle : `${docTitle}.pdf`,
    author: 'المستخدم',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pageSize: 'A4',
    margins: {
      top: 48,
      bottom: 48,
      left: 48,
      right: 48,
      showGuides: false
    },
    bookSettings: {
      bookTitle: docTitle.replace('.pdf', ''),
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

/**
 * Imports a Word (.docx / .doc) or Text (.txt) file into an editable PDFDocument.
 */
export async function loadWordOrTextFile(
  file: File,
  onProgress?: (progress: DocumentImportProgress) => void
): Promise<PDFDocument> {
  const fileName = file.name.toLowerCase();

  onProgress?.({
    status: `جاري قراءة واستخراج محتوى ${file.name}...`,
    percent: 30
  });

  // Handle Plain Text (.txt)
  if (fileName.endsWith('.txt')) {
    const rawText = await file.text();
    onProgress?.({
      status: 'تنسيق الفقرات وتوزيع الصفحات بصيغة PDF...',
      percent: 70
    });

    const lines = rawText.split(/\r?\n\r?\n/).filter((t) => t.trim().length > 0);
    const paragraphs = lines.map((line, idx) => ({
      text: line.trim(),
      isHeading: idx === 0 && line.length < 80
    }));

    onProgress?.({
      status: 'اكتمل التحويل والتنسيق بنجاح!',
      percent: 100
    });

    return createPagesFromParagraphs(paragraphs, file.name.replace(/\.txt$/i, ''));
  }

  // Handle Microsoft Word (.docx)
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.({
      status: 'جاري فك تشفير مستند Word واستخراج النصوص والتنسيقات...',
      percent: 50
    });

    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value || '';

    onProgress?.({
      status: 'تقسيم المحتوى وهيكلة صفحات المستند القياسية...',
      percent: 80
    });

    const rawParagraphs = rawText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const paragraphs = rawParagraphs.map((p, idx) => ({
      text: p,
      isHeading: idx === 0 || (p.length < 70 && !p.includes('.'))
    }));

    onProgress?.({
      status: 'تم تحويل مستند Word إلى PDF بنجاح!',
      percent: 100
    });

    return createPagesFromParagraphs(paragraphs, file.name.replace(/\.docx?$/i, ''));
  }

  throw new Error('نوع الملف غير مدعوم. يرجى اختيار ملف Word (.docx, .doc) أو نص (.txt).');
}
