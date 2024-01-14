const fs = require("node:fs");
const http = require("node:http");
const WebSocket = require("ws");

const index = fs.readFileSync("../client/index.html", "utf8");

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(index);
});

server.listen(7992, () => {
});

const ws = new WebSocket.Server({server});

const sockets = {};

const sendPocket = (user, data) => {
    if (sockets[user] && sockets[user].readyState === WebSocket.OPEN) sockets[user].send(JSON.stringify(data));
    return true;
};

ws.on("connection", (connection) => {
    connection.on("message", (message) => {
        const parsed = JSON.parse(message);
        const methods = {
            assignID: () => {
                connection.id = parsed.userId;
                sockets[parsed.userId] = connection;
                const pocket = {
                    method: "assignID", userId: parsed.userId,
                };
                sendPocket(parsed.userId, pocket);
            }, chooseColor: () => {
                let oppositeColor;
                if (parsed.color === "white") {
                    oppositeColor = "black";
                } else {
                    oppositeColor = "white";
                }
                const ourPocket = {
                    method: "receiveColor", color: parsed.color,
                };

                const opponentPocket = {
                    method: "receiveColor", color: oppositeColor,
                };

                sendPocket(parsed.userId, ourPocket);
                const opponentID = sockets[parsed.userId].connectedTo;
                sendPocket(opponentID, opponentPocket);
            }, connectToID: () => {
                if (parsed.to === parsed.from) return;
                const pocket = {
                    method: "connectToID", userId: parsed.from,
                };
                const findRequiredID = sendPocket(parsed.to, pocket);
                if (findRequiredID) {
                    sockets[parsed.from].connectedTo = parsed.to;
                    sockets[parsed.to].connectedTo = parsed.from;
                    const pocket = {
                        method: "connectToID", userId: parsed.to,
                    };
                    sendPocket(parsed.from, pocket);
                }
            },
        };
        const method = methods[parsed.method];
        if (method) method(); else sendPocket(sockets[parsed.userId].connectedTo, parsed);
    });
    connection.on("close", () => {
        const opponentId = connection.connectedTo;
        const opponent = sockets[opponentId];
        if (opponent) {
            opponent.connectedTo = null;
        }
        delete sockets[connection.id];
        const pocket = {
            method: "disconnect",
        };
        sendPocket(opponentId, pocket);
    });
});
