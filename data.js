
const socket = new WebSocket('ws://127.0.0.2:7992/play');

const vars = {
    inGame: false,
    movePossibility: false,
    kingRow: null,
    kingColumn: null,
    kingID: null,
    color: null,
    oppositeColor: null,
    chosenPiece: null,
    ID: null,
    connectedToID: null,
    cellSize: null,
    moveOnPassantExist: false,
}

const getID = () => {
    const ID = Math.random().toString().slice(2)
    vars.ID = ID;
    return ID;
}

const changeVar = (variable, value) => {
    vars[variable] = value;
}

const piecesForCastlingNeverMoved = {
    king: true,
    leftRook: true,
    rightRook: true,
}

const pieceForCastlingMoved = (pieceName) => {
    piecesForCastlingNeverMoved[pieceName] = false;
}

let passant = {};

const setPassant = (objectWithData) => {
    if (objectWithData) {
        passant.column = objectWithData.column;
        passant.id = objectWithData.id;
    }
    else {
        passant.column = null;
        passant.id = null;
    }
}

export {socket, vars, passant, piecesForCastlingNeverMoved,
    setPassant, pieceForCastlingMoved, changeVar, getID};