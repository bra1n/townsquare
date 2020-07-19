const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");

const server = https.createServer({
  cert: fs.readFileSync("cert.pem"),
  key: fs.readFileSync("key.pem")
});
const wss = new WebSocket.Server({
  ...(process.env.NODE_ENV === "development" ? { port: 8081 } : { server }),
  verifyClient: info =>
    !!info.origin.match(
      /^https?:\/\/(bra1n\.github\.io|localhost|eddbra1nprivatetownsquare\.xyz)/i
    )
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", function connection(ws, req) {
  ws.channel = req.url
    .split("/")
    .pop()
    .toLocaleLowerCase();
  ws.isAlive = true;
  ws.on("pong", heartbeat);
  ws.on("message", function incoming(data) {
    if (!data.match(/^\["ping/i)) {
      console.log(ws.channel, wss.clients.size, data);
    }
    wss.clients.forEach(function each(client) {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        client.channel === ws.channel
      ) {
        client.send(data);
      }
    });
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

wss.on("close", function close() {
  clearInterval(interval);
});

if (process.env.NODE_ENV !== "development") {
  server.listen(8080);
}
