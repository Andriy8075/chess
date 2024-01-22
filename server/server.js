'use strict';

const fs = require('node:fs');
const http = require('node:http');
const WebSocket = require('ws');

const index = fs.readFileSync('../client/index.html', 'utf8');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(index);
});

server.listen(7992, () => {
});

const ws = new WebSocket.Server({ server });

const sockets = {};

const sendPacket = (user, data) => {
  const connection = sockets[user];
  const sent = connection && connection.readyState === WebSocket.OPEN;
  if (sent) connection.send(JSON.stringify(data));
  return sent;
};

const methods = {
  assignID: (connection, data) => {
    connection.id = data.userId;
    sockets[data.userId] = connection;
    // const pocket = {
    //   method: 'assignID', userId: data.userId,
    // };
    // sendPacket(data.userId, pocket);
  },
  chooseColor: (connection, data) => {
    const oppositeColor = data.color === 'white' ? 'black' : 'white';
    // if (data.color === "white") oppositeColor = "black";
    // else oppositeColor = "white";
    const method = 'receiveColor';
    const ourPocket = { method, color: data.color };
    const opponentPocket = { method, color: oppositeColor };

    sendPacket(data.userId, ourPocket);
    const { connectedTo } = sockets[data.userId];
    sendPacket(connectedTo, opponentPocket);
  },
  connectToID: (connection, data) => {
    const { from, to } = data;
    if (to === from) return;
    const pocket = {
      method: 'connectToID', userId: data.from,
    };
    const findRequiredID = sendPacket(data.to, pocket);
    if (findRequiredID) {
      sockets[from].connectedTo = to;
      sockets[to].connectedTo = from;
      const pocket = {
        method: 'connectToID', userId: data.to,
      };
      sendPacket(data.from, pocket);
    }
  },
};

ws.on('connection', (connection) => {
  connection.on('message', (message) => {
    const parsed = JSON.parse(message);
    const method = methods[parsed.method];
    if (method) return void method(connection, parsed);
    const { connectedTo } = sockets[parsed.userId];
    sendPacket(connectedTo, parsed);
  });
  connection.on('close', () => {
    const opponentId = connection.connectedTo;
    const opponent = sockets[opponentId];
    if (opponent) opponent.connectedTo = null;
    delete sockets[connection.id];
    const pocket = {
      method: 'disconnect',
    };
    sendPacket(opponentId, pocket);
  });
});
