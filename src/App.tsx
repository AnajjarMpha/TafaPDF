/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PDFDocument,
  PDFPage,
  PDFElement,
  ToolType,
  TextElement,
  ShapeElement,
  StampElement,
  PageMargins,
  BookSettings,
  BookPageType
} from './types/pdf';
import { TEMPLATES, TemplateItem } from './constants/templates';
import { ENGLISH_INVOICE_TEMPLATE } from './constants/englishInvoiceTemplate';
import { StampPreset } from './constants/stamps';
import { BookStructureTemplate } from './constants/bookPresets';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { PagesSidebar } from './components/PagesSidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PageCanvas } from './components/PageCanvas';
import { SignatureModal } from './components/SignatureModal';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { ExportModal } from './components/ExportModal';
import { PDFUploadModal } from './components/PDFUploadModal';
import { PDFToolsModal } from './components/PDFToolsModal';
import { BookStudioModal, PRESET_LOCALIZATIONS } from './components/BookStudioModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdUnit } from './components/AdUnit';
import { exportDocumentToPDF } from './utils/pdfExport';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations } from './constants/i18n';
import { PlatformSiteSettings } from './types/siteSettings';
import {
  loadSiteSettings,
  saveSiteSettings,
  fetchRemoteSiteConfig,
  isAdminAuthenticated,
  setAdminAuthenticated
} from './utils/siteSettingsStorage';
import { applySiteSettingsToDOM, trackPlatformEvent } from './utils/scriptInjector';

export default function App() {
  // Language state (English is primary/mother language, then Arabic, Spanish, French)
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Update HTML document dir and lang attribute dynamically when language changes
  useEffect(() => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
    document.documentElement.lang = langObj.code;
    document.documentElement.dir = langObj.dir;
  }, [language]);

  // Initial Document from English Invoice template (English is the mother language)
  const [doc, setDoc] = useState<PDFDocument>({
    id: 'doc-' + Date.now(),
    title: 'Commercial_Invoice.pdf',
    author: 'TafaPDF Studio Author',
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
      bookTitle: 'Commercial Invoice Document',
      authorName: '',
      headerEnabled: false,
      headerText: '',
      footerEnabled: false,
      pageNumberingEnabled: false,
      pageNumberFormat: '1',
      pageNumberPosition: 'bottom-center',
      skipNumberingOnCover: true
    },
    pages: JSON.parse(JSON.stringify(ENGLISH_INVOICE_TEMPLATE)),
    watermark: {
      enabled: false,
      text: 'CONFIDENTIAL',
      opacity: 0.15,
      color: '#ef4444',
      fontSize: 72,
      rotation: -35
    }
  });

  // Undo / Redo history
  const [history, setHistory] = useState<PDFDocument[]>([
    JSON.parse(JSON.stringify(doc))
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active page & element states
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [zoom, setZoom] = useState<number>(0.9);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isBookStudioModalOpen, setIsBookStudioModalOpen] = useState(false);
  // Secret Admin Portal (/adminapp) & Site Settings
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<PlatformSiteSettings>(loadSiteSettings);

  // Apply script and meta tags to DOM on mount and settings change
  useEffect(() => {
    applySiteSettingsToDOM(siteSettings);
  }, [siteSettings]);

  // Fetch remote /site-config.json for persistent deployment via GitHub
  useEffect(() => {
    fetchRemoteSiteConfig().then((remoteConfig) => {
      if (remoteConfig) {
        setSiteSettings((prev) => {
          const merged = { ...prev, ...remoteConfig };
          applySiteSettingsToDOM(merged);
          return merged;
        });
      }
    });
  }, []);

  // Listen to secret /adminapp route (Path, Hash, or Query)
  useEffect(() => {
    const checkSecretRoute = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const isSecretRoute =
        path.includes('adminapp') ||
        hash.includes('adminapp') ||
        search.includes('adminapp');

      if (isSecretRoute) {
        if (isAdminAuthenticated()) {
          setIsAdminSettingsOpen(true);
          setIsAdminLoginOpen(false);
        } else {
          setIsAdminLoginOpen(true);
          setIsAdminSettingsOpen(false);
        }
      }
    };

    checkSecretRoute();
    window.addEventListener('popstate', checkSecretRoute);
    window.addEventListener('hashchange', checkSecretRoute);
    return () => {
      window.removeEventListener('popstate', checkSecretRoute);
      window.removeEventListener('hashchange', checkSecretRoute);
    };
  }, []);

  // Keyboard shortcut Ctrl+Shift+A or Cmd+Shift+A for secret access
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdminAuthenticated()) {
          setIsAdminSettingsOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, []);

  const handleAdminLoginSuccess = useCallback(() => {
    setIsAdminLoginOpen(false);
    setIsAdminSettingsOpen(true);
  }, []);

  const handleCloseAdmin = useCallback(() => {
    setIsAdminSettingsOpen(false);
    setIsAdminLoginOpen(false);
    if (window.location.hash.includes('adminapp')) {
      window.location.hash = '';
    }
    if (window.location.pathname.includes('adminapp')) {
      window.history.pushState(null, '', '/');
    }
  }, []);

  const handleAdminLogout = useCallback(() => {
    setAdminAuthenticated(false);
    handleCloseAdmin();
  }, [handleCloseAdmin]);

  const handleSaveSiteSettings = useCallback((newSettings: PlatformSiteSettings) => {
    setSiteSettings(newSettings);
    saveSiteSettings(newSettings);
    applySiteSettingsToDOM(newSettings);
  }, []);

  // Refs for export rendering
  const pageDomRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Push new state to history
  const pushHistory = useCallback((newDoc: PDFDocument) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, JSON.parse(JSON.stringify(newDoc))].slice(-25); // keep last 25 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 24));
  }, [historyIndex]);

  const updateDoc = useCallback((updater: (prev: PDFDocument) => PDFDocument, saveHistory = true) => {
    setDoc((prev) => {
      const next = updater(prev);
      if (saveHistory) {
        pushHistory(next);
      }
      return next;
    });
  }, [pushHistory]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDoc(JSON.parse(JSON.stringify(history[newIndex])));
      setSelectedElementId(null);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDoc(JSON.parse(JSON.stringify(history[newIndex])));
      setSelectedElementId(null);
    }
  }, [historyIndex, history]);

  const currentPage = doc.pages[currentPageIndex] || doc.pages[0];
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId) || null;

  // Add Element on Current Page
  const handleAddElement = useCallback((element: PDFElement) => {
    updateDoc((prev) => {
      const newPages = prev.pages.map((p, idx) => {
        if (idx === currentPageIndex) {
          return {
            ...p,
            elements: [...p.elements, element]
          };
        }
        return p;
      });
      return { ...prev, pages: newPages, updatedAt: new Date().toISOString() };
    });
    setSelectedElementId(element.id);
  }, [currentPageIndex, updateDoc]);

  // Update Element
  const handleUpdateElement = useCallback((id: string, updates: Partial<PDFElement>) => {
    updateDoc((prev) => {
      const newPages = prev.pages.map((p, idx) => {
        if (idx === currentPageIndex) {
          return {
            ...p,
            elements: p.elements.map((el) => (el.id === id ? ({ ...el, ...updates } as PDFElement) : el))
          };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    }, true);
  }, [currentPageIndex, updateDoc]);

  // Delete Element
  const handleDeleteElement = useCallback((id: string) => {
    updateDoc((prev) => {
      const newPages = prev.pages.map((p, idx) => {
        if (idx === currentPageIndex) {
          return {
            ...p,
            elements: p.elements.filter((el) => el.id !== id)
          };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    });
    setSelectedElementId(null);
  }, [currentPageIndex, updateDoc]);

  // Duplicate Element
  const handleDuplicateElement = useCallback((id: string) => {
    const elToDup = currentPage?.elements.find((el) => el.id === id);
    if (!elToDup) return;

    const duplicated: PDFElement = {
      ...JSON.parse(JSON.stringify(elToDup)),
      id: `el-${Date.now()}`,
      x: Math.min(currentPage.width - 100, elToDup.x + 20),
      y: Math.min(currentPage.height - 50, elToDup.y + 20),
      zIndex: currentPage.elements.length + 1
    };

    handleAddElement(duplicated);
  }, [currentPage, handleAddElement]);

  // Add New Blank Page
  const handleAddPage = useCallback(() => {
    const newPage: PDFPage = {
      id: `page-${Date.now()}`,
      pageNumber: doc.pages.length + 1,
      width: 794,
      height: 1123,
      orientation: 'portrait',
      backgroundColor: '#ffffff',
      elements: []
    };

    updateDoc((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setCurrentPageIndex(doc.pages.length);
  }, [doc.pages.length, updateDoc]);

  // Duplicate Page
  const handleDuplicatePage = useCallback((index: number) => {
    const targetPage = doc.pages[index];
    if (!targetPage) return;

    const dupPage: PDFPage = {
      ...JSON.parse(JSON.stringify(targetPage)),
      id: `page-${Date.now()}`,
      pageNumber: index + 2,
      elements: targetPage.elements.map((el) => ({
        ...el,
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      }))
    };

    const newPages = [...doc.pages];
    newPages.splice(index + 1, 0, dupPage);

    updateDoc((prev) => ({
      ...prev,
      pages: newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }))
    }));
    setCurrentPageIndex(index + 1);
  }, [doc.pages, updateDoc]);

  // Delete Page
  const handleDeletePage = useCallback((index: number) => {
    if (doc.pages.length <= 1) return;

    const newPages = doc.pages.filter((_, i) => i !== index);
    updateDoc((prev) => ({
      ...prev,
      pages: newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }))
    }));
    setCurrentPageIndex((prev) => Math.min(prev, newPages.length - 1));
    setSelectedElementId(null);
  }, [doc.pages, updateDoc]);

  // Move Page
  const handleMovePage = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= doc.pages.length) return;

    const newPages = [...doc.pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);

    updateDoc((prev) => ({
      ...prev,
      pages: newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }))
    }));
    setCurrentPageIndex(toIndex);
  }, [doc.pages, updateDoc]);

  // Rotate Single Page
  const handleRotatePage = useCallback((index: number, degrees: number) => {
    updateDoc((prev) => {
      const newPages = prev.pages.map((p, i) => {
        if (i === index) {
          const currentRot = p.rotation || 0;
          const nextRot = (currentRot + degrees + 360) % 360;
          return { ...p, rotation: nextRot };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    });
  }, [updateDoc]);

  // Rotate All Pages
  const handleRotateAllPages = useCallback((degrees: number) => {
    updateDoc((prev) => {
      const newPages = prev.pages.map((p) => {
        const currentRot = p.rotation || 0;
        const nextRot = (currentRot + degrees + 360) % 360;
        return { ...p, rotation: nextRot };
      });
      return { ...prev, pages: newPages };
    });
  }, [updateDoc]);

  // Update Page background
  const handleUpdatePage = useCallback((updates: Partial<PDFPage>) => {
    updateDoc((prev) => {
      const newPages = prev.pages.map((p, idx) => {
        if (idx === currentPageIndex) {
          return { ...p, ...updates };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    });
  }, [currentPageIndex, updateDoc]);

  // Update Margins
  const handleUpdateMargins = useCallback((margins: PageMargins) => {
    updateDoc((prev) => ({
      ...prev,
      margins
    }));
  }, [updateDoc]);

  // Update Book Settings
  const handleUpdateBookSettings = useCallback((bookSettings: BookSettings) => {
    updateDoc((prev) => ({
      ...prev,
      bookSettings
    }));
  }, [updateDoc]);

  // Apply Full Book Structure Preset
  const handleApplyBookPreset = useCallback((preset: BookStructureTemplate) => {
    const loc = PRESET_LOCALIZATIONS[preset.id]?.[language];
    const localizedTitle = loc ? loc.name : preset.name;
    const isAr = language === 'ar';

    let clonedPages: PDFPage[] = JSON.parse(JSON.stringify(preset.pages));

    if (!isAr && preset.id === 'novel_classic') {
      clonedPages = [
        // 1. Cover
        {
          ...clonedPages[0],
          elements: [
            clonedPages[0].elements[0], // border
            {
              id: `b-el-genre-${Date.now()}`,
              type: 'text',
              x: 100,
              y: 160,
              width: 594,
              height: 30,
              zIndex: 2,
              text: 'A NOVEL',
              fontSize: 16,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: '600',
              color: '#fbbf24',
              textAlign: 'center',
              lineHeight: 1.5
            },
            {
              id: `b-el-title-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 340,
              width: 654,
              height: 90,
              zIndex: 2,
              text: 'ECHOES OF THE DESERT',
              fontSize: 38,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.4
            },
            {
              id: `b-el-sub-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 440,
              width: 654,
              height: 40,
              zIndex: 2,
              text: 'A Journey of Origins and Destiny Across the Sands',
              fontSize: 17,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'normal',
              color: '#cbd5e1',
              textAlign: 'center'
            },
            {
              id: `b-el-author-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 780,
              width: 654,
              height: 40,
              zIndex: 2,
              text: 'By: Dr. Edward Sterling',
              fontSize: 22,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: '600',
              color: '#f59e0b',
              textAlign: 'center'
            },
            {
              id: `b-el-publisher-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 840,
              width: 654,
              height: 30,
              zIndex: 2,
              text: 'Modern Literary Press • First Edition 2026',
              fontSize: 13,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'normal',
              color: '#94a3b8',
              textAlign: 'center'
            }
          ]
        },
        // 2. Dedication
        {
          ...clonedPages[1],
          elements: [
            {
              id: `b-el-ded-title-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 280,
              width: 654,
              height: 60,
              zIndex: 2,
              text: 'DEDICATION',
              fontSize: 26,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'bold',
              color: '#1e293b',
              textAlign: 'center'
            },
            {
              id: `b-el-ded-body-${Date.now()}`,
              type: 'text',
              x: 120,
              y: 380,
              width: 554,
              height: 250,
              zIndex: 2,
              text: 'To those who search for their true calling amidst the noise,\nand to everyone writing their own history with courage and perseverance.\n\nThis work is dedicated to you.',
              fontSize: 16,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'normal',
              color: '#475569',
              textAlign: 'center',
              lineHeight: 2.0
            }
          ]
        },
        // 3. Table of Contents
        {
          ...clonedPages[2],
          elements: [
            {
              id: `b-el-toc-h-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 90,
              width: 654,
              height: 50,
              zIndex: 2,
              text: 'Table of Contents',
              fontSize: 28,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'bold',
              color: '#1e293b',
              textAlign: 'center'
            },
            clonedPages[2].elements[1], // line
            {
              id: `b-el-toc-items-${Date.now()}`,
              type: 'text',
              x: 90,
              y: 190,
              width: 614,
              height: 400,
              zIndex: 2,
              text: 'Preface & Author Notes ................................................................ Page 3\n\nChapter I: The First Horizon and Desert Whispers ...................... Page 5\n\nChapter II: The Journey Eastward ............................................... Page 18\n\nChapter III: A Flash in the Midnight Abyss ................................. Page 34\n\nEpilogue: Return to the Canyon ................................................. Page 52',
              fontSize: 15,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'normal',
              color: '#334155',
              textAlign: 'left',
              lineHeight: 2.2
            }
          ]
        },
        // 4. Chapter Start
        {
          ...clonedPages[3],
          elements: [
            {
              id: `b-el-ch1-badge-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 120,
              width: 654,
              height: 30,
              zIndex: 2,
              text: 'CHAPTER I',
              fontSize: 14,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'bold',
              color: '#d97706',
              textAlign: 'center'
            },
            {
              id: `b-el-ch1-title-${Date.now()}`,
              type: 'text',
              x: 70,
              y: 160,
              width: 654,
              height: 50,
              zIndex: 2,
              text: 'The First Horizon and Desert Whispers',
              fontSize: 26,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'bold',
              color: '#0f172a',
              textAlign: 'center'
            },
            clonedPages[3].elements[2], // line
            {
              id: `b-el-ch1-body-${Date.now()}`,
              type: 'text',
              x: 80,
              y: 280,
              width: 634,
              height: 500,
              zIndex: 2,
              text: 'The sun was sinking toward the distant dunes when the caravan halted at the edge of the ancient canyon. An immense silence enveloped the landscape, interrupted only by the rustle of the dry desert wind and the faint sound of shifting sand.\n\nLord Sterling dismounted from his camel, touching the worn leather map case that had been preserved in his family for three generations. The faded markings revealed coordinates no standard atlas had ever charted.',
              fontSize: 15,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'normal',
              color: '#334155',
              textAlign: 'left',
              lineHeight: 1.9
            }
          ]
        }
      ];
    }

    updateDoc((prev) => ({
      ...prev,
      title: `${localizedTitle}.pdf`,
      bookSettings: {
        ...(prev.bookSettings || {}),
        bookTitle: localizedTitle,
        headerEnabled: true,
        pageNumberingEnabled: true
      },
      pages: clonedPages
    }));
    setCurrentPageIndex(0);
    setSelectedElementId(null);
  }, [language, updateDoc]);

  // Insert a Specialized Book Page
  const handleInsertBookPage = useCallback((type: BookPageType, chapterTitle?: string) => {
    const basePageNumber = currentPageIndex + 2;
    let newPage: PDFPage;

    const isAr = language === 'ar';
    const defaultCoverTitle = isAr ? 'عنوان الكتاب البارز' : language === 'es' ? 'Título Destacado del Libro' : language === 'fr' ? 'Titre Principal du Livre' : 'Distinguished Book Title';
    const defaultAuthor = isAr ? 'اسم الكاتب' : language === 'es' ? 'Nombre del Autor' : language === 'fr' ? 'Nom de l’Auteur' : 'Author Name';
    const authorPrefix = isAr ? 'تأليف: ' : language === 'es' ? 'Por: ' : language === 'fr' ? 'Par : ' : 'By: ';

    if (type === 'cover') {
      newPage = {
        id: `page-book-cover-${Date.now()}`,
        pageNumber: basePageNumber,
        pageType: 'cover',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#0f172a',
        elements: [
          {
            id: `el-cover-border-${Date.now()}`,
            type: 'rect',
            x: 50,
            y: 50,
            width: 694,
            height: 1023,
            zIndex: 1,
            fillColor: 'transparent',
            strokeColor: '#f59e0b',
            strokeWidth: 2,
            borderRadius: 8
          },
          {
            id: `el-cover-title-${Date.now()}`,
            type: 'text',
            x: 70,
            y: 350,
            width: 654,
            height: 120,
            zIndex: 2,
            text: doc.bookSettings?.bookTitle || defaultCoverTitle,
            fontSize: 40,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.4
          },
          {
            id: `el-cover-author-${Date.now()}`,
            type: 'text',
            x: 70,
            y: 800,
            width: 654,
            height: 40,
            zIndex: 2,
            text: `${authorPrefix}${doc.bookSettings?.authorName || defaultAuthor}`,
            fontSize: 20,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: '600',
            color: '#f59e0b',
            textAlign: 'center'
          }
        ]
      };
    } else if (type === 'toc') {
      const tocHeading = isAr ? 'فهرس المحتويات' : language === 'es' ? 'Índice de Contenidos' : language === 'fr' ? 'Table des Matières' : 'Table of Contents';
      const item1 = isAr ? 'الفصل الأول: البدايات والمنطلقات ................................ صفحة ٥' : 'Chapter 1: Foundations & Core Principles ................................... Page 5';
      const item2 = isAr ? 'الفصل الثاني: المحاور والتطبيقات العملية ...................... صفحة ١٩' : 'Chapter 2: Methods & Practical Applications .............................. Page 19';
      const item3 = isAr ? 'الفصل الثالث: الخاتمة والنتائج والتوصيات ....................... صفحة ٤٢' : 'Chapter 3: Synthesis, Findings & Outlook ................................... Page 42';

      newPage = {
        id: `page-book-toc-${Date.now()}`,
        pageNumber: basePageNumber,
        pageType: 'toc',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: `el-toc-h-${Date.now()}`,
            type: 'text',
            x: 70,
            y: 80,
            width: 654,
            height: 50,
            zIndex: 2,
            text: tocHeading,
            fontSize: 28,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: 'bold',
            color: '#1e293b',
            textAlign: 'center'
          },
          {
            id: `el-toc-line-${Date.now()}`,
            type: 'line',
            x: 100,
            y: 140,
            width: 594,
            height: 2,
            zIndex: 1,
            strokeColor: '#e2e8f0',
            strokeWidth: 2
          },
          {
            id: `el-toc-item1-${Date.now()}`,
            type: 'text',
            x: 90,
            y: 180,
            width: 614,
            height: 40,
            zIndex: 2,
            text: item1,
            fontSize: 14,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: 'normal',
            color: '#334155',
            textAlign: isAr ? 'right' : 'left'
          },
          {
            id: `el-toc-item2-${Date.now()}`,
            type: 'text',
            x: 90,
            y: 230,
            width: 614,
            height: 40,
            zIndex: 2,
            text: item2,
            fontSize: 14,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: 'normal',
            color: '#334155',
            textAlign: isAr ? 'right' : 'left'
          },
          {
            id: `el-toc-item3-${Date.now()}`,
            type: 'text',
            x: 90,
            y: 280,
            width: 614,
            height: 40,
            zIndex: 2,
            text: item3,
            fontSize: 14,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: 'normal',
            color: '#334155',
            textAlign: isAr ? 'right' : 'left'
          }
        ]
      };
    } else if (type === 'chapter_start') {
      const chHeader = isAr ? 'الفـصـل الأول' : language === 'es' ? 'Capítulo I' : language === 'fr' ? 'Chapitre I' : 'Chapter I';
      const chTitle = chapterTitle || (isAr ? 'الرؤية العامة وأسس الانطلاق' : 'General Vision & Strategic Framework');
      const chText = isAr
        ? 'تبدأ رحلة كل كتاب بفكرة تتشكل معالمها رويداً رويداً حتى تصبح عملاً متكاملاً. انقر هنا لبدء كتابة متن هذا الفصل بحرية، وضبط الخطوط والتنسيقات كيفما تشاء...'
        : 'Every remarkable book begins with a clear spark of insight that gradually expands into a comprehensive work. Click here to edit chapter text freely with book-grade typographic controls...';

      newPage = {
        id: `page-book-ch-${Date.now()}`,
        pageNumber: basePageNumber,
        pageType: 'chapter_start',
        chapterTitle: chapterTitle || chTitle,
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: `el-ch-num-${Date.now()}`,
            type: 'text',
            x: 80,
            y: 180,
            width: 634,
            height: 40,
            zIndex: 2,
            text: chHeader,
            fontSize: 18,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: '600',
            color: '#d97706',
            textAlign: 'center'
          },
          {
            id: `el-ch-title-${Date.now()}`,
            type: 'text',
            x: 80,
            y: 230,
            width: 634,
            height: 60,
            zIndex: 2,
            text: chTitle,
            fontSize: 30,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'center'
          },
          {
            id: `el-ch-line-${Date.now()}`,
            type: 'line',
            x: 250,
            y: 310,
            width: 294,
            height: 2,
            zIndex: 1,
            strokeColor: '#f59e0b',
            strokeWidth: 2
          },
          {
            id: `el-ch-text-${Date.now()}`,
            type: 'text',
            x: 90,
            y: 360,
            width: 614,
            height: 500,
            zIndex: 2,
            text: chText,
            fontSize: 16,
            fontFamily: isAr ? 'Amiri' : 'Plus Jakarta Sans',
            fontWeight: 'normal',
            color: '#1e293b',
            textAlign: 'justify',
            lineHeight: 2.0
          }
        ]
      };
    } else {
      // Body or generic book page
      const bodyText = isAr
        ? 'اكتب نص الصفحة هنا. تتميز صفحات الكتب بتنسيق مريح للعين، وهوامش مضبوطة تضمن بقاء النصوص بعيداً عن ثنيات التجليد والقص أثناء الطباعة.'
        : 'Write page content here. Structured book pages feature calibrated margins and comfortable line spacing to guarantee optimal reading clarity and printing bleed safety.';

      newPage = {
        id: `page-book-body-${Date.now()}`,
        pageNumber: basePageNumber,
        pageType: type,
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: `el-body-t-${Date.now()}`,
            type: 'text',
            x: 90,
            y: 90,
            width: 614,
            height: 900,
            zIndex: 2,
            text: bodyText,
            fontSize: 15,
            fontFamily: isAr ? 'Cairo' : 'Plus Jakarta Sans',
            fontWeight: 'normal',
            color: '#334155',
            textAlign: 'justify',
            lineHeight: 1.9
          }
        ]
      };
    }

    const newPages = [...doc.pages];
    newPages.splice(currentPageIndex + 1, 0, newPage);

    updateDoc((prev) => ({
      ...prev,
      pages: newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }))
    }));
    setCurrentPageIndex(currentPageIndex + 1);
  }, [currentPageIndex, doc.bookSettings, doc.pages, language, updateDoc]);

  // Update Watermark
  const handleUpdateWatermark = useCallback((watermark: PDFDocument['watermark']) => {
    updateDoc((prev) => ({
      ...prev,
      watermark
    }));
  }, [updateDoc]);

  // Insert Text
  const handleAddText = useCallback((variant: 'heading' | 'subheading' | 'body') => {
    const t = translations[language] || translations.en;
    const textConfig = {
      heading: { text: t.defaultTextHeading, fontSize: 26, fontWeight: 'bold' as const, height: 45 },
      subheading: { text: t.defaultTextSubheading, fontSize: 18, fontWeight: '600' as const, height: 35 },
      body: { text: t.defaultTextBody, fontSize: 14, fontWeight: 'normal' as const, height: 60 }
    }[variant];

    const newEl: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 150 + (currentPage.elements.length * 15) % 300,
      width: 594,
      height: textConfig.height,
      zIndex: currentPage.elements.length + 10,
      text: textConfig.text,
      fontSize: textConfig.fontSize,
      fontFamily: language === 'ar' ? 'Cairo' : 'Plus Jakarta Sans',
      fontWeight: textConfig.fontWeight,
      color: '#0f172a',
      backgroundColor: '#ffffff',
      textAlign: language === 'ar' ? 'right' : 'left',
      lineHeight: 1.5
    };

    handleAddElement(newEl);
  }, [currentPage.elements.length, handleAddElement, language]);

  // Insert Shape
  const handleAddShape = useCallback((shape: 'rect' | 'circle' | 'line') => {
    if (shape === 'line') {
      handleAddElement({
        id: `line-${Date.now()}`,
        type: 'line',
        x: 100,
        y: 200,
        width: 594,
        height: 2,
        zIndex: currentPage.elements.length + 1,
        strokeColor: '#cbd5e1',
        strokeWidth: 2,
        borderStyle: 'solid'
      });
    } else {
      const newShape: ShapeElement = {
        id: `shape-${Date.now()}`,
        type: shape,
        x: 150,
        y: 200,
        width: 200,
        height: shape === 'circle' ? 200 : 120,
        zIndex: currentPage.elements.length + 1,
        fillColor: '#f1f5f9',
        strokeColor: '#475569',
        strokeWidth: 1,
        borderRadius: shape === 'rect' ? 8 : undefined
      };
      handleAddElement(newShape);
    }
    setActiveTool('select');
  }, [currentPage.elements.length, handleAddElement]);

  // Upload Image
  const handleUploadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      handleAddElement({
        id: `img-${Date.now()}`,
        type: 'image',
        x: 150,
        y: 200,
        width: 250,
        height: 180,
        zIndex: currentPage.elements.length + 1,
        src,
        borderRadius: 4,
        objectFit: 'contain'
      });
      setActiveTool('select');
    };
    reader.readAsDataURL(file);
  }, [currentPage.elements.length, handleAddElement]);

  // Apply Digital Signature
  const handleApplySignature = useCallback((dataUrl: string, name?: string) => {
    handleAddElement({
      id: `sig-${Date.now()}`,
      type: 'signature',
      x: 250,
      y: 650,
      width: 220,
      height: 90,
      zIndex: currentPage.elements.length + 1,
      signatureDataUrl: dataUrl,
      signerName: name || (language === 'ar' ? 'توقيع معتمد' : language === 'es' ? 'Firma Autorizada' : language === 'fr' ? 'Signature Autorisée' : 'Authorized Signature'),
      dateSigned: new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
    });
  }, [currentPage.elements.length, handleAddElement, language]);

  // Apply Preset Stamp
  const handleAddStamp = useCallback((stamp: StampPreset) => {
    const newStamp: StampElement = {
      id: `stamp-${Date.now()}`,
      type: 'stamp',
      x: 300,
      y: 400,
      width: 180,
      height: 80,
      zIndex: currentPage.elements.length + 1,
      text: stamp.title,
      subtext: stamp.subtitle,
      color: stamp.color,
      shape: stamp.shape,
      date: new Date().toISOString().split('T')[0],
      rotation: -3
    };
    handleAddElement(newStamp);
  }, [currentPage.elements.length, handleAddElement]);

  // Apply Template
  const handleSelectTemplate = useCallback((template: TemplateItem) => {
    let clonedPages: PDFPage[];

    if (template.id === 'tax-invoice' && language !== 'ar') {
      clonedPages = JSON.parse(JSON.stringify(ENGLISH_INVOICE_TEMPLATE));
    } else if (template.id === 'blank' && language !== 'ar') {
      clonedPages = [
        {
          id: `p-${Date.now()}`,
          pageNumber: 1,
          width: 794,
          height: 1123,
          orientation: 'portrait',
          backgroundColor: '#ffffff',
          elements: [
            {
              id: `txt-blank-title-${Date.now()}`,
              type: 'text',
              x: 60,
              y: 70,
              width: 674,
              height: 48,
              zIndex: 1,
              text: 'Document Title',
              fontSize: 28,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'bold',
              color: '#0f172a',
              textAlign: 'left',
              lineHeight: 1.4
            },
            {
              id: `line-blank-div-${Date.now()}`,
              type: 'line',
              x: 60,
              y: 125,
              width: 674,
              height: 2,
              zIndex: 2,
              strokeColor: '#e2e8f0',
              strokeWidth: 2,
              borderStyle: 'solid'
            },
            {
              id: `txt-blank-body-${Date.now()}`,
              type: 'text',
              x: 60,
              y: 150,
              width: 674,
              height: 120,
              zIndex: 3,
              text: 'Double-click here to start typing your content. You can add extra text boxes, images, digital signatures, and shapes from the top toolbar.',
              fontSize: 16,
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 'normal',
              color: '#475569',
              textAlign: 'left',
              lineHeight: 1.6
            }
          ]
        }
      ];
    } else {
      clonedPages = JSON.parse(JSON.stringify(template.pages));
    }

    const title = language === 'ar' ? template.name : template.nameEn;
    updateDoc((prev) => ({
      ...prev,
      title: `${title}.pdf`,
      pages: clonedPages
    }));
    setCurrentPageIndex(0);
    setSelectedElementId(null);
  }, [language, updateDoc]);

  // Imported PDF File Handler
  const handleImportPDF = useCallback((importedDoc: PDFDocument) => {
    updateDoc(() => importedDoc);
    setCurrentPageIndex(0);
    setSelectedElementId(null);
  }, [updateDoc]);

  // Delete Pages Range (PDF Tool)
  const handleDeletePagesRange = useCallback((startPage: number, endPage: number) => {
    const s = Math.max(1, startPage) - 1;
    const e = Math.min(doc.pages.length, endPage) - 1;

    const remainingPages = doc.pages.filter((_, idx) => idx < s || idx > e);
    if (!remainingPages.length) return;

    updateDoc((prev) => ({
      ...prev,
      pages: remainingPages.map((p, i) => ({ ...p, pageNumber: i + 1 }))
    }));
    setCurrentPageIndex(0);
    setSelectedElementId(null);
  }, [doc.pages, updateDoc]);

  // Duplicate Pages Range (PDF Tool)
  const handleDuplicatePageRange = useCallback((startPage: number, endPage: number) => {
    const s = Math.max(1, startPage) - 1;
    const e = Math.min(doc.pages.length, endPage) - 1;

    const sliceToDup = doc.pages.slice(s, e + 1).map((p) => ({
      ...JSON.parse(JSON.stringify(p)),
      id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    }));

    const newPages = [...doc.pages];
    newPages.splice(e + 1, 0, ...sliceToDup);

    updateDoc((prev) => ({
      ...prev,
      pages: newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }))
    }));
  }, [doc.pages, updateDoc]);

  // Split Document (PDF Tool)
  const handleSplitDocument = useCallback(async (splitAtPage: number) => {
    const part1Pages = pageDomRefs.current.slice(0, splitAtPage).filter(Boolean) as HTMLElement[];
    const part2Pages = pageDomRefs.current.slice(splitAtPage).filter(Boolean) as HTMLElement[];

    if (part1Pages.length) {
      await exportDocumentToPDF(part1Pages, {
        filename: `${doc.title.replace('.pdf', '')}_Part1.pdf`,
        quality: 'high'
      });
    }

    if (part2Pages.length) {
      await exportDocumentToPDF(part2Pages, {
        filename: `${doc.title.replace('.pdf', '')}_Part2.pdf`,
        quality: 'high'
      });
    }
  }, [doc.title]);

  // Compress Document (PDF Tool)
  const handleCompressDocument = useCallback(() => {
    // Quality compression
    setIsExportModalOpen(true);
  }, []);

  // Save Project as JSON file
  const handleSaveProject = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${doc.title.replace('.pdf', '')}_project.acrobat.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [doc]);

  // Load Project JSON
  const handleLoadProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string);
            if (parsed.pages) {
              setDoc(parsed);
              pushHistory(parsed);
              setCurrentPageIndex(0);
            }
          } catch (err) {
            console.error('Invalid JSON file', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [pushHistory]);

  // Keyboard Shortcuts (Delete, Ctrl+Z, Ctrl+Y, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTagName = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTagName === 'input' || activeTagName === 'textarea') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (selectedElementId) {
          e.preventDefault();
          handleDuplicateElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedElementId, handleDeleteElement, handleDuplicateElement]);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-100 text-neutral-900 select-none">
      {/* Acrobat Top Bar */}
      <TopBar
        documentTitle={doc.title}
        onUpdateTitle={(title) => updateDoc((p) => ({ ...p, title }))}
        zoom={zoom}
        onZoomChange={setZoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        currentPageIndex={currentPageIndex}
        totalPages={doc.pages.length}
        onPageChange={setCurrentPageIndex}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenToolsModal={() => setIsToolsModalOpen(true)}
        onOpenBookStudioModal={() => setIsBookStudioModalOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Top Banner Ad Unit (if AdSense is enabled) */}
      {!isFullscreen && siteSettings.adsense.enabled && (
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-1.5 flex justify-center shrink-0">
          <AdUnit slotType="top-banner" settings={siteSettings} />
        </div>
      )}

      {/* Main Editing Tools Ribbon */}
      {!isFullscreen && (
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onUploadImage={handleUploadImage}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
          onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenToolsModal={() => setIsToolsModalOpen(true)}
          onOpenBookStudioModal={() => setIsBookStudioModalOpen(true)}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      {/* Body: Left Sidebar + Central Work Area + Right Properties Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pages Navigation Sidebar */}
        {!isFullscreen && (
          <PagesSidebar
            pages={doc.pages}
            currentPageIndex={currentPageIndex}
            onSelectPage={setCurrentPageIndex}
            onAddPage={handleAddPage}
            onDuplicatePage={handleDuplicatePage}
            onDeletePage={handleDeletePage}
            onMovePage={handleMovePage}
            onRotatePage={(idx, deg) => handleRotatePage(idx, deg)}
            onAddStamp={handleAddStamp}
            onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenToolsModal={() => setIsToolsModalOpen(true)}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            language={language}
          />
        )}

        {/* Central Viewport / PDF Pages Scroll Area */}
        <div className="flex-1 overflow-auto bg-neutral-200/80 flex flex-col items-center justify-start p-6">
          {doc.pages.map((page, index) => {
            const isTarget = index === currentPageIndex;
            return (
              <div
                key={page.id}
                style={{ display: isTarget ? 'block' : 'none' }}
                className="w-full flex justify-center"
              >
                <PageCanvas
                  page={page}
                  pageIndex={index}
                  totalPages={doc.pages.length}
                  zoom={zoom}
                  activeTool={activeTool}
                  selectedElementId={selectedElementId}
                  margins={doc.margins}
                  bookSettings={doc.bookSettings}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                  onDuplicateElement={handleDuplicateElement}
                  onAddElement={handleAddElement}
                  watermark={doc.watermark}
                  showGrid={showGrid}
                  language={language}
                  domRef={{
                    current: pageDomRefs.current[index] || null
                  } as any}
                />
              </div>
            );
          })}

          {/* Off-screen reference container for multi-page export */}
          <div
            style={{
              position: 'fixed',
              left: '-99999px',
              top: 0,
              pointerEvents: 'none',
              zIndex: -9999,
              opacity: 1
            }}
          >
            {doc.pages.map((page, index) => (
              <div
                key={`export-${page.id}`}
                ref={(el) => {
                  pageDomRefs.current[index] = el;
                }}
              >
                <PageCanvas
                  page={page}
                  pageIndex={index}
                  totalPages={doc.pages.length}
                  zoom={1.0}
                  activeTool="select"
                  selectedElementId={null}
                  margins={doc.margins}
                  bookSettings={doc.bookSettings}
                  onSelectElement={() => {}}
                  onUpdateElement={() => {}}
                  onDeleteElement={() => {}}
                  onDuplicateElement={() => {}}
                  onAddElement={() => {}}
                  watermark={doc.watermark}
                  showGrid={false}
                  language={language}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Properties Panel */}
        {!isFullscreen && (
          <PropertiesPanel
            selectedElement={selectedElement}
            currentPage={currentPage}
            documentData={doc}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onUpdatePage={handleUpdatePage}
            onUpdateMargins={handleUpdateMargins}
            onUpdateWatermark={handleUpdateWatermark}
            onUpdateBookSettings={handleUpdateBookSettings}
            onOpenBookStudio={() => setIsBookStudioModalOpen(true)}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            language={language}
          />
        )}
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onApplySignature={handleApplySignature}
        language={language}
      />

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        language={language}
      />

      {/* PDF Upload Modal */}
      <PDFUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportSuccess={handleImportPDF}
        language={language}
      />

      {/* Book Studio Modal */}
      <BookStudioModal
        isOpen={isBookStudioModalOpen}
        onClose={() => setIsBookStudioModalOpen(false)}
        bookSettings={doc.bookSettings}
        onUpdateBookSettings={handleUpdateBookSettings}
        onApplyBookPreset={handleApplyBookPreset}
        onInsertBookPage={handleInsertBookPage}
        currentPageIndex={currentPageIndex}
        language={language}
      />

      {/* PDF Power Tools Modal */}
      <PDFToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        documentData={doc}
        currentPageIndex={currentPageIndex}
        onRotateCurrentPage={(deg) => handleRotatePage(currentPageIndex, deg)}
        onRotateAllPages={handleRotateAllPages}
        onDeletePagesRange={handleDeletePagesRange}
        onDuplicatePageRange={handleDuplicatePageRange}
        onSplitDocument={handleSplitDocument}
        onMergeDocument={handleImportPDF}
        onCompressDocument={handleCompressDocument}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        language={language}
      />

      {/* Export & Print Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        documentTitle={doc.title.replace('.pdf', '')}
        totalPages={doc.pages.length}
        currentPageIndex={currentPageIndex}
        pageContainerRefs={pageDomRefs.current.filter(Boolean) as HTMLElement[]}
        language={language}
        settings={siteSettings}
      />

      {/* Secret Admin Login Gateway (/adminapp) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={handleCloseAdmin}
        onSuccess={handleAdminLoginSuccess}
        language={language}
      />

      {/* Platform Administration, Google AdSense, Analytics, GitHub & SEO Modal */}
      <AdminSettingsModal
        isOpen={isAdminSettingsOpen}
        onClose={handleCloseAdmin}
        onLogout={handleAdminLogout}
        settings={siteSettings}
        onSaveSettings={handleSaveSiteSettings}
        language={language}
      />
    </div>
  );
}
