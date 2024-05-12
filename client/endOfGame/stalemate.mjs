import {changeVar, gameState, maxRowAndCol} from "../dataAndFunctions.mjs";
import {cells, pieces} from "../arrangePieces/arrangePieces.mjs";
import {checkAfterMove} from "../moves/attackAndCheck.mjs";

const canMoveTo = (piece, toRow, toCol) => {
    const pieceIdOnCellMoveTo = cells[toRow][toCol]
    if (!pieceIdOnCellMoveTo) {
        return !checkAfterMove({piece, toRow, toCol});
    } else {
        let pieceOnCellMoveTo = pieces[pieceIdOnCellMoveTo];
        if (pieceOnCellMoveTo.color === gameState.oppositeColor) {
            return !checkAfterMove({
                piece, toRow, toCol,
                killPiece: pieceOnCellMoveTo
            })
        }
    }
};

const moveExist = {
    rook: (piece) => {
        if (piece.col > 0) {
            if (canMoveTo(piece, piece.row, piece.col - 1)) {
                return true;
            }
        }
        if (piece.col < maxRowAndCol) {
            if (canMoveTo(piece, piece.row, piece.col + 1)) {
                return true;
            }
        }
        if (piece.row > 0) {
            if (canMoveTo(piece, piece.row - 1, piece.col)) {
                return true;
            }
        }
        if (piece.row < maxRowAndCol) {
            if (canMoveTo(piece, piece.row + 1, piece.col)) {
                return true;
            }
        }
        return false
    },
    bishop: (piece) => {
        if (piece.col > 0 && piece.row > 0) {
            if (canMoveTo(piece,
                piece.row - 1, piece.col - 1)) {
                return true;
            }
        }
        if (piece.col < maxRowAndCol && piece.row > 0) {
            if (canMoveTo(piece,
                piece.row - 1, piece.col + 1)) {
                return true;
            }
        }
        if (piece.col > 0 && piece.row < maxRowAndCol) {
            if (canMoveTo(piece,
                piece.row + 1, piece.col - 1)) {
                return true;
            }
        }

        if (piece.col < maxRowAndCol && piece.row < maxRowAndCol) {
            if (canMoveTo(piece,
                piece.row + 1, piece.col + 1)) {
                return true;
            }
        }
        return  false
    },
    pawn: (piece) => {
        const pieceIdInFront = cells[piece.row - 1][piece.col];
        if (!pieceIdInFront && !checkAfterMove({
                piece,
                toRow: piece.row -1,
                toCol: piece.col
            }))
            return true;
        let pieceToKill;
        if (piece.col > 0) {
            const pieceToKillId = cells[piece.row - 1][piece.col - 1];
            if (pieceToKillId) {
                pieceToKill = pieces[pieceToKillId];
                if (pieceToKill.color === gameState.oppositeColor &&
                    !checkAfterMove({
                        piece,
                        toRow: piece.row -1,
                        toCol: piece.col -1,
                        killPiece: pieceToKill
                    }))
                    return true;
            }
        }

        if (piece.col < maxRowAndCol) {
            const pieceToKillId = cells[piece.row - 1][piece.col + 1];
            if (pieceToKillId) {
                pieceToKill = pieces[pieceToKillId];
                if (pieceToKill.color === gameState.oppositeColor &&
                    !checkAfterMove({
                        piece,
                        toRow: piece.row -1,
                        toCol: piece.col +1,
                        killPiece: pieceToKill,
                    }))
                    return true;
            }
        }
        if (gameState.passant.id) {
            if (piece.canMove({
                toRow: 2,
                toCol: gameState.passant.col,
                moveType: "passant"})) {
                changeVar(false, "moveOnPassantExist");
                return true;
            }
        }
        return false;
    },
    knight: (piece) => {
        if (piece.col > 0) {
            if (piece.row > 1) if (canMoveTo(piece, piece.row - 2, piece.col - 1)) return true;
            if (piece.row < maxRowAndCol-1) if (canMoveTo(piece, piece.row + 2, piece.col - 1)) return true;
            if (piece.col > 1) {
                if (piece.row > 0) if (canMoveTo(piece, piece.row - 1, piece.col - 2)) return true;
                if (piece.row < maxRowAndCol) if (canMoveTo(piece, piece.row + 1, piece.col - 2)) return true;
            }
        }
        if (piece.col < maxRowAndCol) {
            if (piece.row > 1) if (canMoveTo(piece, piece.row - 2, piece.col + 1)) return true;
            if (piece.row < maxRowAndCol-1) if (canMoveTo(piece, piece.row + 2, piece.col + 1)) return true;
            if (piece.col < maxRowAndCol-1) {
                if (piece.row > 0) if (canMoveTo(piece, piece.row - 1, piece.col + 2)) return true;
                if (piece.row < maxRowAndCol) if (canMoveTo(piece, piece.row + 1, piece.col + 2)) return true;
            }
        }
        return false;
    },
    queen: (piece) => {
        if (moveExist.rook(piece, piece.col, piece.row)) return true;
        return (moveExist.bishop(piece, piece.col, piece.row));
    },

    king: (piece) => {
        if (moveExist.rook(piece, piece.col, piece.row)) return true;
        return (moveExist.bishop(piece, piece.col, piece.row));
    },
};

const stalemate = () => {
    for (const piece of pieces) {
        if (piece && piece.color === gameState.color && moveExist[piece.type](piece)) return false;
    }
    return true;
};

export {stalemate};
