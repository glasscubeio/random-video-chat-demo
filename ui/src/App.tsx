import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSocket } from "./hooks/socket";
import LandingScreen from "./components/LandingScreen";
import ChatScreen from "./components/ChatScreen";

interface User {
  nick: string;
  did: string;
}

function readStoredUser(): User | null {
  const nick = localStorage.getItem("nick");
  const did = localStorage.getItem("did");
  return nick && did ? { nick, did } : null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [nickTakenError, setNickTakenError] = useState(false);

  const { socket, nickTaken } = useSocket(user);

  // If the server rejects the nickname, boot back to landing with error
  useEffect(() => {
    if (nickTaken) {
      localStorage.removeItem("nick");
      localStorage.removeItem("did");
      setUser(null);
      setNickTakenError(true);
    }
  }, [nickTaken]);

  const handleJoin = (nick: string, did: string) => {
    setNickTakenError(false);
    setUser({ nick, did });
  };

  const handleLeave = () => {
    socket?.disconnect();
    localStorage.removeItem("nick");
    localStorage.removeItem("did");
    setUser(null);
    setNickTakenError(false);
  };

  return (
    <div style={{ height: "100%" }}>
      <AnimatePresence mode="wait">
        {user ? (
          <motion.div
            key="chat"
            style={{ height: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChatScreen socket={socket} nick={user.nick} onLeave={handleLeave} />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            style={{ height: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LandingScreen onJoin={handleJoin} nickTakenError={nickTakenError} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
