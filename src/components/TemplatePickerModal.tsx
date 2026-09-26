import React, { useState } from 'react';
import { TEMPLATES, TemplateItem } from '../constants/templates';
import { X, FileText, Check, Sparkles, Layers } from 'lucide-react';
import { SupportedLanguage, translations } from '../constants/i18n';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  language?: SupportedLanguage;
}

const TEMPLATE_LOCALIZATIONS: Record<
  string,
  Record<SupportedLanguage, { category: string; description: string; tag: string }>
> = {
  blank: {
    en: {
      category: 'General',
      description: 'Clean blank canvas to start from scratch with calibrated standard A4 dimensions.',
      tag: 'Standard Blank'
    },
    ar: {
      category: 'عام',
      description: 'صفحة بيضاء فارغة للبدء من الصفر بتنسيق A4 القياسي.',
      tag: 'Acrobat Standard'
    },
    es: {
      category: 'General',
      description: 'Lienzo blanco limpio para comenzar desde cero con dimensiones A4 estándar.',
      tag: 'Blanco Estándar'
    },
    fr: {
      category: 'Général',
      description: 'Page blanche propre pour commencer de zéro avec le format A4 standard.',
      tag: 'Blanc Standard'
    }
  },
  'tax-invoice': {
    en: {
      category: 'Business',
      description: 'Professional commercial and tax invoice with itemized table, VAT calculation, and signature.',
      tag: 'Commercial Document'
    },
    ar: {
      category: 'أعمال',
      description: 'فاتورة رسمية متوافقة مع متطلبات الفوترة الضريبية مع جدول أصناف وحساب المجموع والضريبة.',
      tag: 'Commercial Invoice'
    },
    es: {
      category: 'Negocios',
      description: 'Factura fiscal y comercial profesional con tabla detallada, cálculo de IVA y firma.',
      tag: 'Documento Comercial'
    },
    fr: {
      category: 'Affaires',
      description: 'Facture commerciale et fiscale professionnelle avec tableau détaillé, calcul de TVA et signature.',
      tag: 'Document Commercial'
    }
  },
  'contract-agreement': {
    en: {
      category: 'Legal',
      description: 'Comprehensive business contract template with preamble, terms, NDA confidentiality, and signature fields.',
      tag: 'Legal Agreement'
    },
    ar: {
      category: 'قانوني',
      description: 'عقد قانوني نموذجي يتضمن تمهيداً، بنود الالتزامات، شروط السرية، وأماكن للتوقيع الرسمي.',
      tag: 'Service Agreement'
    },
    es: {
      category: 'Legal',
      description: 'Contrato comercial integral con preámbulo, términos, cláusula de confidencialidad y firmas.',
      tag: 'Acuerdo Legal'
    },
    fr: {
      category: 'Juridique',
      description: 'Contrat commercial complet avec préambule, clauses, accord de confidentialité et signatures.',
      tag: 'Accord Juridique'
    }
  },
  'executive-resume': {
    en: {
      category: 'Personal',
      description: 'Modern executive resume layout with sidebar for skills, contact info, experience, and education.',
      tag: 'Executive CV'
    },
    ar: {
      category: 'شخصي',
      description: 'قالب سيرة ذاتية عصري مع عمود جانبي للمهارات والاتصال وأقسام الخبرات والتعليم.',
      tag: 'Professional CV'
    },
    es: {
      category: 'Personal',
      description: 'Currículum ejecutivo moderno con barra lateral para habilidades, contacto, experiencia y educación.',
      tag: 'Currículum Ejecutivo'
    },
    fr: {
      category: 'Personnel',
      description: 'Curriculum vitae moderne avec barre latérale pour compétences, contact, expérience et formation.',
      tag: 'CV Exécutif'
    }
  },
  'certificate-honor': {
    en: {
      category: 'Education',
      description: 'Elegant honor & appreciation certificate with royal ornamental border, ideal for achievements.',
      tag: 'Honor Certificate'
    },
    ar: {
      category: 'تعليم',
      description: 'شهادة تكريم فاخرة بإطار ملكي وزخارف، مناسبة للدورات والإنجازات المهنية.',
      tag: 'Honor & Appreciation'
    },
    es: {
      category: 'Educación',
      description: 'Elegante certificado de reconocimiento y honor con marco ornamental, ideal para logros y cursos.',
      tag: 'Certificado de Honor'
    },
    fr: {
      category: 'Éducation',
      description: 'Certificat d’honneur et de reconnaissance élégant avec cadre ornemental, idéal pour les formations.',
      tag: 'Certificat d’Honneur'
    }
  }
};

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  language = 'en'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: t.catAll },
    { id: 'general', label: t.catGeneral },
    { id: 'business', label: t.catBusiness },
    { id: 'legal', label: t.catLegal },
    { id: 'personal', label: t.catPersonal },
    { id: 'education', label: t.catEducation }
  ];

  // Map category to template internal category
  const filtered = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((tmpl) => {
        if (selectedCategory === 'general') return tmpl.category === 'عام';
        if (selectedCategory === 'business') return tmpl.category === 'أعمال';
        if (selectedCategory === 'legal') return tmpl.category === 'قانوني';
        if (selectedCategory === 'personal') return tmpl.category === 'شخصي';
        if (selectedCategory === 'education') return tmpl.category === 'تعليم';
        return true;
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-neutral-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">{t.templatePickerHeader}</h2>
              <p className="text-xs text-neutral-500">{t.templatePickerSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-neutral-200 bg-white overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Templates */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tmpl) => {
            const loc = TEMPLATE_LOCALIZATIONS[tmpl.id]?.[language] || {
              category: tmpl.category,
              description: tmpl.description,
              tag: tmpl.nameEn
            };
            const displayName = language === 'ar' ? tmpl.name : tmpl.nameEn;
            const subtitleName = language === 'ar' ? tmpl.nameEn : loc.tag;

            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="group border border-neutral-200 hover:border-red-500 rounded-xl p-4 bg-white hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Visual miniature mockup preview */}
                  <div className="w-full h-36 rounded-lg bg-neutral-100 border border-neutral-200 mb-3 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <div className="w-20 h-28 bg-white shadow-md border border-neutral-200 rounded-xs p-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="h-2 w-10 bg-red-500 rounded-xs" />
                        <div className="h-1.5 w-14 bg-neutral-300 rounded-xs" />
                        <div className="h-1.5 w-12 bg-neutral-200 rounded-xs" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 w-full bg-neutral-200 rounded-xs" />
                        <div className="h-1 w-4/5 bg-neutral-200 rounded-xs" />
                        <div className="h-1 w-full bg-neutral-200 rounded-xs" />
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-neutral-100">
                        <div className="h-1.5 w-4 bg-neutral-300 rounded-xs" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 text-[10px] font-medium text-neutral-600 bg-white/90 px-2 py-0.5 rounded-md backdrop-blur-xs border border-neutral-200/50 shadow-2xs">
                      {loc.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 group-hover:text-red-600 transition-colors">
                    {displayName}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-sans tracking-wide">
                    {subtitleName}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 text-[11px]">
                    {tmpl.pages.length} {language === 'ar' ? 'صفحة' : 'pages'}
                  </span>
                  <span className="text-red-600 font-semibold group-hover:underline flex items-center gap-1">
                    {t.useTemplate}
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
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
