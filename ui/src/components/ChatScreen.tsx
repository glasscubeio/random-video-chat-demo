import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, LogOut, Wifi, VideoOff, Users } from "lucide-react";
import type { Socket } from "socket.io-client";
import { useWebRTC } from "../hooks/webrtc";
import { useLang, LangSwitcher } from "../lib/LanguageContext";

interface Props {
  socket: Socket | null;
  nick: string;
  onLeave: () => void;
}

export default function ChatScreen({ socket, nick, onLeave }: Props) {
  const { t } = useLang();
  const { localStream, remoteStream, partnerNick, status, mediaError, findMatch, nextPerson, cancelSearch } =
    useWebRTC(socket);

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localRef.current && localStream) localRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return (
    <div className="h-full flex flex-col" style={{ background: "#05050a" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ background: "rgba(14,14,26,0.92)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-white" style={{ fontSize: 15 }}>{t("chatBrand")}</span>
          <span style={{ color: "#2e2e3a" }}>·</span>
          <span style={{ color: "#5b5b72", fontSize: 13 }}>{nick}</span>
        </div>

        <div className="flex items-center gap-4">
          <LangSwitcher />
          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 font-medium transition-colors duration-150"
            style={{ color: "#5b5b72", fontSize: 13 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={e => (e.currentTarget.style.color = "#5b5b72")}
          >
            <LogOut size={13} /> {t("leaveBtn")}
          </button>
        </div>
      </header>

      {/* ── Video area ──────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-black min-h-0">
        <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />

        {/* Status overlays */}
        <AnimatePresence>
          {(!remoteStream || status !== "connected") && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-5"
              style={{ background: "#08080f" }}
            >
              {/* Camera denied */}
              {mediaError && (
                <div className="flex flex-col items-center gap-3 text-center px-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <VideoOff size={28} style={{ color: "#f87171" }} />
                  </div>
                  <p className="font-semibold text-white" style={{ fontSize: 16 }}>{t("cameraDeniedTitle")}</p>
                  <p style={{ color: "#6b6b80", fontSize: 14 }}>{mediaError}</p>
                </div>
              )}

              {/* Idle */}
              {!mediaError && status === "idle" && (
                <motion.div
                  className="flex flex-col items-center gap-5 text-center px-8"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <Users size={32} style={{ color: "#4b4b5e" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white" style={{ fontSize: 16 }}>{t("readyTitle")}</p>
                    <p className="mt-1" style={{ color: "#4b4b5e", fontSize: 14 }}>{t("readySubtitle")}</p>
                  </div>
                </motion.div>
              )}

              {/* Searching */}
              {!mediaError && status === "searching" && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.3)" }}
                  >
                    <Wifi size={32} style={{ color: "#8b5cf6" }} />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-white" style={{ fontSize: 16 }}>{t("searchingTitle")}</p>
                    <p className="mt-1" style={{ color: "#4b4b5e", fontSize: 14 }}>{t("searchingSubtitle")}</p>
                  </div>
                </div>
              )}

              {/* Connecting (matched, awaiting stream) */}
              {!mediaError && status === "connected" && !remoteStream && (
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 rounded-full"
                    style={{ border: "2px solid rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6" }}
                  />
                  <p style={{ color: "#6b6b80", fontSize: 15 }}>
                    {t("connectingText")} {partnerNick ?? ""}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Partner badge */}
        <AnimatePresence>
          {remoteStream && partnerNick && (
            <motion.div
              key="badge"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="absolute top-4 left-4 rounded-lg px-3 py-1.5"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="font-medium text-white" style={{ fontSize: 14 }}>{partnerNick}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local PiP */}
        <motion.div
          className="absolute bottom-4 right-4 overflow-hidden rounded-xl"
          style={{ width: "clamp(120px,18vw,200px)", aspectRatio: "4/3", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", background: "#0c0c18" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </motion.div>
      </div>

      {/* ── Controls ────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-3 py-4 px-5 shrink-0"
        style={{ background: "rgba(14,14,26,0.92)", borderTop: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
      >
        {status === "idle" && !mediaError && (
          <button
            onClick={findMatch}
            className="flex items-center gap-2 px-6 rounded-xl font-semibold text-white transition-all duration-200"
            style={{ padding: "10px 24px", background: "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)", boxShadow: "0 4px 20px rgba(109,40,217,0.3)", fontSize: 15 }}
            onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)")}
            onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)")}
          >
            <Users size={15} /> {t("findSomeoneBtn")}
          </button>
        )}

        {status === "searching" && (
          <button
            onClick={cancelSearch}
            className="flex items-center gap-2 rounded-xl font-medium transition-all duration-150"
            style={{ padding: "10px 24px", background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.08)", color: "#6b6b80", fontSize: 15 }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#6b6b80"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            {t("cancelBtn")}
          </button>
        )}

        {status === "connected" && (
          <button
            onClick={nextPerson}
            className="flex items-center gap-2 rounded-xl font-semibold text-white transition-all duration-200"
            style={{ padding: "10px 24px", background: "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)", boxShadow: "0 4px 20px rgba(109,40,217,0.3)", fontSize: 15 }}
            onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)")}
            onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)")}
          >
            <SkipForward size={15} /> {t("nextBtn")}
          </button>
        )}
      </div>
    </div>
  );
}
