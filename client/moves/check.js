import {changeCell, pieces} from "../arrangePieces/arrangePieces.js";
import {changeVar, gameState} from "../data.js";

const attack = (color, attackForRow, attackForColumn, ignorePieces, moveType, i = 1,) => {
    if (!moveType) moveType = "makeCheck";
    const countOfPieces = 32;
    for (i; i <= countOfPieces; i++) {
        const currentPiece = pieces[i];
        if (!currentPiece) continue;
        if (currentPiece.color === color) {
            const startOfWhitePieces = 17;
            if (i < startOfWhitePieces) {
                i = startOfWhitePieces - 1;
                continue;
            } else break;
        }
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
    const isItKing = Piece.type === "King";
    if (isItKing) {
        changeVar("kingRow", toRow);
        changeVar("kingColumn", toColumn);
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
        changeVar("kingRow", previousRow);
        changeVar("kingColumn", previousColumn);
    }
    Piece.row = previousRow;
    Piece.column = previousColumn;
    changeCell(toRow, toColumn, killingPiece ? killingPiece.id : null);
    changeCell(previousRow, previousColumn, Piece.id);
    return result;
};

export {attack, checkAfterMove};
