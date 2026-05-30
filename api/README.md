# api — Socket.IO Signaling Server

Bun + Socket.IO backend for Hello, Stranger.

Handles user registration, matchmaking queue, and WebRTC signaling between peers. All state lives in memory — no database.

## Quick start

```bash
bun install
bun dev          # watch mode
bun start        # production
```

Listens on `PORT` env variable (default `8888`).

## Environment variables

| Variable | Default | Description        |
| -------- | ------- | ------------------ |
| `PORT`   | `8888`  | Port to listen on  |

## Socket.IO events

### Client → Server

| Event           | Payload             | Description                   |
| --------------- | ------------------- | ----------------------------- |
| `find_match`    | —                   | Join matchmaking queue        |
| `cancel_search` | —                   | Leave matchmaking queue       |
| `next`          | `{ partnerId }`     | Skip current partner          |
| `message`       | `string`            | Send text to current partner  |
| `webrtc_offer`  | `{ offer, to }`     | Forward SDP offer to peer     |
| `webrtc_answer` | `{ answer, to }`    | Forward SDP answer to peer    |
| `ice_candidate` | `{ candidate, to }` | Forward ICE candidate to peer |

### Server → Client

| Event           | Payload                                      | Description                     |
| --------------- | -------------------------------------------- | ------------------------------- |
| `welcome`       | `{ nick, did }`                              | Confirmed on connect            |
| `nick_taken`    | —                                            | Nickname already in use         |
| `searching`     | —                                            | Added to queue                  |
| `matched`       | `{ partnerId, shouldInitiate, partnerNick }` | Paired with a user              |
| `partner_left`  | —                                            | Partner disconnected or skipped |
| `message`       | `{ from, text }`                             | Incoming text from partner      |
| `webrtc_offer`  | `{ offer, from }`                            | Incoming SDP offer              |
| `webrtc_answer` | `{ answer, from }`                           | Incoming SDP answer             |
| `ice_candidate` | `{ candidate, from }`                        | Incoming ICE candidate          |

## Auth

Each socket connection must include `nick` and `did` in the handshake auth:

```ts
io("https://wsv.glasscube.uz", {
  auth: { nick: "alice", did: "some-uuid-v4" },
})
```

The `did` (device ID) allows a user to reconnect with the same nickname after a page refresh. It is generated once and stored in `localStorage`.

## Architecture notes

- `main.ts` — HTTP server + Socket.IO init
- `services/socket.ts` — event handling, matchmaking queue, partner tracking
- `utils/cache.ts` — in-memory user map (`nick → { nick, did, socketId }`)

Two Maps drive the logic:
- `socketToNick` — quick nick lookup without scanning the user cache
- `partners` — bidirectional `socketId ↔ socketId` pairing for targeted forwarding
