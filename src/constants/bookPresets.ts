import { PDFPage, PDFElement } from '../types/pdf';

export interface BookStructureTemplate {
  id: string;
  name: string;
  category: 'رواية' | 'علمي وأكاديمي' | 'تطوير ذات وأعمال' | 'شعر وأدب' | 'أطفال وقصص';
  description: string;
  badge: string;
  pages: PDFPage[];
}

export const BOOK_PRESETS: BookStructureTemplate[] = [
  {
    id: 'novel_classic',
    name: 'رواية وأدب كلاسيكي (Novel)',
    category: 'رواية',
    description: 'هيكل كتاب كامل: غلاف فني أنيق، صفحة إهداء، مقدمة أدبية، وفصول مرقمة مع ترويسة وتذييل صفحات متناوب.',
    badge: 'الأكثر طلباً',
    pages: [
      // 1. Cover
      {
        id: 'bp-novel-cover',
        pageNumber: 1,
        pageType: 'cover',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#0f172a', // Deep midnight blue
        elements: [
          {
            id: 'b-el-cover-bar',
            type: 'rect',
            x: 60,
            y: 60,
            width: 674,
            height: 1003,
            zIndex: 1,
            fillColor: 'transparent',
            strokeColor: '#d97706',
            strokeWidth: 2,
            borderRadius: 8
          },
          {
            id: 'b-el-genre',
            type: 'text',
            x: 100,
            y: 160,
            width: 594,
            height: 30,
            zIndex: 2,
            text: 'روايـــــة',
            fontSize: 16,
            fontFamily: 'Cairo',
            fontWeight: '600',
            color: '#fbbf24',
            textAlign: 'center',
            lineHeight: 1.5
          },
          {
            id: 'b-el-title',
            type: 'text',
            x: 80,
            y: 340,
            width: 634,
            height: 80,
            zIndex: 2,
            text: 'صَدَى الصَّحْرَاء',
            fontSize: 44,
            fontFamily: 'Amiri',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.4
          },
          {
            id: 'b-el-line-dec',
            type: 'line',
            x: 240,
            y: 450,
            width: 314,
            height: 2,
            zIndex: 2,
            strokeColor: '#d97706',
            strokeWidth: 2
          },
          {
            id: 'b-el-subtitle',
            type: 'text',
            x: 100,
            y: 480,
            width: 594,
            height: 35,
            zIndex: 2,
            text: 'حكاية البدايات والرحيل نحو المجهول',
            fontSize: 18,
            fontFamily: 'Cairo',
            fontWeight: 'normal',
            color: '#cbd5e1',
            textAlign: 'center',
            lineHeight: 1.5
          },
          {
            id: 'b-el-author',
            type: 'text',
            x: 100,
            y: 860,
            width: 594,
            height: 40,
            zIndex: 2,
            text: 'تأليف: د. إبراهيم عبد الله',
            fontSize: 20,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#f8fafc',
            textAlign: 'center'
          },
          {
            id: 'b-el-publisher',
            type: 'text',
            x: 100,
            y: 980,
            width: 594,
            height: 30,
            zIndex: 2,
            text: 'دار النشر والتوزيع الحديث • الطبعة الأولى 2026',
            fontSize: 12,
            fontFamily: 'Cairo',
            fontWeight: 'normal',
            color: '#94a3b8',
            textAlign: 'center'
          }
        ]
      },
      // 2. Dedication
      {
        id: 'bp-novel-dedication',
        pageNumber: 2,
        pageType: 'dedication',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'b-ded-title',
            type: 'text',
            x: 100,
            y: 380,
            width: 594,
            height: 40,
            zIndex: 1,
            text: 'إهـــداء',
            fontSize: 22,
            fontFamily: 'Amiri',
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'center'
          },
          {
            id: 'b-ded-text',
            type: 'text',
            x: 140,
            y: 440,
            width: 514,
            height: 120,
            zIndex: 1,
            text: 'إلى كل من بحث عن صوته وسط الزحام،\nوإلى الذين يكتبون التاريخ بمداد الإصرار والأمل..\n\nأهدي هذا العمل.',
            fontSize: 16,
            fontFamily: 'Amiri',
            fontWeight: 'normal',
            fontStyle: 'italic',
            color: '#475569',
            textAlign: 'center',
            lineHeight: 2.0
          }
        ]
      },
      // 3. Table of Contents
      {
        id: 'bp-novel-toc',
        pageNumber: 3,
        pageType: 'toc',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'b-toc-title',
            type: 'text',
            x: 70,
            y: 80,
            width: 654,
            height: 50,
            zIndex: 1,
            text: 'فهرس المحتويات',
            fontSize: 28,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'right'
          },
          {
            id: 'b-toc-line',
            type: 'line',
            x: 70,
            y: 140,
            width: 654,
            height: 2,
            zIndex: 1,
            strokeColor: '#e2e8f0',
            strokeWidth: 2
          },
          {
            id: 'b-toc-i1',
            type: 'text',
            x: 70,
            y: 180,
            width: 654,
            height: 35,
            zIndex: 2,
            text: 'مقدمة الرواية ............................................................................ صفحة 4',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '500',
            color: '#1e293b',
            textAlign: 'right'
          },
          {
            id: 'b-toc-i2',
            type: 'text',
            x: 70,
            y: 230,
            width: 654,
            height: 35,
            zIndex: 2,
            text: 'الفصل الأول: البدايات الأولى وسحر الرمال ............................ صفحة 5',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '500',
            color: '#1e293b',
            textAlign: 'right'
          },
          {
            id: 'b-toc-i3',
            type: 'text',
            x: 70,
            y: 280,
            width: 654,
            height: 35,
            zIndex: 2,
            text: 'الفصل الثاني: رحلة نحو الشرق ............................................. صفحة 18',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '500',
            color: '#1e293b',
            textAlign: 'right'
          },
          {
            id: 'b-toc-i4',
            type: 'text',
            x: 70,
            y: 330,
            width: 654,
            height: 35,
            zIndex: 2,
            text: 'الفصل الثالث: وميض في الظلام ........................................... صفحة 34',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '500',
            color: '#1e293b',
            textAlign: 'right'
          },
          {
            id: 'b-toc-i5',
            type: 'text',
            x: 70,
            y: 380,
            width: 654,
            height: 35,
            zIndex: 2,
            text: 'خاتمة المطاف ........................................................................... صفحة 50',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '500',
            color: '#1e293b',
            textAlign: 'right'
          }
        ]
      },
      // 4. Chapter 1
      {
        id: 'bp-novel-ch1',
        pageNumber: 4,
        pageType: 'chapter_start',
        chapterTitle: 'الفصل الأول: البدايات الأولى وسحر الرمال',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'b-ch1-num',
            type: 'text',
            x: 70,
            y: 120,
            width: 654,
            height: 30,
            zIndex: 1,
            text: 'الفصل الأول',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#b45309',
            textAlign: 'center'
          },
          {
            id: 'b-ch1-title',
            type: 'text',
            x: 70,
            y: 160,
            width: 654,
            height: 45,
            zIndex: 1,
            text: 'البدايات الأولى وسحر الرمال',
            fontSize: 26,
            fontFamily: 'Amiri',
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'center'
          },
          {
            id: 'b-ch1-decor',
            type: 'line',
            x: 280,
            y: 220,
            width: 234,
            height: 2,
            zIndex: 1,
            strokeColor: '#f59e0b',
            strokeWidth: 2
          },
          {
            id: 'b-ch1-body1',
            type: 'text',
            x: 70,
            y: 260,
            width: 654,
            height: 140,
            zIndex: 2,
            text: 'كانت الشمس تميل نحو المغيب حين وقفت القافلة على مشارف الوادي العتيق. الصمت يلف المكان إلا من حفيف الرياح الدافئة وهي تعانق ذرات الرمال الذهبية. نظر الشيخ إلى الأفق البعيد، وأدرك أن هذه الرحلة لن تكون كأي رحلة سابقة؛ فالأسرار التي خَبأتها هذه الصحراء لقرون حان وقت الكشف عنها.',
            fontSize: 16,
            fontFamily: 'Amiri',
            fontWeight: 'normal',
            color: '#334155',
            textAlign: 'justify',
            lineHeight: 2.1
          },
          {
            id: 'b-ch1-body2',
            type: 'text',
            x: 70,
            y: 420,
            width: 654,
            height: 160,
            zIndex: 2,
            text: 'ترجل الفارس عن فرسه، وتحسس خريطته الجلدية القديمة التي توارثتها أسرته جيلاً بعد جيل. النقوش التي رُسمت عليها بماء الذهب كانت تشير إلى بئر غائرة بين صخرتين عظيمتين. لم يكن الهدف مجرد الوصول إلى نبع ماء، بل العثور على المخطوطة المفقودة التي تحدثت عنها الأساطير طويلاً.',
            fontSize: 16,
            fontFamily: 'Amiri',
            fontWeight: 'normal',
            color: '#334155',
            textAlign: 'justify',
            lineHeight: 2.1
          }
        ]
      }
    ]
  },
  {
    id: 'business_guide',
    name: 'كتاب أعمال ودليل احترافي (Business & Guide)',
    category: 'تطوير ذات وأعمال',
    description: 'تنسيق حديث مناسب لكتب ريادة الأعمال، التدريب، والأدلة الإرشادية مع صناديق ملاحظات وبنود وتلخيصات.',
    badge: 'تصميم عصري',
    pages: [
      // 1. Cover
      {
        id: 'bp-biz-cover',
        pageNumber: 1,
        pageType: 'cover',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'b-biz-side-rect',
            type: 'rect',
            x: 0,
            y: 0,
            width: 24,
            height: 1123,
            zIndex: 1,
            fillColor: '#dc2626',
            strokeColor: 'transparent',
            strokeWidth: 0
          },
          {
            id: 'b-biz-head-badge',
            type: 'rect',
            x: 70,
            y: 90,
            width: 200,
            height: 36,
            zIndex: 1,
            fillColor: '#fef2f2',
            strokeColor: '#fca5a5',
            strokeWidth: 1,
            borderRadius: 6
          },
          {
            id: 'b-biz-badge-txt',
            type: 'text',
            x: 80,
            y: 98,
            width: 180,
            height: 24,
            zIndex: 2,
            text: 'دليل ريادة الأعمال الشامل',
            fontSize: 12,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#dc2626',
            textAlign: 'center'
          },
          {
            id: 'b-biz-title',
            type: 'text',
            x: 70,
            y: 200,
            width: 654,
            height: 110,
            zIndex: 2,
            text: 'استراتيجيات النمو الرقمي وبناء المشاريع الذكية',
            fontSize: 38,
            fontFamily: 'Cairo',
            fontWeight: '800',
            color: '#0f172a',
            textAlign: 'right',
            lineHeight: 1.3
          },
          {
            id: 'b-biz-sub',
            type: 'text',
            x: 70,
            y: 330,
            width: 654,
            height: 60,
            zIndex: 2,
            text: 'خارطة طريق عملية خطوة بخطوة من الفكرة إلى الريادة وتحقيق الاستدامة المالية في العصر الحديث',
            fontSize: 16,
            fontFamily: 'Cairo',
            fontWeight: '500',
            color: '#64748b',
            textAlign: 'right',
            lineHeight: 1.7
          },
          {
            id: 'b-biz-box',
            type: 'rect',
            x: 70,
            y: 500,
            width: 654,
            height: 280,
            zIndex: 1,
            fillColor: '#f8fafc',
            strokeColor: '#e2e8f0',
            strokeWidth: 1,
            borderRadius: 12
          },
          {
            id: 'b-biz-box-item1',
            type: 'text',
            x: 90,
            y: 530,
            width: 614,
            height: 40,
            zIndex: 2,
            text: '✓ نماذج دراسة الجدوى وتحديد الجمهور المستهدف بدقة',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'right'
          },
          {
            id: 'b-biz-box-item2',
            type: 'text',
            x: 90,
            y: 590,
            width: 614,
            height: 40,
            zIndex: 2,
            text: '✓ تقنيات التسويق المبني على البيانات ومضاعفة المبيعات',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'right'
          },
          {
            id: 'b-biz-box-item3',
            type: 'text',
            x: 90,
            y: 650,
            width: 614,
            height: 40,
            zIndex: 2,
            text: '✓ أسرار استقطاب المستثمرين وإدارة جولات التمويل بنجاح',
            fontSize: 15,
            fontFamily: 'Cairo',
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'right'
          },
          {
            id: 'b-biz-author',
            type: 'text',
            x: 70,
            y: 920,
            width: 654,
            height: 40,
            zIndex: 2,
            text: 'إعداد وتقديم: م. سامي التميمي | مستشار استراتيجي',
            fontSize: 16,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'right'
          }
        ]
      }
    ]
  },
  {
    id: 'academic_research',
    name: 'كتاب وأطروحة أكاديمية (Academic & Research)',
    category: 'علمي وأكاديمي',
    description: 'تنسيق أكاديمي رصين ومحكم للمراجع، الهوامش، ملخص البحث، والمصادر العلمية.',
    badge: 'معتمد أكاديمياً',
    pages: [
      {
        id: 'bp-acad-cover',
        pageNumber: 1,
        pageType: 'cover',
        width: 794,
        height: 1123,
        orientation: 'portrait',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'b-acad-univ',
            type: 'text',
            x: 70,
            y: 80,
            width: 654,
            height: 50,
            zIndex: 1,
            text: 'المملكة العربية السعودية • جامعة الملك سعود\nكلية علوم الحاسب والمعلومات • قسم الدراسات العليا',
            fontSize: 14,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#334155',
            textAlign: 'center',
            lineHeight: 1.6
          },
          {
            id: 'b-acad-line',
            type: 'line',
            x: 150,
            y: 150,
            width: 494,
            height: 2,
            zIndex: 1,
            strokeColor: '#cbd5e1',
            strokeWidth: 1
          },
          {
            id: 'b-acad-thesis-t',
            type: 'text',
            x: 70,
            y: 320,
            width: 654,
            height: 100,
            zIndex: 2,
            text: 'تطبيقات الذكاء الاصطناعي التوليدي في إدارة وأرشفة المستندات الرقمية',
            fontSize: 28,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.5
          },
          {
            id: 'b-acad-degree',
            type: 'text',
            x: 70,
            y: 450,
            width: 654,
            height: 40,
            zIndex: 2,
            text: 'رسالة مقدمة لاستكمال متطلبات الحصول على درجة الدكتوراه',
            fontSize: 14,
            fontFamily: 'Cairo',
            fontWeight: '500',
            color: '#64748b',
            textAlign: 'center'
          },
          {
            id: 'b-acad-by',
            type: 'text',
            x: 70,
            y: 650,
            width: 654,
            height: 80,
            zIndex: 2,
            text: 'إعداد الباحث: عبد الرحمن الأحمد\nإشراف: أ.د. منصور الشريف',
            fontSize: 16,
            fontFamily: 'Cairo',
            fontWeight: 'bold',
            color: '#1e293b',
            textAlign: 'center',
            lineHeight: 1.8
          },
          {
            id: 'b-acad-date',
            type: 'text',
            x: 70,
            y: 950,
            width: 654,
            height: 30,
            zIndex: 2,
            text: '1448 هـ - 2026 م',
            fontSize: 14,
            fontFamily: 'Cairo',
            fontWeight: 'normal',
            color: '#64748b',
            textAlign: 'center'
          }
        ]
      }
    ]
  }
];
