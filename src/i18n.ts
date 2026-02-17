import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/* ─── Translation Resources ────────────────────────── */
const resources = {
  en: {
    translation: {
      app_name: "STRIDE",
      dashboard: "Dashboard",
      projects: "Projects",
      analytics: "Analytics",
      team: "Team",
      profile: "Profile",
      settings: "Settings",
      focus_timer: "Focus Timer",
      stealth_mode: "Stealth Mode",
      sign_in: "Sign In",
      sign_up: "Sign Up",
      log_out: "Log Out",
    },
  },
  ar: {
    translation: {
      app_name: "سترايد",
      dashboard: "لوحة التحكم",
      projects: "المشاريع",
      analytics: "التحليلات",
      team: "الفريق",
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      focus_timer: "مؤقت التركيز",
      stealth_mode: "الوضع الخفي",
      sign_in: "تسجيل الدخول",
      sign_up: "إنشاء حساب",
      log_out: "تسجيل الخروج",
    },
  },
};

/* ─── Init ─────────────────────────────────────────── */
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

/* ─── RTL / LTR direction on language change ───────── */
const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);

function applyDirection(lng: string) {
  const isRtl = RTL_LANGS.has(lng);
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.documentElement.lang = lng;
}

// Apply on init
applyDirection(i18n.language);

// Apply on every language change
i18n.on("languageChanged", applyDirection);

export default i18n;
