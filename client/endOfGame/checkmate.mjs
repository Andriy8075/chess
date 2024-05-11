import {
    changeVar,
    gameState,
    boardSize,
    countOfPieces,
    fistColorPieceMaxId,
} from "../dataAndFunctions.mjs";
import {attack, checkAfterMove} from "../moves/attackAndCheck.mjs";
import {cells, pieces} from "../arrangePieces/arrangePieces.mjs";

let king;
const defineKing = () => {
    king = pieces[gameState.kingId];
}

const canKillAttackingPiece = (firstPieceId) => {
    const { oppositeColor, attackingPiece } = gameState;
    const savingPiece = attack({
        color: oppositeColor,
        toRow: attackingPiece.row,
        toCol: attackingPiece.col,
        ignorePiece: king,
        moveType: "withKill",
        firstPieceId: firstPieceId,
    });
    if (savingPiece) {
        if (gameState.moveOnPassantExist) {
            changeVar(false, "moveOnPassantExist");
            return true;
        }
        const checkAfterKillAttackingPiece = checkAfterMove({
            piece: savingPiece,
            toRow: attackingPiece.row,
            toCol: attackingPiece.col,
            killPiece: attackingPiece
        });
        if (checkAfterKillAttackingPiece) {
            if(savingPiece.id === countOfPieces ||
                savingPiece.id === fistColorPieceMaxId){
                return false
            }
            return canKillAttackingPiece(savingPiece.id + 1);
        }
        return true;
    }
};

const hideKing = (toRow, toCol, firstPieceId) => {
    const { oppositeColor } = gameState;
    const savingPiece = attack({
        color: oppositeColor,
        toRow, toCol,
        ignorePiece: king,
        moveType: "withoutKill",
        firstPieceId
    });
    if(!savingPiece) return false;
    if (gameState.moveOnPassantExist) {
        changeVar(false, "moveOnPassantExist");
        return true;
    }
    const isCheckAfterMove = checkAfterMove(
        {
            piece: savingPiece,
            toRow, toCol
        });
    if (isCheckAfterMove) {
        if(savingPiece.id === countOfPieces ||
            savingPiece.id === fistColorPieceMaxId){
            return false
        }
        return hideKing(
            toRow, toCol, savingPiece.id + 1
        );
    }
    return true;
};

const checkFromRook = () => {
    const { attackingPiece, kingRow, kingCol } = gameState;
    if (attackingPiece.col === kingCol) {
        if (attackingPiece.row < kingRow) {
            for (let currentCellRow = kingRow - 1;
                 currentCellRow > attackingPiece.row;
                 currentCellRow--) {
                if (hideKing(currentCellRow, kingCol)) {
                    return false;
                }
            }
            return true;
        } else {
            for (let currentCellRow = kingRow + 1;
                 currentCellRow < attackingPiece.row;
                 currentCellRow++) {
                if (hideKing(currentCellRow, kingCol)) {
                    return false;
                }
            }
            return true;
        }
    } else {
        if (attackingPiece.col < kingCol) {
            for (let currentCellCol = kingCol - 1;
                 currentCellCol > attackingPiece.col;
                 currentCellCol--) {
                if (hideKing(kingRow, currentCellCol)) {
                    return false;
                }
            }
            return true;
        } else {
            for (let currentCellCol = kingCol + 1;
                 currentCellCol < attackingPiece.col;
                 currentCellCol++) {
                if (hideKing(kingRow, currentCellCol)) {
                    return false;
                }
            }
            return true;
        }
    }
};

const checkFromBishop = () => {
    const { attackingPiece, kingRow, kingCol } = gameState;
    if (attackingPiece.row < kingRow) {
        if (attackingPiece.col < kingCol) {
            let currentCellCol = kingCol - 1;
            for (let currentCellRow = kingRow - 1;
                 currentCellRow > attackingPiece.row;
                 currentCellRow--, currentCellCol--) {
                if (hideKing(currentCellRow, currentCellCol)) {
                    return false;
                }
            }
            return true;
        } else {
            let currentCellCol = kingCol + 1;
            for (let currentCellRow = kingRow - 1;
                 currentCellRow > attackingPiece.row;
                 currentCellRow--, currentCellCol++) {
                if (hideKing(currentCellRow, currentCellCol)) {
                    return false;
                }
            }
            return true;
        }
    } else {
        if (attackingPiece.col < kingCol) {
            let currentCellCol = kingCol - 1;
            for (let currentCellRow = kingRow + 1;
                 currentCellRow < attackingPiece.row;
                 currentCellRow++, currentCellCol--) {
                if (hideKing(currentCellRow, currentCellCol)) {
                    return false;
                }
            }
            return true;
        } else {
            let currentCellCol = kingCol + 1;
            for (let currentCellRow = kingRow + 1;
                 currentCellRow < attackingPiece.row;
                 currentCellRow++, currentCellCol++) {
                if (hideKing(currentCellRow, currentCellCol)) {
                    return false;
                }
            }
            return true;
        }
    }
};

const checkmate = () => {

    const { attackingPiece, kingRow, kingCol, color} = gameState;

    {
        for (let row = kingRow - 1; row <= kingRow + 1; row++) {
            if (row < 0 || row >= boardSize) continue;
            for (let col = kingCol - 1; col <= kingCol + 1;
                 col++) {
                if (col < 0 || col >= boardSize) continue;
                if (row === kingRow && col === kingCol) continue;
                const pieceId = cells[row][col];
                if(pieceId) {
                    const piece = pieces[pieceId];
                    if(piece.color === color) continue;
                    const isCheckAfterMove = checkAfterMove(
                        {
                        piece: king,
                        toRow: row,
                        toCol: col,
                        killPiece: piece
                    });
                    if(!isCheckAfterMove) return false;
                }
                else {
                    const isCheckAfterMove = checkAfterMove(
                        {
                        piece: king,
                        toRow: row,
                        toCol: col,
                    });
                    if(!isCheckAfterMove) return false;
                }
            }
        }
    }

    {
        const secondPieceThatMakeCheck = attack({
            color,
            toRow: kingRow,
            toCol: kingCol,
            ignorePieces: [attackingPiece],
        });
        if (secondPieceThatMakeCheck) return true;
    }

    {
        if(canKillAttackingPiece()) return false;
        if (attackingPiece.type === "pawn" || attackingPiece.type === "knight")
            return true;
    }

    if (attackingPiece.type === "rook") {
        return checkFromRook();
    }
    if (attackingPiece.type === "bishop") {
        return checkFromBishop();
    }
    if (attackingPiece.type === "queen") {
        if (attackingPiece.col === kingCol ||
            attackingPiece.row === kingRow) {
            return checkFromRook();
        }
        return checkFromBishop();
    }

}

export {checkmate, defineKing};
