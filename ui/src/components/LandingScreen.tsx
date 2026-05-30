import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, HelpCircle, Share2 } from "lucide-react";
import HowItWorksModal from "./HowItWorksModal";
import { useLang, LangSwitcher } from "../lib/LanguageContext";

interface Props {
  onJoin: (nick: string, did: string) => void;
  nickTakenError?: boolean;
}

export default function LandingScreen({ onJoin, nickTakenError }: Props) {
  const { t } = useLang();
  const [nick, setNick] = useState("");
  const [error, setError] = useState(nickTakenError ? t("errorNickTaken") : "");
  const [showModal, setShowModal] = useState(false);
  const [shared, setShared] = useState(false);

  function handleJoin() {
    const n = nick.trim();
    if (!n) { setError(t("errorEmpty")); return; }
    if (n.length < 2) { setError(t("errorShort")); return; }
    if (n.length > 20) { setError(t("errorLong")); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(n)) { setError(t("errorChars")); return; }
    const did = localStorage.getItem("did") ?? crypto.randomUUID();
    localStorage.setItem("nick", n);
    localStorage.setItem("did", did);
    onJoin(n, did);
  }

  async function handleShare() {
    const url = "https://stranger.glasscube.uz";
    try {
      if (navigator.share) {
        await navigator.share({ title: t("title"), url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2200);
      }
    } catch {
      // user cancelled
    }
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center relative overflow-hidden p-6"
      style={{ background: "#05050a" }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 640, height: 640, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(109,40,217,0.09) 0%,transparent 70%)" }} />
        <div className="absolute rounded-full" style={{ width: 420, height: 420, top: "-12%", left: "-6%", background: "radial-gradient(circle,rgba(109,40,217,0.05) 0%,transparent 70%)" }} />
        <div className="absolute rounded-full" style={{ width: 380, height: 380, bottom: "-12%", right: "-6%", background: "radial-gradient(circle,rgba(139,92,246,0.04) 0%,transparent 70%)" }} />
      </div>

      {/* ── Top nav ──────────────────────────────────────────── */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
        {/* Brand */}
        <a
          href="https://glasscube.uz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-semibold transition-colors duration-150"
          style={{ color: "#9b9bb5", fontSize: 14 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#e2e2f0")}
          onMouseLeave={e => (e.currentTarget.style.color = "#9b9bb5")}
        >
          glasscube.uz <ExternalLink size={12} />
        </a>

        {/* Right: lang switcher + divider + actions */}
        <div className="flex items-center gap-3">
          <LangSwitcher />

          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

          {/* Share */}
          <div className="relative">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 font-medium transition-colors duration-150"
              style={{ color: "#9b9bb5", fontSize: 14 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e2e2f0")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9b9bb5")}
            >
              <Share2 size={13} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={shared ? "copied" : "share"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {shared ? t("copied") : t("shareNav")}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {/* GitHub */}
          <a
            href="https://github.com/glasscubeio/random-video-chat-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium transition-colors duration-150"
            style={{ color: "#9b9bb5", fontSize: 14 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e2e2f0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9b9bb5")}
          >
            <ExternalLink size={12} /> GitHub
          </a>

          {/* How it works */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 font-medium transition-colors duration-150"
            style={{ color: "#9b9bb5", fontSize: 14 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e2e2f0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9b9bb5")}
          >
            <HelpCircle size={13} /> {t("howItWorksNav")}
          </button>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Heading */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h1 className="font-bold tracking-tight text-white" style={{ fontSize: "clamp(2.4rem,6vw,3.2rem)", lineHeight: 1.15 }}>
            {t("title").split(",")[0]},
            <br />
            <span style={{ backgroundImage: "linear-gradient(135deg,#a78bfa 0%,#7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("title").split(",")[1]?.trim() ?? ""}
            </span>
          </h1>
          <motion.p
            className="mt-3 leading-relaxed"
            style={{ color: "#6b6b80", fontSize: 15 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {t("subtitleLine1")}
            <br />
            {t("subtitleLine2")}
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="w-full rounded-2xl p-5 space-y-3"
          style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <label className="font-semibold uppercase tracking-widest" style={{ color: "#4b4b5e", fontSize: 11 }}>
              {t("nicknameLabel")}
            </label>
            <input
              className="w-full mt-2 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-150"
              style={{ background: "#08080f", border: "1px solid rgba(255,255,255,0.07)", fontSize: 15 }}
              placeholder={t("nicknamePlaceholder")}
              value={nick}
              maxLength={20}
              autoFocus
              onChange={e => { setNick(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-1.5"
                  style={{ color: "#f87171", fontSize: 13 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleJoin}
            className="w-full rounded-xl font-semibold text-white transition-all duration-200"
            style={{ padding: "11px 0", background: "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)", boxShadow: "0 4px 24px rgba(109,40,217,0.25)", fontSize: 15 }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(109,40,217,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(109,40,217,0.25)"; }}
          >
            {t("startBtn")}
          </button>
        </motion.div>

        <motion.p
          className="text-center"
          style={{ color: "#2e2e3a", fontSize: 13 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t("cameraNote")}
        </motion.p>
      </div>

      <AnimatePresence>
        {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
