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
    promotionImageColumn: undefined,
    promotionImageRow: undefined,
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

// const canCastling = {
//     king: true, leftRook: true, rightRook: true,
// };
//
// const pieceForCastlingMoved = (pieceName) => {
//     gameState.canCastling[pieceName] = false;
// };
//
// let passant = {};
//
// const setPassant = (objectWithData) => {
//     if (objectWithData) {
//         gameState.passant.column = objectWithData.column;
//         gameState.passant.id = objectWithData.id;
//     } else {
//         gameState.passant.column = null;
//         gameState.passant.id = null;
//     }
// };

export {
    socket, gameState, changeVar,
};
