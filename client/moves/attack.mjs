import {changeCell, pieces} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, gameState} from "../dataAndFunctions.mjs";

const attack = ({color, toRow, toColumn, ignorePieces, moveType = "makeCheck", firstPieceId}) => {
    let lastPieceId;
    if(!firstPieceId) {
        if (color === 'white') {
            firstPieceId = 1;
            lastPieceId = 16;
        }
        else {
            firstPieceId = 17;
            lastPieceId = 32;
        }
    }
    else {
        if (firstPieceId < 17) lastPieceId = 16;
        else lastPieceId = 32;
    }
    for (firstPieceId; firstPieceId <= lastPieceId; firstPieceId++) {
        const currentPiece = pieces[firstPieceId];
        if (!currentPiece) continue;
        if (ignorePieces) {
            let isIgnorePiece;
            for (const ignorePiece of ignorePieces) {
                if (currentPiece === ignorePiece) {
                    isIgnorePiece = true;
                    break;
                }
            }
            if (isIgnorePiece) {
                continue;
            }
        }
        if (currentPiece.canMove(toRow, toColumn, moveType)) return currentPiece;
    }
};

const checkAfterMove = ({piece, toRow, toColumn, killPiece}) => {
    const previousRow = piece.row;
    const previousColumn = piece.column;
    piece.row = toRow;
    piece.column = toColumn;
    changeCell(toRow, toColumn, piece.id);
    changeCell(previousRow, previousColumn, null);
    const isItKing = piece.type === "king";
    if (isItKing) {
        changeVar(toRow, "kingRow");
        changeVar(toColumn, "kingColumn");
    }

    let result;
    if (killPiece) {
        if (attack({
            color: gameState.color,
            toRow: gameState.kingRow,
            toColumn: gameState.kingColumn,
            ignorePieces: [killPiece]})) {
            result = true;
        }
    } else {
        if (attack({
            color: gameState.color,
            toRow: gameState.kingRow,
            toColumn: gameState.kingColumn})) {
            result = true;
        }
    }
    if (isItKing) {
        changeVar(previousRow, "kingRow");
        changeVar(previousColumn, "kingColumn");
    }
    piece.row = previousRow;
    piece.column = previousColumn;
    changeCell(toRow, toColumn, killPiece ? killPiece.id : null);
    changeCell(previousRow, previousColumn, piece.id);
    return result;
};

export {attack, checkAfterMove};
