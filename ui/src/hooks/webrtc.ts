import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export type ChatStatus = "idle" | "searching" | "connected";

export function useWebRTC(socket: Socket | null) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const partnerIdRef = useRef<string | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [partnerNick, setPartnerNick] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Request camera + mic once on mount
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        setLocalStream(stream);
      })
      .catch(() => setMediaError("Camera or microphone access was denied."));

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // All socket-based logic lives in one effect, re-runs only when socket changes
  useEffect(() => {
    if (!socket) return;

    const closeConnection = () => {
      pcRef.current?.close();
      pcRef.current = null;
      partnerIdRef.current = null;
      setRemoteStream(null);
      setPartnerNick(null);
      setStatus("idle");
    };

    const createPC = (partnerId: string): RTCPeerConnection => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      partnerIdRef.current = partnerId;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      const incoming = new MediaStream();
      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => incoming.addTrack(t));
        setRemoteStream(incoming);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice_candidate", { candidate: e.candidate, to: partnerId });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          closeConnection();
        }
      };

      return pc;
    };

    const autoSearch = () => {
      setTimeout(() => {
        socket.emit("find_match");
        setStatus("searching");
      }, 500);
    };

    socket.on("matched", ({ partnerId, shouldInitiate, partnerNick: nick }) => {
      setPartnerNick(nick);
      setStatus("connected");
      partnerIdRef.current = partnerId;

      if (shouldInitiate) {
        const pc = createPC(partnerId);
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit("webrtc_offer", { offer: pc.localDescription, to: partnerId });
          })
          .catch(console.error);
      }
    });

    socket.on("webrtc_offer", async ({ offer, from }) => {
      const pc = createPC(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc_answer", { answer: pc.localDescription, to: from });
    });

    socket.on("webrtc_answer", async ({ answer }) => {
      if (pcRef.current) {
        await pcRef.current
          .setRemoteDescription(new RTCSessionDescription(answer))
          .catch(console.error);
      }
    });

    socket.on("ice_candidate", async ({ candidate }) => {
      if (pcRef.current) {
        await pcRef.current
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch(console.error);
      }
    });

    socket.on("searching", () => setStatus("searching"));

    socket.on("partner_left", () => {
      closeConnection();
      autoSearch();
    });

    socket.on("user_disconnected", ({ disconnectedId }) => {
      if (disconnectedId === partnerIdRef.current) {
        closeConnection();
        autoSearch();
      }
    });

    return () => {
      socket.off("matched");
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("ice_candidate");
      socket.off("searching");
      socket.off("partner_left");
      socket.off("user_disconnected");
    };
  }, [socket]);

  const findMatch = () => {
    if (socket) {
      socket.emit("find_match");
      setStatus("searching");
    }
  };

  const nextPerson = () => {
    if (socket && partnerIdRef.current) {
      socket.emit("next", { partnerId: partnerIdRef.current });
      pcRef.current?.close();
      pcRef.current = null;
      partnerIdRef.current = null;
      setRemoteStream(null);
      setPartnerNick(null);
      setTimeout(() => {
        socket.emit("find_match");
        setStatus("searching");
      }, 300);
    }
  };

  const cancelSearch = () => {
    if (socket) {
      socket.emit("cancel_search");
      setStatus("idle");
    }
  };

  return {
    localStream,
    remoteStream,
    partnerNick,
    status,
    mediaError,
    findMatch,
    nextPerson,
    cancelSearch,
  };
}
