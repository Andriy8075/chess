import {pieces} from "../arrangePieces/arrangePieces.mjs";

let previousMoves = [];

const writeDownPosition = () => {
    let move = [];
    for (const piece of pieces) {
        let pieceInfo;
        if (piece) {
            pieceInfo = {
                id: piece.id,
                row: piece.row,
                col: piece.col,
            };
        }
        else {
            pieceInfo = null;
        }
        move.push(pieceInfo);
    }
    previousMoves.push(move);
};

const clear = () => {
    previousMoves = [];
};

function comparePieces(piece1, piece2) {
    if (piece1 && piece2) {
        return (piece1.row === piece2.row &&
            piece1.col === piece2.col);
    }
    else {
        return piece1 === piece2;
    }
}

const compareArraysOfMoves = (array1, array2) => {
    if(!array1 || !array2) return false;
    if (array1 && array2) {
        for (let i = 0; i < array1.length; i++) {
            if (!comparePieces(array1[i], array2[i])) return false;
        }
        return true;
    }
};

const repeatingTheSameMoves = () => {
    if (!previousMoves.length) return;
    const currentMove = previousMoves[previousMoves.length - 1];
    let theSameMoves = 0;
    for (let i = 1; i <= previousMoves.length; i++) {
        if (compareArraysOfMoves(currentMove, previousMoves[i])) theSameMoves++;
    }
    if (theSameMoves >= 3) return true;
};

export {writeDownPosition, clear, repeatingTheSameMoves};
