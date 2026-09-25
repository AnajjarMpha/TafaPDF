import jsPDF from 'jspdf';
import { toJpeg, toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  filename?: string;
  quality?: 'standard' | 'high' | 'ultra';
  pageRange?: 'all' | 'current';
  currentPageIndex?: number;
  onProgress?: (progress: number, status: string) => void;
}

/**
 * Filter function to skip non-exportable overlays (selection handles, tooltips, guides)
 */
function isExportableNode(node: Node): boolean {
  if (node instanceof HTMLElement) {
    if (
      node.classList.contains('no-export') ||
      node.classList.contains('selection-handle') ||
      node.classList.contains('bounding-box-border')
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Sanitizes any oklch(...) colors in a cloned document DOM and style elements,
 * converting them to standard rgb/hex so html2canvas never crashes.
 */
function sanitizeOklchInDoc(clonedDoc: Document): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  const cache = new Map<string, string>();

  const convertColor = (val: string): string => {
    if (!val || typeof val !== 'string' || !val.includes('oklch')) return val;
    if (cache.has(val)) return cache.get(val)!;
    if (!ctx) return '#000000';
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = val;
      const res = ctx.fillStyle;
      cache.set(val, res);
      return res;
    } catch {
      return '#000000';
    }
  };

  const oklchRegex = /oklch\([^)]+\)/gi;

  // 1. Sanitize all <style> blocks in the cloned document
  clonedDoc.querySelectorAll('style').forEach((styleEl) => {
    if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
      styleEl.textContent = styleEl.textContent.replace(oklchRegex, (match) => convertColor(match));
    }
  });

  // 2. Sanitize inline style attributes and computed styles on all elements
  clonedDoc.querySelectorAll('*').forEach((node) => {
    const el = node as HTMLElement;
    const styleAttr = el.getAttribute('style');
    if (styleAttr && styleAttr.includes('oklch')) {
      el.setAttribute('style', styleAttr.replace(oklchRegex, (match) => convertColor(match)));
    }

    try {
      const computed = window.getComputedStyle(el);
      const propsToCheck = [
        'color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-bottom-color',
        'border-left-color',
        'border-right-color',
        'outline-color',
        'fill',
        'stroke'
      ];
      for (const prop of propsToCheck) {
        const val = computed.getPropertyValue(prop);
        if (val && val.includes('oklch')) {
          el.style.setProperty(prop, convertColor(val), 'important');
        }
      }
    } catch {
      // Ignore security or styling errors on individual elements
    }
  });
}

/**
 * Fallback renderer using html2canvas with oklch pre-sanitization
 */
async function renderWithHtml2Canvas(pageEl: HTMLElement, scale: number): Promise<string> {
  const canvas = await html2canvas(pageEl, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      sanitizeOklchInDoc(clonedDoc);
    },
    ignoreElements: (element) => {
      return (
        element.classList.contains('no-export') ||
        element.classList.contains('selection-handle') ||
        element.classList.contains('bounding-box-border')
      );
    }
  });

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Renders a single page element into a high-DPI image data URL.
 * Uses html-to-image as the primary engine (supports modern oklch, Arabic typography ligatures),
 * and falls back to sanitized html2canvas if needed.
 */
async function renderPageToImageData(pageEl: HTMLElement, scale: number): Promise<string> {
  // Method 1: html-to-image (native browser color and font rendering)
  try {
    const dataUrl = await toJpeg(pageEl, {
      quality: 0.95,
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      filter: isExportableNode,
      cacheBust: false
    });

    if (dataUrl && dataUrl.length > 200) {
      return dataUrl;
    }
  } catch (err) {
    console.warn('html-to-image render attempt failed, switching to sanitized html2canvas:', err);
  }

  // Method 2: sanitized html2canvas fallback
  return await renderWithHtml2Canvas(pageEl, scale);
}

export async function exportDocumentToPDF(
  pageElements: HTMLElement[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'document.pdf',
    quality = 'high',
    pageRange = 'all',
    currentPageIndex = 0,
    onProgress
  } = options;

  if (!pageElements.length) {
    throw new Error('لا توجد صفحات متاحة للتصدير');
  }

  const pagesToExport = pageRange === 'current'
    ? [pageElements[currentPageIndex] || pageElements[0]]
    : pageElements;

  const totalPages = pagesToExport.length;

  // Scale factor: standard (1.5x), high (2x), ultra (2.5x)
  const scale = quality === 'ultra' ? 2.5 : quality === 'high' ? 2.0 : 1.5;

  onProgress?.(5, 'جاري تهيئة محرك PDF وتجهيز الخطوط...');

  // Initialize jsPDF with standard A4 in pt (595.28 x 841.89 pt)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pagesToExport.length; i++) {
    const pageEl = pagesToExport[i];
    const pageNum = i + 1;

    const progressPercent = Math.round(10 + (pageNum / totalPages) * 80);
    onProgress?.(progressPercent, `معالجة وتصيير الصفحة ${pageNum} من ${totalPages}...`);

    const imgData = await renderPageToImageData(pageEl, scale);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  onProgress?.(95, 'جاري تجميع وحفظ ملف PDF...');
  await new Promise((r) => setTimeout(r, 200));

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(cleanFilename);

  onProgress?.(100, 'تم التصدير بنجاح!');
}

export async function exportPageToImage(pageEl: HTMLElement, filename = 'page.png'): Promise<void> {
  let dataUrl: string;

  try {
    dataUrl = await toPng(pageEl, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: isExportableNode,
      cacheBust: false
    });
  } catch (err) {
    console.warn('html-to-image png render failed, falling back to html2canvas:', err);
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        sanitizeOklchInDoc(clonedDoc);
      },
      ignoreElements: (element) => {
        return (
          element.classList.contains('no-export') ||
          element.classList.contains('selection-handle') ||
          element.classList.contains('bounding-box-border')
        );
      }
    });
    dataUrl = canvas.toDataURL('image/png');
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
