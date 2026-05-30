import { createServer } from "http";
import { initSocket } from "./services/socket";

const PORT = process.env.PORT ?? 8888;

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain" }).end("OK");
});

initSocket(server);

server.listen(PORT, () => console.log(`[server] running on :${PORT}`));
