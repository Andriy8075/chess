import {changeCell, pieces} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, gameState, countOfPieces,
    fistColorPieceMaxId} from "../dataAndFunctions.mjs";
const attack = ({color, toRow, toCol, ignorePieces,
    moveType = "makeCheckForOurKing", firstPieceId}) => {
    let lastPieceId;
    if(firstPieceId) {
        lastPieceId = firstPieceId <= fistColorPieceMaxId ?
            fistColorPieceMaxId : countOfPieces;
    }
    else {
        [firstPieceId, lastPieceId] = color === 'white' ?
            [1, fistColorPieceMaxId] : [fistColorPieceMaxId+1, countOfPieces];
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

        if (currentPiece.canMove({
            toRow, toCol, moveType
        })) return currentPiece;
    }
};

const checkAfterMove = ({piece, toRow, toCol, killPiece}) => {
    const previousRow = piece.row;
    const previousCol = piece.col;
    piece.row = toRow;
    piece.col = toCol;
    changeCell(toRow, toCol, piece.id);
    changeCell(previousRow, previousCol, null);
    const isItKing = piece.type === "king";
    if (isItKing) {
        changeVar(toRow, "kingRow");
        changeVar(toCol, "kingCol");
    }

    let result;
    if (killPiece) {
        if (attack({
            color: gameState.color,
            toRow: gameState.kingRow,
            toCol: gameState.kingCol,
            ignorePieces: [killPiece]})) {
            result = true;
        }
    } else {
        if (attack({
            color: gameState.color,
            toRow: gameState.kingRow,
            toCol: gameState.kingCol})) {
            result = true;
        }
    }
    if (isItKing) {
        changeVar(previousRow, "kingRow");
        changeVar(previousCol, "kingCol");
    }
    piece.row = previousRow;
    piece.col = previousCol;
    changeCell(toRow, toCol, killPiece ? killPiece.id : null);
    changeCell(previousRow, previousCol, piece.id);
    return result;
};

export {attack, checkAfterMove};
