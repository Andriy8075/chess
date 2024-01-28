import {changeCell, pieces} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, gameState} from "../data.mjs";

const attack = (color, attackForRow, attackForColumn, ignorePieces, moveType, firstPieceId) => {
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
    if (!moveType) moveType = "makeCheck";
    for (firstPieceId; firstPieceId <= lastPieceId; firstPieceId++) {
        const currentPiece = pieces[firstPieceId];
        if (!currentPiece) continue;
        // if (currentPiece.color === color) {
        //     const startOfWhitePieces = 17;
        //     if (firstPieceId < startOfWhitePieces) {
        //         firstPieceId = startOfWhitePieces - 1;
        //         continue;
        //     } else break;
        // }
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
        if (currentPiece.canMove(attackForRow, attackForColumn, moveType)) return currentPiece;
    }
};

const checkAfterMove = (Piece, toRow, toColumn, killingPiece) => {
    const previousRow = Piece.row;
    const previousColumn = Piece.column;
    Piece.row = toRow;
    Piece.column = toColumn;
    changeCell(toRow, toColumn, Piece.id);
    changeCell(previousRow, previousColumn, null);
    const isItKing = Piece.type === "king";
    if (isItKing) {
        changeVar(toRow, "kingRow");
        changeVar(toColumn, "kingColumn");
    }

    let result;
    if (killingPiece) {
        if (attack(gameState.color, gameState.kingRow, gameState.kingColumn, [killingPiece])) {
            result = true;
        }
    } else {
        if (attack(gameState.color, gameState.kingRow, gameState.kingColumn)) {
            result = true;
        }
    }
    if (isItKing) {
        changeVar(previousRow, "kingRow");
        changeVar(previousColumn, "kingColumn");
    }
    Piece.row = previousRow;
    Piece.column = previousColumn;
    changeCell(toRow, toColumn, killingPiece ? killingPiece.id : null);
    changeCell(previousRow, previousColumn, Piece.id);
    return result;
};

export {attack, checkAfterMove};
