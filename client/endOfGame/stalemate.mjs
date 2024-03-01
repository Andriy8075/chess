import {changeVar, gameState} from "../dataAndFunctions.mjs";
import {cells, pieces} from "../arrangePieces/arrangePieces.mjs";
import {checkAfterMove} from "../moves/attack.mjs";

const canMoveTo = (piece, toRow, toColumn) => {
    if (!cells[toRow][toColumn]) {
        if (!checkAfterMove({piece, toRow, toColumn})) return true;
    } else {
        let killPiece = pieces[cells[toRow][toColumn]];
        if (killPiece.color === gameState.oppositeColor) {
            if (!checkAfterMove({piece, toRow, toColumn, killPiece}))
                return true;
        }
    }
};

const moveExist = {
    rook: (piece) => {
        if (piece.column > 0) {
            if (canMoveTo(piece, piece.row, piece.column - 1)) {
                return true;
            }
        }
        if (piece.column < 7) {
            if (canMoveTo(piece, piece.row, piece.column + 1)) {
                return true;
            }
        }
        if (piece.row > 0) {
            if (canMoveTo(piece, piece.row - 1, piece.column)) {
                return true;
            }
        }
        if (piece.row < 7) {
            if (canMoveTo(piece, piece.row + 1, piece.column)) {
                return true;
            }
        }
    },
    bishop: (piece) => {
        if (piece.column > 0 && piece.row > 0) {
            if (canMoveTo(piece, piece.row - 1, piece.column - 1)) {
                return true;
            }
        }
        if (piece.column < 7 && piece.row > 0) {
            if (canMoveTo(piece, piece.row - 1, piece.column + 1)) {
                return true;
            }
        }
        if (piece.column > 0 && piece.row < 7) {
            if (canMoveTo(piece, piece.row + 1, piece.column - 1)) {
                return true;
            }
        }

        if (piece.column < 7 && piece.row < 7) {
            if (canMoveTo(piece, piece.row + 1, piece.column + 1)) {
                return true;
            }
        }
    },
    pawn: (piece) => {
        if (!cells[piece.row - 1][piece.column] && !checkAfterMove(
            {piece, toRow: piece.row -1, toColumn: piece.column}))
            return true;
        let killPiece;
        if (piece.column > 0) {
            const CellsMinus1Element = cells[piece.row - 1][piece.column - 1];
            if (CellsMinus1Element) {
                killPiece = pieces[CellsMinus1Element];
                if (killPiece.color === gameState.oppositeColor && !checkAfterMove(
                    {piece, toRow: piece.row -1, 
                        toColumn: piece.column -1, killPiece})) return true;
            }
        }

        if (piece.column < 7) {
            const CellsPlus1Element = cells[piece.row - 1][piece.column + 1];
            if (CellsPlus1Element) {
                killPiece = pieces[CellsPlus1Element];
                if (killPiece.color === gameState.oppositeColor && !checkAfterMove({
                    piece, killPiece,
                    toRow: piece.row -1,
                    toColumn: piece.column +1,
                    })) return true;
            }
        }
        if (gameState.passant.id) {
            if (piece.canMove(2, gameState.passant.column, "passant")) {
                changeVar(false, "moveOnPassantExist");
                return true;
            }
        }
    },
    knight: (piece) => {
        if (piece.column > 0) {
            if (piece.row > 1) if (canMoveTo(piece, piece.row - 2, piece.column - 1)) return true;
            if (piece.row < 6) if (canMoveTo(piece, piece.row + 2, piece.column - 1)) return true;
            if (piece.column > 1) {
                if (piece.row > 0) if (canMoveTo(piece, piece.row - 1, piece.column - 2)) return true;
                if (piece.row < 7) if (canMoveTo(piece, piece.row + 1, piece.column - 2)) return true;
            }
        }
        if (piece.column < 7) {
            if (piece.row > 1) if (canMoveTo(piece, piece.row - 2, piece.column + 1)) return true;
            if (piece.row < 6) if (canMoveTo(piece, piece.row + 2, piece.column + 1)) return true;
            if (piece.column < 6) {
                if (piece.row > 0) if (canMoveTo(piece, piece.row - 1, piece.column + 2)) return true;
                if (piece.row < 7) if (canMoveTo(piece, piece.row + 1, piece.column + 2)) return true;
            }
        }
    },
    queen: (piece) => {
        if (moveExist.rook(piece, piece.column, piece.row)) return true;
        if (moveExist.bishop(piece, piece.column, piece.row)) return true;
    },

    king: (piece) => {
        if (moveExist.rook(piece, piece.column, piece.row)) return true;
        if (moveExist.bishop(piece, piece.column, piece.row)) return true;
    },
};

const stalemate = () => {
    for (const piece of pieces) {
        if (piece && piece.color === gameState.color && moveExist[piece.type](piece)) return;
    }
    return "stalemate";
};

export {stalemate};
