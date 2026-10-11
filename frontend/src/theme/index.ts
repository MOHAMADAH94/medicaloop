import { createTheme, Theme } from '@mui/material/styles';

export interface SpecialtyBranding {
  primary: string;
  primary_dark: string;
  secondary: string;
  accent: string;
  surface: string;
  gradient: string;
  tagline_ar: string;
  hero_ar: string;
}

export const DEFAULT_BRANDING: SpecialtyBranding = {
  primary: '#1565C0',
  primary_dark: '#0D47A1',
  secondary: '#00897B',
  accent: '#BBDEFB',
  surface: '#F5F7FA',
  gradient: 'linear-gradient(135deg, #1565C0 0%, #00897B 100%)',
  tagline_ar: 'منصة رعاية صحية متكاملة',
  hero_ar: 'عيادة احترافية على Medicaloop',
};

/** Client-side fallbacks when API branding is unavailable */
export const SPECIALTY_BRANDING: Record<string, SpecialtyBranding> = {
  obgyn: {
    primary: '#9C27B0',
    primary_dark: '#6A1B9A',
    secondary: '#EC407A',
    accent: '#F8BBD0',
    surface: '#FDF6FB',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #EC407A 100%)',
    tagline_ar: 'رعاية متخصصة لصحة المرأة والحمل',
    hero_ar: 'عيادة نساء وتوليد بإدارة حمل ومتابعة توليدية كاملة',
  },
  pediatrics: {
    primary: '#0288D1',
    primary_dark: '#01579B',
    secondary: '#26A69A',
    accent: '#B3E5FC',
    surface: '#F3FAFD',
    gradient: 'linear-gradient(135deg, #0288D1 0%, #26A69A 100%)',
    tagline_ar: 'نمو وتطعيمات ورعاية الأطفال بثقة',
    hero_ar: 'عيادة أطفال مع مخططات نمو ومتابعة تطعيمات',
  },
  dental: {
    primary: '#00838F',
    primary_dark: '#004D40',
    secondary: '#00ACC1',
    accent: '#B2EBF2',
    surface: '#F0FAFB',
    gradient: 'linear-gradient(135deg, #00838F 0%, #00ACC1 100%)',
    tagline_ar: 'خريطة أسنان وعلاجات وإجراءات دقيقة',
    hero_ar: 'عيادة أسنان مع مخطط أسنان ومتابعة خطط العلاج',
  },
  dermatology: {
    primary: '#6A1B9A',
    primary_dark: '#4A148C',
    secondary: '#AB47BC',
    accent: '#E1BEE7',
    surface: '#FAF5FC',
    gradient: 'linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)',
    tagline_ar: 'تشخيص جلدي ومتابعة الحالات بدقة',
    hero_ar: 'عيادة جلدية مع تتبع المناطق والشدة وخطط العلاج',
  },
  general: DEFAULT_BRANDING,
  cardiology: { primary: '#C62828', primary_dark: '#8E0000', secondary: '#EF5350', accent: '#FFCDD2', surface: '#FFF5F5', gradient: 'linear-gradient(135deg, #C62828 0%, #EF5350 100%)', tagline_ar: 'متابعة القلب والأوعية الدموية بدقة', hero_ar: 'عيادة قلب متخصصة' },
  ophthalmology: { primary: '#1565C0', primary_dark: '#0D47A1', secondary: '#42A5F5', accent: '#BBDEFB', surface: '#F0F7FF', gradient: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)', tagline_ar: 'فحص العيون ووصف النظارات', hero_ar: 'عيادة عيون' },
  orthopedics: { primary: '#5D4037', primary_dark: '#3E2723', secondary: '#8D6E63', accent: '#D7CCC8', surface: '#FAF8F6', gradient: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)', tagline_ar: 'إصابات العظام والمفاصل', hero_ar: 'عيادة عظام' },
  ent: { primary: '#00695C', primary_dark: '#004D40', secondary: '#26A69A', accent: '#B2DFDB', surface: '#F0FAF8', gradient: 'linear-gradient(135deg, #00695C 0%, #26A69A 100%)', tagline_ar: 'أنف وأذن وحنجرة', hero_ar: 'عيادة ENT' },
  psychiatry: { primary: '#4527A0', primary_dark: '#311B92', secondary: '#7E57C2', accent: '#D1C4E9', surface: '#F8F5FC', gradient: 'linear-gradient(135deg, #4527A0 0%, #7E57C2 100%)', tagline_ar: 'صحة نفسية ومتابعة علاجية', hero_ar: 'عيادة نفسية' },
  gastroenterology: { primary: '#EF6C00', primary_dark: '#E65100', secondary: '#FFB74D', accent: '#FFE0B2', surface: '#FFF8F0', gradient: 'linear-gradient(135deg, #EF6C00 0%, #FFB74D 100%)', tagline_ar: 'جهاز هضمي متخصص', hero_ar: 'عيادة جهاز هضمي' },
  neurology: { primary: '#283593', primary_dark: '#1A237E', secondary: '#5C6BC0', accent: '#C5CAE9', surface: '#F3F4FB', gradient: 'linear-gradient(135deg, #283593 0%, #5C6BC0 100%)', tagline_ar: 'أعصاب — صداع وصرع', hero_ar: 'عيادة أعصاب' },
  pulmonology: { primary: '#0277BD', primary_dark: '#01579B', secondary: '#4FC3F7', accent: '#B3E5FC', surface: '#F0FAFF', gradient: 'linear-gradient(135deg, #0277BD 0%, #4FC3F7 100%)', tagline_ar: 'صدرية — ربو و COPD', hero_ar: 'عيادة صدرية' },
  urology: { primary: '#006064', primary_dark: '#004D40', secondary: '#00838F', accent: '#B2EBF2', surface: '#F0FAFB', gradient: 'linear-gradient(135deg, #006064 0%, #00838F 100%)', tagline_ar: 'مسالك بولية', hero_ar: 'عيادة مسالك' },
  endocrinology: { primary: '#AD1457', primary_dark: '#880E4F', secondary: '#EC407A', accent: '#F8BBD0', surface: '#FDF5F8', gradient: 'linear-gradient(135deg, #AD1457 0%, #EC407A 100%)', tagline_ar: 'غدد صماء — سكري و thyroid', hero_ar: 'عيادة غدد' },
  nutrition: { primary: '#558B2F', primary_dark: '#33691E', secondary: '#8BC34A', accent: '#DCEDC8', surface: '#F7FBF3', gradient: 'linear-gradient(135deg, #558B2F 0%, #8BC34A 100%)', tagline_ar: 'تغذية علاجية', hero_ar: 'عيادة تغذية' },
  physiotherapy: { primary: '#00897B', primary_dark: '#00695C', secondary: '#4DB6AC', accent: '#B2DFDB', surface: '#F0FAF9', gradient: 'linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)', tagline_ar: 'علاج طبيعي وتأهيل', hero_ar: 'عيادة علاج طبيعي' },
};

export function resolveBranding(
  code?: string | null,
  apiBranding?: Partial<SpecialtyBranding> | null,
): SpecialtyBranding {
  const base = (code && SPECIALTY_BRANDING[code]) || DEFAULT_BRANDING;
  if (!apiBranding) return base;
  return { ...base, ...apiBranding };
}

const THEME_HEX = /^#[0-9A-Fa-f]{6}$/;

function mixHex(color: string, other: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(color);
  const [br, bg, bb] = parse(other);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(ar + (br - ar) * t)}${toHex(ag + (bg - ag) * t)}${toHex(ab + (bb - ab) * t)}`;
}

/** Overlay a clinic-chosen primary color on specialty branding (matches backend mix). */
export function applyClinicThemeColor(
  branding: SpecialtyBranding,
  color: string,
): SpecialtyBranding {
  const primary = color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`;
  if (!THEME_HEX.test(primary)) return branding;
  const secondary = mixHex(primary, '#FFFFFF', 0.22);
  return {
    ...branding,
    primary,
    primary_dark: mixHex(primary, '#000000', 0.28),
    secondary,
    accent: mixHex(primary, '#FFFFFF', 0.72),
    surface: mixHex(primary, '#FFFFFF', 0.94),
    gradient: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
  };
}

export const THEME_COLOR_PRESETS = [
  '#1565C0',
  '#00838F',
  '#2E7D32',
  '#6A1B9A',
  '#AD1457',
  '#C62828',
  '#EF6C00',
  '#5D4037',
  '#37474F',
  '#283593',
] as const;

export function createAppTheme(branding: SpecialtyBranding = DEFAULT_BRANDING): Theme {
  return createTheme({
    direction: 'rtl',
    palette: {
      mode: 'light',
      primary: {
        main: branding.primary,
        dark: branding.primary_dark,
        light: branding.accent,
      },
      secondary: {
        main: branding.secondary,
      },
      background: {
        default: branding.surface,
        paper: '#FFFFFF',
      },
    },
    typography: {
      fontFamily: '"Tajawal", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: branding.gradient,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  });
}

/** @deprecated use createAppTheme */
export const theme = createAppTheme();
