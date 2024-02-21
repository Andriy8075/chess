'use strict';

const fs = require('node:fs');
const http = require('node:http');
const {OPEN, Server} = require('ws');

const index = fs.readFileSync('../client/index.html', 'utf8');

const server = http.createServer((req, res) => {
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
  const sent = connection && connection.readyState === OPEN;
  if (sent) connection.send(JSON.stringify(data));
  return sent;
};

const methods = {
  assignID: (connection, data) => {
    connection.id = data.userId;
    sockets[data.userId] = connection;
    // const packet = {
    //   method: 'assignID', userId: data.userId,
    // };
    // sendPacket(data.userId, packet);
  },
  chooseColor: (connection, data) => {
    const oppositeColor = data.color === 'white' ? 'black' : 'white';
    // if (data.color === "white") oppositeColor = "black";
    // else oppositeColor = "white";
    const method = 'receiveColor';
    const ourPacket = { method, color: data.color };
    const opponentPacket = { method, color: oppositeColor };

    const { connectedTo } = sockets[data.userId];
    const sent = sendPacket(connectedTo, opponentPacket);
    if(sent) sendPacket(data.userId, ourPacket);
  },
  connectToID: (connection, data) => {
    const { from, to } = data;
    if (to === from) return;
    const packet = {
      method: 'connectToID',
      userId: data.from,
      color: data.quickPlay ? 'white' : undefined,
    };
    const findId = sendPacket(data.to, packet);
    if (findId) {
      sockets[from].connectedTo = to;
      sockets[to].connectedTo = from;
      const packet = {
        method: 'connectToID',
        userId: data.to,
        color: data.quickPlay ? 'black' : undefined,
      };
      sendPacket(data.from, packet);
    }
  },
  quickPlay: (connection, data) => {
    if(!sockets[data.userId].connectedTo) {
      if(!data.quickPlay) {
        if(waitingGame) {
          methods.connectToID(connection, {
            from: data.userId,
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
        sendPacket(data.userId, packet);
      }
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
