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
  this.latency = Math.round((new Date().getTime() - this.pingStart) / 2);
  this.isAlive = true;
}

wss.on("connection", function connection(ws, req) {
  ws.channel = req.url
    .split("/")
    .pop()
    .toLocaleLowerCase();
  if (ws.channel.match(/-host$/i)) {
    ws.isHost = true;
    ws.channel = ws.channel.substr(0, ws.channel.length - 5);
    // check for another host on this channel
    if (
      Array.from(wss.clients).some(
        client =>
          client !== ws &&
          client.readyState === WebSocket.OPEN &&
          client.channel === ws.channel &&
          client.isHost
      )
    ) {
      console.log(ws.channel, "duplicate host");
      ws.close(1000, `The channel "${ws.channel}" already has a host`);
      return;
    }
  }
  ws.isAlive = true;
  ws.pingStart = new Date().getTime();
  ws.ping(noop);
  ws.on("pong", heartbeat);
  ws.on("message", function incoming(data) {
    const isPing = data.match(/^\["ping/i);
    if (!isPing) {
      console.log(new Date(), wss.clients.size, ws.channel, data);
    }
    wss.clients.forEach(function each(client) {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        client.channel === ws.channel
      ) {
        // inject latency between both clients if ping message
        if (isPing && client.latency && ws.latency) {
          client.send(data.replace(/latency/, client.latency + ws.latency));
        } else {
          client.send(data);
        }
      }
    });
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.pingStart = new Date().getTime();
    ws.ping(noop);
  });
}, 30000);

wss.on("close", function close() {
  clearInterval(interval);
});

if (process.env.NODE_ENV !== "development") {
  server.listen(8080);
}
