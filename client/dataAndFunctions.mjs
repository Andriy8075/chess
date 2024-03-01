const socket = new WebSocket("ws://127.0.0.1:7992/play");
const appearance = {
    cellSize: 6,
    red: '#fff0f0',
    green: '#f0fff0'
}
const startGameState = {
    inGame: false,
    turnToMove: false,
    kingRow: undefined,
    kingColumn: undefined,
    kingID: undefined,
    color: undefined,
    oppositeColor: undefined,
    chosenPiece: undefined,
    userId: undefined,
    connectedToID: undefined,
    cellSize: undefined,
    moveOnPassantExist: false,
    promotionImageColumn: undefined,
    promotionKillingPieceId: undefined,
    passant: {},
    canCastling: {
        king: true,
        leftRook: true,
        rightRook: true,
    }
};
const gameState = {
    rematch: undefined,
    quickPlay: false,
    inGame: false,
    turnToMove: false,
    kingRow: undefined,
    kingColumn: undefined,
    kingId: undefined,
    color: undefined,
    oppositeColor: undefined,
    chosenPiece: undefined,
    userId: undefined,
    connectedToID: undefined,
    cellSize: undefined,
    moveOnPassantExist: false,
    promotionImageColumn: undefined,
    promotionKillingPieceId: undefined,
    passant: {},
    canCastling: {
        king: true,
        leftRook: true,
        rightRook: true,
    }
};

const changeVar = (value, ...variables) => {
    if(variables.length === 1) gameState[variables] = value;
    else gameState[variables[0]][variables[1]] = value;
};

const sendPacket = (method, data = {}) => {
    data['userId'] = gameState.userId;
    data['method'] = method;
    socket.send(JSON.stringify(data));
}

const display = (...elementsId) => {
    for(const elementId of elementsId) {
        const element = document.getElementById(elementId);
        element.style.display = 'block';
    }
}
const unDisplay = (...elementsId) => {
    for(const elementId of elementsId) {
        const element = document.getElementById(elementId);
        element.style.display = 'none';
    }
}

export {
    socket, appearance, gameState, changeVar, sendPacket, display, unDisplay, startGameState
};
