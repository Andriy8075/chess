'use strict';

const fs = require('node:fs');
const http = require('node:http');
const {OPEN, Server} = require('ws');

const index = fs.readFileSync('../client/index.html', 'utf8');

const server = http.createServer
((req, res) => {
  res.writeHead(200);
  res.end(index);
});

server.listen(7992, () => {
});

const ws = new Server({ server });

const sockets = {};

let waitingGame = null;

const sendPacket = (user, data) => {
  const connection = sockets[user];
  const canSent = connection && connection.readyState === OPEN;
  if (canSent) connection.send(JSON.stringify(data));
  return canSent;
};

const methods = {
  assignID: (connection, {userId}) => {
    connection.id = userId;
    sockets[userId] = connection;
  },
  chooseColor: (connection, {color, userId}) => {
    const oppositeColor = color === 'white' ? 'black' : 'white';
    const method = 'receiveColor';
    const ourPacket = { method, color: color };
    const opponentPacket = { method, color: oppositeColor };

    const { connectedTo } = sockets[userId];
    const sent = sendPacket(connectedTo, opponentPacket);
    if(sent) sendPacket(userId, ourPacket);
  },
  connectToID: (connection, {from, to, quickPlay}) => {
    if (to === from) return;
    const packet = {
      method: 'connectToID',
      userId: from,
      color: quickPlay ? 'white' : undefined,
    };
    const findId = sendPacket(to, packet);
    if (findId) {
      sockets[from].connectedTo = to;
      sockets[to].connectedTo = from;
      const packet = {
        method: 'connectToID',
        userId: to,
        color: quickPlay ? 'black' : undefined,
      };
      sendPacket(from, packet);
    }
  },
  quickPlay: (connection, {userId, quickPlay}) => {
    if(sockets[userId].connectedTo) return;
    if(!quickPlay) {
      if(waitingGame) {
        methods.connectToID(connection, {
          from: userId,
          to: waitingGame.id,
          quickPlay: true,
        })
        waitingGame = null;
      }
      else {
        waitingGame = connection;
      }
    }
    else {
      waitingGame = null;
      const packet = {
        method: 'cancelNextGame',
      }
      sendPacket(userId, packet);
    }
  }
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
    const packet = {
      method: 'disconnect',
    };
    sendPacket(opponentId, packet);
  });
});
