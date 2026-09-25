export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'text' 
  | 'image' 
  | 'rect' 
  | 'circle' 
  | 'line' 
  | 'signature' 
  | 'stamp' 
  | 'draw' 
  | 'highlight' 
  | 'eraser'
  | 'whiteout';

export type ElementType = 
  | 'text' 
  | 'image' 
  | 'rect' 
  | 'circle' 
  | 'line' 
  | 'signature' 
  | 'stamp' 
  | 'draw' 
  | 'field'
  | 'whiteout';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number; // in pixels relative to page canvas (standard A4 is 794 x 1123)
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700' | '800';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color: string;
  backgroundColor?: string;
  textAlign: 'right' | 'center' | 'left' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  paragraphIndent?: number; // تباعد بداية الفقرة (خاص بصفحات الكتب والروايات)
  isDropCap?: boolean; // For book styling
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  objectFit?: 'contain' | 'cover';
}

export interface ShapeElement extends BaseElement {
  type: 'rect' | 'circle';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface LineElement extends BaseElement {
  type: 'line';
  strokeColor: string;
  strokeWidth: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface SignatureElement extends BaseElement {
  type: 'signature';
  signatureDataUrl: string;
  signerName?: string;
  dateSigned?: string;
  strokeColor?: string;
}

export interface StampElement extends BaseElement {
  type: 'stamp';
  text: string;
  subtext?: string;
  color: string;
  shape: 'rectangle' | 'oval';
  date?: string;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawElement extends BaseElement {
  type: 'draw';
  points: DrawPoint[];
  color: string;
  strokeWidth: number;
  isHighlighter?: boolean;
}

export interface WhiteoutElement extends BaseElement {
  type: 'whiteout';
  fillColor: string;
}

export interface FieldElement extends BaseElement {
  type: 'field';
  fieldType: 'text' | 'checkbox' | 'date';
  label: string;
  value: string | boolean;
  required?: boolean;
}

export type PDFElement = 
  | TextElement 
  | ImageElement 
  | ShapeElement 
  | LineElement 
  | SignatureElement 
  | StampElement 
  | DrawElement 
  | WhiteoutElement 
  | FieldElement;

export interface PageMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
  showGuides: boolean;
}

export type BookPageType = 
  | 'cover'          // غلاف أمامي
  | 'back_cover'     // غلاف خلفي
  | 'title_page'     // صفحة العنوان والبيانات
  | 'toc'            // الفهرس وجدول المحتويات
  | 'dedication'     // الإهداء
  | 'introduction'   // المقدمة
  | 'chapter_start'  // بداية فصل
  | 'body';          // متن الكتاب

export interface PDFPage {
  id: string;
  pageNumber: number;
  chapterTitle?: string;
  pageType?: BookPageType;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  backgroundColor: string;
  backgroundImage?: string;
  elements: PDFElement[];
  rotation?: number;
}

export interface BookSettings {
  bookTitle: string;
  subTitle?: string;
  authorName: string;
  publisher?: string;
  isbn?: string;
  genre?: string;
  headerEnabled: boolean;
  headerText: string;
  footerEnabled: boolean;
  pageNumberingEnabled: boolean;
  pageNumberFormat: '1' | '1 / N' | '- 1 -' | 'Page 1';
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'alternate'; // Alternate for book spreads
  skipNumberingOnCover: boolean;
}

export interface PDFDocument {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  pageSize: 'A4' | 'Letter';
  margins: PageMargins;
  bookSettings: BookSettings;
  pages: PDFPage[];
  watermark?: {
    enabled: boolean;
    text: string;
    opacity: number;
    color: string;
    fontSize: number;
    rotation: number;
  };
}
