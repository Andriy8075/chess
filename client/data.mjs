const socket = new WebSocket("ws://127.0.0.2:7992/play");

const gameState = {
    inGame: false,
    movePossibility: false,
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
    finishImageColumn: undefined,
    finishImageRow: undefined,
};

const changeVar = (variable, value) => {
    gameState[variable] = value;
};

const getID = () => {
    const userId = parseInt(Math.random().toString().slice(2));
    gameState.userId = userId;
    return userId;
};

const piecesForCastlingNeverMoved = {
    king: true, leftRook: true, rightRook: true,
};

const pieceForCastlingMoved = (pieceName) => {
    piecesForCastlingNeverMoved[pieceName] = false;
};

let passant = {};

const setPassant = (objectWithData) => {
    if (objectWithData) {
        passant.column = objectWithData.column;
        passant.id = objectWithData.id;
    } else {
        passant.column = null;
        passant.id = null;
    }
};

export {
    socket, gameState, passant, piecesForCastlingNeverMoved, setPassant, pieceForCastlingMoved, changeVar, getID,
};
