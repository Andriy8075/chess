const socket = new WebSocket("ws://127.0.0.1:7992/play");

const appearance = {
    cellSize: getComputedStyle(document.body).getPropertyValue('--cellSize'),
    red: '#fff0f0',
    green: '#f0fff0',
}

const boardSize = 8;
const countOfPieces = 32;
const fistColorPieceMaxId = countOfPieces/2;
const maxRowAndCol = boardSize-1;
const startPawnRow = 6;
const passantRow = 2;

const rookIds = {
    whiteLeft: 25,
    whiteRight: 32,
    blackLeft: 8,
    blackRight: 1,
}

const startGameState = {
    inGame: false,
    turnToMove: false,
    kingRow: undefined,
    kingCol: undefined,
    kingID: undefined,
    color: undefined,
    oppositeColor: undefined,
    chosenPiece: undefined,
    userId: undefined,
    connectedToID: undefined,
    moveOnPassantExist: false,
    promotionImageCol: undefined,
    promotionKillingPieceId: undefined,
    passant: {},
    canCastling: {
        king: true,
        leftRook: true,
        rightRook: true,
    }
};
const gameState = {
    rowDifferences: {
        our: -1,
        opponent: 1,
    },

    startPawnRows: {
        our: 6,
        opponent: 1,
    },

    passantRows: {
        our: 2,
        opponent: 5,
    },
    endRows: {
        our: 0,
        opponent: 7,
    },

    rematch: undefined,
    quickPlay: false,
    inGame: false,
    turnToMove: false,

    king: {
        black: {
            kingRow: undefined,
            kingCol: undefined,
            kingId: undefined,
        },
        white: {
            kingRow: undefined,
            kingCol: undefined,
            kingId: undefined,
        },
    },

    color: undefined,
    oppositeColor: undefined,
    chosenPiece: undefined,
    userId: undefined,
    connectedToID: undefined,
    cellSize: undefined,
    moveOnPassantExist: false,
    promotionImageCol: undefined,
    promotionKillingPieceId: undefined,
    attackingPiece: null,

    passant: {
         white: {

         },
        black: {

        }
    },

    canCastling: {
        white: {
            king: true,
            leftRook: true,
            rightRook: true,
        },
        black: {
            king: true,
            leftRook: true,
            rightRook: true,
        },
    },

    lastMessage: null,
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

const inputMessageInChat = (text, ourMessage) => {
    if(!text) return;
    const message = document.createElement('p');
    const messagesField = document.getElementById('chatMessages');
    const divWrapper = document.createElement('div');
    message.innerHTML = text;
    message.style.display = 'flex';
    divWrapper.style.backgroundColor = '#a2fb90';
    message.style.lineHeight = 'normal';
    message.style.wordBreak = 'breakAll';
    if(ourMessage) {
        message.style.textAlign = 'right';
        message.style.justifyContent = 'right'
    }
    divWrapper.style.backgroundColor = ourMessage ? '#edffed' : 'white';
    message.style.margin = '0px';
    divWrapper.style.margin = '0.2em';
    messagesField.insertBefore(divWrapper, gameState.lastMessage ?
        gameState.lastMessage : null);
    divWrapper.appendChild(message);
    changeVar(divWrapper, 'lastMessage');
}

export {
    socket, appearance, gameState,  startGameState, countOfPieces, boardSize,
    changeVar, sendPacket, display, unDisplay, fistColorPieceMaxId,
    maxRowAndCol, startPawnRow, passantRow, rookIds, inputMessageInChat,
};
