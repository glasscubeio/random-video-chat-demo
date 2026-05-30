# ui — React Frontend

Vite + React frontend for Hello, Stranger.

Single-page app — no router. Three states: landing screen, searching, and active video chat.

## Quick start

```bash
bun install
cp .env.example .env    # configure API URL
bun dev                 # dev server on :5173
bun build               # production build → dist/
```

## Environment variables

| Variable       | Default                    | Description                |
| -------------- | -------------------------- | -------------------------- |
| `VITE_API_URL` | `https://wsv.glasscube.uz` | Socket.IO signaling server |

## Structure

```
src/
├── components/
│   ├── LandingScreen.tsx     Nickname input + how-it-works trigger
│   ├── ChatScreen.tsx        Video chat layout (partner video + local PiP + controls)
│   └── HowItWorksModal.tsx   Animated step-by-step explanation modal
├── hooks/
│   ├── socket.ts             Socket.IO connection lifecycle
│   └── webrtc.ts             RTCPeerConnection + all WebRTC signaling handlers
├── lib/
│   └── utils.ts              cn() utility (clsx + tailwind-merge)
├── styles/
│   └── index.css             Tailwind v4 base + global resets
├── App.tsx                   Root — user state, screen switching
└── main.tsx                  React root mount
```

## Flow

1. `App` reads `localStorage` for a stored nickname — if found, goes straight to `ChatScreen`
2. `LandingScreen` validates format (`[a-zA-Z0-9_-]`, 2–20 chars) and stores nick + device ID
3. `useSocket` opens a Socket.IO connection with `{ nick, did }` auth when user is set
4. If the server returns `nick_taken`, user is sent back to landing with an error message
5. `ChatScreen` mounts → camera/mic requested once via `useWebRTC`
6. User clicks **Find Someone** → `find_match` → server adds to queue
7. On `matched`, the initiator creates an RTCPeerConnection and sends SDP offer
8. The receiver creates RTCPeerConnection on `webrtc_offer`, replies with answer
9. ICE candidates are exchanged; video streams once `pc.ontrack` fires
10. **Next** emits `next`, partner gets `partner_left`, both auto-search for a new match

## Tech

- React 19 · Vite 7 · TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- Framer Motion — screen transitions, modal, status overlay animations
- Lucide React — icons
- Socket.IO Client 4
