const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");

const server = https.createServer({
  cert: fs.readFileSync("cert.pem"),
  key: fs.readFileSync("key.pem")
});
const wss = new WebSocket.Server({
  server,
  // port: 8081,
  verifyClient: info =>
    !!info.origin.match(/^https?:\/\/(bra1n\.github\.io|localhost)/i)
});

wss.on("connection", function connection(ws, req) {
  ws.channel = req.url
    .split("/")
    .pop()
    .toLocaleLowerCase();
  ws.on("message", function incoming(data) {
    console.log(data);
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

server.listen(8080);
