const fs = require("node:fs");
const http = require("node:http");
const WebSocket = require("ws");

const index = fs.readFileSync("./index.html", "utf8");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(index);
});

server.listen(7992, () => {});

const ws = new WebSocket.Server({ server });

const sendPocket = (parsed) => {
  for (const client of ws.clients) {
    if (client.connectedTo === parsed.userId) {
      delete parsed.userId;
      client.send(JSON.stringify(parsed));
      break;
    }
  }
};

ws.on("connection", (connection) => {
  connection.on("message", (message) => {
    const parsed = JSON.parse(message);
    const methods = {
      assignID: () => {
        connection.usreId = parsed.userId;
        const pocket = {
          method: "assignID",
          userId: parsed.userId,
        };
        for (const client of ws.clients) {
          if (client === connection) {
            client.userId = parsed.userId;
            client.send(JSON.stringify(pocket));
          }
        }
      },
      chooseColor: () => {
        for (const client of ws.clients) {
          if (client.connectedTo === parsed.userId) {
            let oppositeColor;
            if (parsed.color === "white") {
              oppositeColor = "black";
            } else {
              oppositeColor = "white";
            }
            const pocket = {
              method: "receiveColor",
              color: oppositeColor,
            };
            client.send(JSON.stringify(pocket));
          }
          if (parsed.userId === client.userId) {
            const pocket = {
              method: "receiveColor",
              color: parsed.color,
            };
            client.send(JSON.stringify(pocket));
          }
        }
      },
      connectToID: () => {
        if (parsed.to === parsed.from) return;

        let findRequiredID = false;
        for (const client of ws.clients) {
          if (!client.connectedTo) {
            if (client.userId === parsed.to) {
              findRequiredID = true;
              client.connectedTo = parsed.from;
              const pocket = {
                method: "connectToID",
                userId: parsed.from,
              };
              client.send(JSON.stringify(pocket));
              break;
            }
          }
        }
        if (findRequiredID) {
          for (const client of ws.clients) {
            if (client.userId === parsed.from) {
              client.connectedTo = parsed.to;
              const pocket = {
                method: "connectToID",
                userId: parsed.to,
              };
              client.send(JSON.stringify(pocket));
            }
          }
        }
      },
      deleteConnectedToID: () => {
        for (const client of ws.clients) {
          if (client === connection) client.connectedTo = null;
        }
      },
    };
    const method = methods[parsed.method];
    if (method) method();
    else sendPocket(parsed);
  });
  connection.on("close", () => {
    for (const client of ws.clients) {
      if (connection.userId === client.connectedTo) {
        const pocket = {
          method: "disconnect",
        };
        client.send(JSON.stringify(pocket));
      }
    }
  });
});
