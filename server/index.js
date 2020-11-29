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
      /^https?:\/\/([^.]+\.github\.io|localhost|live\.clocktower\.online|eddbra1nprivatetownsquare\.xyz)/i
    )
});

function noop() {}

// calculate latency on heartbeat
function heartbeat() {
  this.latency = Math.round((new Date().getTime() - this.pingStart) / 2);
  this.isAlive = true;
}

// map of channels currently in use
const channels = {};

// a new client connects
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
      channels[ws.channel] &&
      channels[ws.channel].some(
        client =>
          client !== ws && client.readyState === WebSocket.OPEN && client.isHost
      )
    ) {
      console.log(ws.channel, "duplicate host");
      ws.close(1000, `The channel "${ws.channel}" already has a host`);
      return;
    }
  }
  ws.isAlive = true;
  ws.pingStart = new Date().getTime();
  // add channel to list
  if (!channels[ws.channel]) {
    channels[ws.channel] = [];
  }
  channels[ws.channel].push(ws);
  // start ping pong
  ws.ping(noop);
  ws.on("pong", heartbeat);
  // remove client from channels on close
  ws.on("close", () => {
    const index = channels[ws.channel].indexOf(ws);
    if (index >= 0) {
      channels[ws.channel].splice(index, 1);
    }
    if (!channels[ws.channel].length) delete channels[ws.channel];
  });
  // handle message
  ws.on("message", function incoming(data) {
    const isPing = data.match(/^\["ping/i);
    if (!isPing) {
      console.log(new Date(), wss.clients.size, ws.channel, data);
    }
    channels[ws.channel].forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
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

// start ping interval timer
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.pingStart = new Date().getTime();
    ws.ping(noop);
  });
}, 30000); // 30 second pings

// handle server shutdown
wss.on("close", function close() {
  clearInterval(interval);
});

// prod mode with stats API
if (process.env.NODE_ENV !== "development") {
  console.log("server starting");
  server.listen(8080);
  server.on("request", (req, res) => {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        players: wss.clients.size,
        channels: Object.keys(channels).length
      })
    );
  });
}
