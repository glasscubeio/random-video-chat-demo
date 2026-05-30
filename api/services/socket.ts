import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { addUser, getUser, removeUser } from "../utils/cache";

let io: Server | null = null;

let waitingQueue: string[] = [];

// socketId → partnerSocketId (both directions)
const partners = new Map<string, string>();
// socketId → nick (for disconnect cleanup without requiring cache lookup)
const socketToNick = new Map<string, string>();

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    const { nick, did } = socket.handshake.auth as { nick?: string; did?: string };

    if (!nick || !did) {
      socket.emit("error", "Missing nick or did");
      socket.disconnect();
      return;
    }

    const existing = getUser(nick);
    if (existing && existing.did !== did) {
      socket.emit("nick_taken");
      socket.disconnect();
      return;
    }

    addUser(nick, did, socket.id);
    socketToNick.set(socket.id, nick);
    socket.emit("welcome", { nick, did });
    console.log(`[+] ${nick} connected (${socket.id})`);

    // Chat message — only to current partner
    socket.on("message", (msg: string) => {
      const partnerId = partners.get(socket.id);
      if (partnerId) {
        io?.to(partnerId).emit("message", { from: nick, text: msg });
      }
    });

    socket.on("ping", () => socket.emit("pong"));

    // Matchmaking
    socket.on("find_match", () => {
      if (waitingQueue.includes(socket.id)) return;

      if (waitingQueue.length > 0) {
        const partnerId = waitingQueue.shift()!;
        const partnerNick = socketToNick.get(partnerId) ?? "Stranger";

        partners.set(socket.id, partnerId);
        partners.set(partnerId, socket.id);

        socket.emit("matched", { partnerId, shouldInitiate: true, partnerNick });
        io?.to(partnerId).emit("matched", { partnerId: socket.id, shouldInitiate: false, partnerNick: nick });
        console.log(`[match] ${nick} ↔ ${partnerNick}`);
      } else {
        waitingQueue.push(socket.id);
        socket.emit("searching");
        console.log(`[queue] ${nick} waiting`);
      }
    });

    socket.on("cancel_search", () => {
      waitingQueue = waitingQueue.filter((id) => id !== socket.id);
    });

    // WebRTC signaling — forward to target socket only
    socket.on("webrtc_offer", ({ offer, to }: { offer: RTCSessionDescriptionInit; to: string }) => {
      io?.to(to).emit("webrtc_offer", { offer, from: socket.id });
    });

    socket.on("webrtc_answer", ({ answer, to }: { answer: RTCSessionDescriptionInit; to: string }) => {
      io?.to(to).emit("webrtc_answer", { answer, from: socket.id });
    });

    socket.on("ice_candidate", ({ candidate, to }: { candidate: RTCIceCandidateInit; to: string }) => {
      io?.to(to).emit("ice_candidate", { candidate, from: socket.id });
    });

    // Skip to next person
    socket.on("next", ({ partnerId }: { partnerId: string }) => {
      if (partnerId) {
        io?.to(partnerId).emit("partner_left");
        partners.delete(partnerId);
      }
      partners.delete(socket.id);
      waitingQueue = waitingQueue.filter((id) => id !== socket.id);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      const partnerId = partners.get(socket.id);
      if (partnerId) {
        io?.to(partnerId).emit("partner_left");
        partners.delete(partnerId);
      }
      partners.delete(socket.id);
      socketToNick.delete(socket.id);
      waitingQueue = waitingQueue.filter((id) => id !== socket.id);
      removeUser(nick);
      console.log(`[-] ${nick} disconnected`);
    });
  });

  return io;
}
