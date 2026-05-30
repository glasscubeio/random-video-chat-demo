import { createContext, useContext, useState, type ReactNode } from "react";
import { t as translate, LANG_CODES, type Lang, type Strings } from "./i18n";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof Strings) => string;
}

const LangContext = createContext<LangCtx>({
  lang: "ko",
  setLang: () => {},
  t: (key) => translate("ko", key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko");
  const tFn = (key: keyof Strings) => translate(lang, key);
  return (
    <LangContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LangContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  return useContext(LangContext);
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const langs: Lang[] = ["ko", "en", "ru", "uz"];

  return (
    <div className="flex items-center gap-0.5">
      {langs.map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className="px-2 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-150"
          style={{
            color: lang === code ? "#a78bfa" : "#6b6b82",
            background: lang === code ? "rgba(139,92,246,0.12)" : "transparent",
            letterSpacing: "0.04em",
          }}
          onMouseEnter={(e) => {
            if (lang !== code) e.currentTarget.style.color = "#a0a0b8";
          }}
          onMouseLeave={(e) => {
            if (lang !== code) e.currentTarget.style.color = "#6b6b82";
          }}
        >
          {LANG_CODES[code]}
        </button>
      ))}
    </div>
  );
}
