const WebSocket = require('ws');
const port = process.env.PORT || 8080

const wss = new WebSocket.Server({ port });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something from server');
});