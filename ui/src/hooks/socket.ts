import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8888";

interface User {
  nick: string;
  did: string;
}

export function useSocket(user: User | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nickTaken, setNickTaken] = useState(false);

  useEffect(() => {
    if (!user) return;

    const s = io(SOCKET_URL, {
      auth: { nick: user.nick, did: user.did },
    });

    s.on("connect", () => console.log("[socket] connected:", s.id));
    s.on("nick_taken", () => setNickTaken(true));
    s.on("disconnect", () => console.log("[socket] disconnected"));

    setSocket(s);

    return () => {
      s.disconnect();
      setNickTaken(false);
    };
  }, [user]);

  return { socket, nickTaken };
}
