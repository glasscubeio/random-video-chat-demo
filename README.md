# Hello, Stranger.

> Anonymous random video chat — a portfolio demonstrator by [glasscube.uz](https://glasscube.uz)

Live at **[stranger.glasscube.uz](https://stranger.glasscube.uz)**  
Source: [github.com/glasscubeio/random-video-chat-demo](https://github.com/glasscubeio/random-video-chat-demo)

---

## What it does

Users visit the site, pick a nickname, and are matched with a random stranger for a live video call. Everything is anonymous and ephemeral — no accounts, no history, no database. When you leave, your name is freed and your session is gone.

## How it works

```
User A visits                         User B visits
     │                                      │
     ▼                                      ▼
 Pick nickname                         Pick nickname
     │                                      │
     └──────► Socket.IO signaling ◄─────────┘
                     │
              Matchmaking queue
                     │
         Both users get "matched"
                     │
        WebRTC offer/answer exchange
                     │
        ┌────────────────────────────┐
        │  Direct peer-to-peer video │
        └────────────────────────────┘
```

- **Signaling** is handled by the backend via Socket.IO
- **Video** streams directly browser-to-browser over WebRTC (no server relay)
- **Nicknames** are held in server memory for the duration of the session
- Disconnect → name is freed, session ends

## Project structure

```
hellostranger/
├── api/          Bun + Socket.IO signaling server
│   ├── main.ts
│   ├── services/socket.ts
│   └── utils/cache.ts
├── ui/           React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── LandingScreen.tsx
│       │   ├── ChatScreen.tsx
│       │   └── HowItWorksModal.tsx
│       └── hooks/
│           ├── socket.ts
│           └── webrtc.ts
└── README.md
```

## Running locally

**Backend** (runs on port 8888):
```bash
cd api
bun install
bun dev
```

**Frontend** (runs on port 5173):
```bash
cd ui
bun install
cp .env.example .env   # set VITE_API_URL=http://localhost:8888
bun dev
```

## Deployment

| Service  | URL                       |
| -------- | ------------------------- |
| Frontend | stranger.glasscube.uz     |
| Backend  | wsv.glasscube.uz          |

The frontend is a static Vite build. The backend is a single Bun process.

## Tech stack

| Layer       | Tech                         |
| ----------- | ---------------------------- |
| Runtime     | Bun                          |
| Backend     | Socket.IO 4                  |
| Frontend    | React 19 + Vite 7            |
| Styling     | Tailwind CSS v4              |
| Animations  | Framer Motion                |
| Icons       | Lucide React                 |
| P2P video   | WebRTC (browser native)      |
| Signaling   | Socket.IO over WebSocket     |
| State       | In-memory (Map)              |

## Known limitations

- No TURN server — connections may fail on restrictive NATs/firewalls
- Single-server only — no horizontal scaling
- In-memory state — restart clears all users
- No moderation, no abuse protection

For a production deployment you'd add STUN/TURN infrastructure, persistent sessions, and auth. This project intentionally keeps none of that.

## License

MIT
