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
            const displayName = language === 'ar' ? tmpl.name : tmpl.nameEn;
            const subtitleName = language === 'ar' ? tmpl.nameEn : tmpl.name;

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
                    <span className="absolute bottom-2 right-2 text-[10px] font-medium text-neutral-500 bg-white/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {tmpl.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 group-hover:text-red-600 transition-colors">
                    {displayName}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-sans tracking-wide">
                    {subtitleName}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {tmpl.description}
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
