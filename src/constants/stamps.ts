import { SupportedLanguage } from './i18n';

export interface StampPreset {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  shape: 'rectangle' | 'oval';
}

const RAW_STAMP_PRESETS = [
  {
    id: 'approved',
    titles: {
      en: 'OFFICIALLY APPROVED',
      ar: 'مُعتمد رسميًا',
      es: 'APROBADO OFICIAL',
      fr: 'OFFICIELLEMENT APPROUVÉ'
    },
    subtitles: {
      en: 'AUTHORIZED SIGNATURE',
      ar: 'APPROVED',
      es: 'FIRMA AUTORIZADA',
      fr: 'SIGNATURE AUTORISÉE'
    },
    color: '#15803d',
    borderColor: '#16a34a',
    shape: 'rectangle' as const
  },
  {
    id: 'paid',
    titles: {
      en: 'PAID IN FULL',
      ar: 'تم السداد بالكامل',
      es: 'PAGADO POR COMPLETO',
      fr: 'PAYÉ INTÉGRALEMENT'
    },
    subtitles: {
      en: 'PAYMENT VERIFIED',
      ar: 'PAID IN FULL',
      es: 'PAGO VERIFICADO',
      fr: 'PAIEMENT VÉRIFIÉ'
    },
    color: '#059669',
    borderColor: '#10b981',
    shape: 'rectangle' as const
  },
  {
    id: 'confidential',
    titles: {
      en: 'STRICTLY CONFIDENTIAL',
      ar: 'سري للغاية',
      es: 'ESTRICTAMENTE CONFIDENCIAL',
      fr: 'STRICTEMENT CONFIDENTIEL'
    },
    subtitles: {
      en: 'DO NOT DISCLOSE',
      ar: 'CONFIDENTIAL',
      es: 'NO DIVULGAR',
      fr: 'NE PAS DIVULGUER'
    },
    color: '#dc2626',
    borderColor: '#ef4444',
    shape: 'rectangle' as const
  },
  {
    id: 'draft',
    titles: {
      en: 'DRAFT COPY',
      ar: 'مُسوَّدة للمراجعة',
      es: 'COPIA DE BORRADOR',
      fr: 'PROJET / BROUILLON'
    },
    subtitles: {
      en: 'FOR REVIEW ONLY',
      ar: 'DRAFT COPY',
      es: 'SOLO PARA REVISIÓN',
      fr: 'POUR RÉVISION SEULEMENT'
    },
    color: '#d97706',
    borderColor: '#f59e0b',
    shape: 'rectangle' as const
  },
  {
    id: 'cancelled',
    titles: {
      en: 'VOID / CANCELLED',
      ar: 'مُلغى وغير صالح',
      es: 'NULO / CANCELADO',
      fr: 'ANNULÉ ET SANS EFFET'
    },
    subtitles: {
      en: 'INVALID DOCUMENT',
      ar: 'VOID / CANCELLED',
      es: 'DOCUMENTO INVÁLIDO',
      fr: 'DOCUMENT INVALIDE'
    },
    color: '#991b1b',
    borderColor: '#b91c1c',
    shape: 'rectangle' as const
  },
  {
    id: 'certified',
    titles: {
      en: 'CERTIFIED TRUE COPY',
      ar: 'نسخة طبق الأصل',
      es: 'COPIA FIEL CERTIFICADA',
      fr: 'COPIE CERTIFIÉE CONFORME'
    },
    subtitles: {
      en: 'VERIFIED & AUTHENTIC',
      ar: 'CERTIFIED TRUE COPY',
      es: 'VERIFICADO Y AUTÉNTICO',
      fr: 'VÉRIFIÉ ET AUTHENTIQUE'
    },
    color: '#1d4ed8',
    borderColor: '#2563eb',
    shape: 'oval' as const
  },
  {
    id: 'urgent',
    titles: {
      en: 'URGENT PRIORITY',
      ar: 'عاجل ومهم',
      es: 'PRIORIDAD URGENTE',
      fr: 'URGENT PRIORITAIRE'
    },
    subtitles: {
      en: 'IMMEDIATE ATTENTION',
      ar: 'URGENT PRIORITY',
      es: 'ATENCIÓN INMEDIATA',
      fr: 'ATTENTION IMMÉDIATE'
    },
    color: '#7c2d12',
    borderColor: '#ea580c',
    shape: 'rectangle' as const
  },
  {
    id: 'under_review',
    titles: {
      en: 'UNDER AUDIT & REVIEW',
      ar: 'قيد التدقيق',
      es: 'EN AUDITORÍA Y REVISIÓN',
      fr: 'EN COURS DE VÉRIFICATION'
    },
    subtitles: {
      en: 'PENDING APPROVAL',
      ar: 'UNDER REVIEW',
      es: 'PENDIENTE DE APROBACIÓN',
      fr: 'EN ATTENTE D’APPROBATION'
    },
    color: '#4338ca',
    borderColor: '#6366f1',
    shape: 'oval' as const
  }
];

export function getLocalizedStamps(lang: SupportedLanguage = 'en'): StampPreset[] {
  return RAW_STAMP_PRESETS.map((s) => ({
    id: s.id,
    title: s.titles[lang] || s.titles.en,
    subtitle: s.subtitles[lang] || s.subtitles.en,
    color: s.color,
    borderColor: s.borderColor,
    shape: s.shape
  }));
}

export const STAMP_PRESETS: StampPreset[] = getLocalizedStamps('en');
