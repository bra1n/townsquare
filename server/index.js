const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");

const PING_INTERVAL = 30000; // 30 seconds

const server = https.createServer({
  cert: fs.readFileSync("cert.pem"),
  key: fs.readFileSync("key.pem")
});
const wss = new WebSocket.Server({
  ...(process.env.NODE_ENV === "development" ? { port: 8081 } : { server }),
  verifyClient: info =>
    info.origin &&
    !!info.origin.match(
      /^https?:\/\/([^.]+\.github\.io|localhost|clocktower\.online|eddbra1nprivatetownsquare\.xyz)/i
    )
});

function noop() {}

// calculate latency on heartbeat
function heartbeat() {
  this.latency = Math.round((new Date().getTime() - this.pingStart) / 2);
  this.counter = 0;
  this.isAlive = true;
}

// map of channels currently in use
const channels = {};

// a new client connects
wss.on("connection", function connection(ws, req) {
  // url pattern: clocktower.online/<channel>/<playerId|host>
  const url = req.url.toLocaleLowerCase().split("/");
  ws.playerId = url.pop();
  ws.channel = url.pop();
  // check for another host on this channel
  if (
    ws.playerId === "host" &&
    channels[ws.channel] &&
    channels[ws.channel].some(
      client =>
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        client.playerId === "host"
    )
  ) {
    console.log(ws.channel, "duplicate host");
    ws.close(1000, `The channel "${ws.channel}" already has a host`);
    return;
  }
  ws.isAlive = true;
  ws.pingStart = new Date().getTime();
  ws.counter = 0;
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
    // check rate limit (max 5msg/second)
    ws.counter++;
    if (ws.counter > (5 * PING_INTERVAL) / 1000) {
      console.log(ws.channel, "disconnecting user due to spam");
      ws.close(
        1000,
        "Your app seems to be malfunctioning, please clear your browser cache."
      );
      return;
    }
    const messageType = data
      .toLocaleLowerCase()
      .substr(1)
      .split(",", 1)
      .pop();
    // don't log ping messages
    if (messageType !== '"ping"') {
      console.log(new Date(), wss.clients.size, ws.channel, ws.playerId, data);
    }
    // handle "direct" messages differently
    if (messageType === '"direct"') {
      try {
        const dataToPlayer = JSON.parse(data)[1];
        channels[ws.channel].forEach(function each(client) {
          if (
            client !== ws &&
            client.readyState === WebSocket.OPEN &&
            dataToPlayer[client.playerId]
          ) {
            client.send(JSON.stringify(dataToPlayer[client.playerId]));
          }
        });
      } catch (e) {
        console.log("error parsing direct message JSON", e);
      }
    } else {
      // all other messages
      channels[ws.channel].forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          // inject latency between both clients if ping message
          if (messageType === '"ping"' && client.latency && ws.latency) {
            client.send(data.replace(/latency/, client.latency + ws.latency));
          } else {
            client.send(data);
          }
        }
      });
    }
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
}, PING_INTERVAL);

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
      `# HELP players_concurrent Concurrent players
# TYPE players_concurrent gauge
players_concurrent{app="clocktower-online"} ${wss.clients.size}

# HELP channels_concurrent Concurrent channels
# TYPE channels_concurrent gauge
channels_concurrent{app="clocktower-online"} ${Object.keys(channels).length}
`
    );
  });
}
