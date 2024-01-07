
const fs = require('node:fs');
const http = require('node:http');
const WebSocket = require('ws');


const index = fs.readFileSync('./index.html', 'utf8');

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(index);
});

server.listen(7992, () => {

});

const ws = new WebSocket.Server({server});

const sendPocket = (parsed) => {
    for(const client of ws.clients) {
        if(client.connectedTo === parsed.ID) {
            delete parsed.ID;
            client.send(JSON.stringify(parsed));
            break;
        }
    }
}

ws.on('connection', (connection) => {
    connection.on('message', (message) => {
        const parsed = JSON.parse(message);
        switch (parsed.method) {
            case 'assignID':
                connection.ID = parsed.ID;
                const pocket = {
                    method: 'assignID',
                    ID: parsed.ID,
                }
                for(const client of ws.clients) {
                    if(client === connection) {
                        client.ID = parsed.ID;
                        client.send(JSON.stringify(pocket));
                    }
                }
                break;
            case 'chooseColor':
                 for (const client of ws.clients) {
                     if (client.connectedTo === parsed.ID) {
                         let oppositeColor;
                         if (parsed.color === 'white') {
                             oppositeColor = 'black';
                         }else {
                             oppositeColor = 'white';
                         }
                         const pocket = {
                             method: 'receiveColor',
                             color: oppositeColor,
                         }
                         client.send(JSON.stringify(pocket));
                     }
                     if (parsed.ID === client.ID) {
                         const pocket = {
                             method: 'receiveColor',
                             color: parsed.color,
                         }
                         client.send(JSON.stringify(pocket));
                     }
                 }
                 break;
            case 'connectToID':
                if (parsed.to === parsed.from) break;

                let findRequiredID = false;
                for(const client of ws.clients) {
                    if(!client.connectedTo){
                        if(client.ID === parsed.to) {
                            findRequiredID = true;
                            client.connectedTo = parsed.from;
                            const pocket = {
                                method: 'connectToID',
                                ID: parsed.from,
                            }
                            client.send(JSON.stringify(pocket));
                            break;
                        }
                    }
                }
                if(findRequiredID){
                    for(const client of ws.clients) {
                        if(client.ID === parsed.from) {
                            client.connectedTo = parsed.to;
                            const pocket = {
                                method: 'connectToID',
                                ID: parsed.to,
                            }
                            client.send(JSON.stringify(pocket));
                        }
                    }
                }
                break;
            case 'deleteConnectedToID':
                for(const client of ws.clients) {
                    if(client === connection) client.connectedTo = null;
                }
                break;
            default: 
                sendPocket(parsed);
                break;    
        }
    });
    connection.on('close', () => {
        for(const client of ws.clients) {
            if(connection.ID ===  client.connectedTo) {
                const pocket = {
                    method: 'disconnect',
                }
                client.send(JSON.stringify(pocket));
            }
        }
    });
});