import {changeVar, passant, vars} from "../data.js";
import {cells, pieces} from "../arrangePieces/arrangePieces.js";
import {checkAfterMove} from "../moves/check.js";

const canMoveTo = (Piece, rowMoveTo, columnMoveTo) => {
    if (!cells[rowMoveTo][columnMoveTo]) {
        if (!checkAfterMove(Piece, rowMoveTo, columnMoveTo, null)) {
            return true;
        }
    } else {
        let enemyPiece = pieces[cells[rowMoveTo][columnMoveTo]];
        if (enemyPiece.color === vars.oppositeColor) {
            if (!checkAfterMove(Piece, rowMoveTo, columnMoveTo, enemyPiece)) return true;
        }
    }
};

const moveExist = {
    Rook: (piece, column, row) => {
        if (column > 0) {
            if (canMoveTo(piece, row, column - 1)) {
                return true;
            }
        }
        if (column < 7) {
            if (canMoveTo(piece, row, column + 1)) {
                return true;
            }
        }
        if (row > 0) {
            if (canMoveTo(piece, row - 1, column)) {
                return true;
            }
        }
        if (row < 7) {
            if (canMoveTo(piece, row + 1, column)) {
                return true;
            }
        }
    }, Bishop: (piece, column, row) => {
        if (column > 0 && row > 0) {
            if (canMoveTo(piece, row - 1, column - 1)) {
                return true;
            }
        }
        if (column < 7 && row > 0) {
            if (canMoveTo(piece, row - 1, column + 1)) {
                return true;
            }
        }
        if (column > 0 && row < 7) {
            if (canMoveTo(piece, row + 1, column - 1)) {
                return true;
            }
        }

        if (column < 7 && row < 7) {
            if (canMoveTo(piece, row + 1, column + 1)) {
                return true;
            }
        }
    }, Pawn: (piece, column, row) => {
        if (!cells[row - 1][column] && !checkAfterMove(piece, row - 1, column, null)) return true;
        let enemyPiece;
        if (column > 0) {
            const CellsMinus1Element = cells[row - 1][column - 1];
            if (CellsMinus1Element) {
                enemyPiece = pieces[CellsMinus1Element];
                if (enemyPiece.color === vars.oppositeColor && !checkAfterMove(piece, row - 1, column - 1, enemyPiece)) return true;
            }
        }

        if (column < 7) {
            const CellsPlus1Element = cells[row - 1][column + 1];
            if (CellsPlus1Element) {
                enemyPiece = pieces[CellsPlus1Element];
                if (enemyPiece.color === vars.oppositeColor && !checkAfterMove(piece, row - 1, column + 1, enemyPiece)) return true;
            }
        }
        if (passant.id) {
            if (piece.canMove(2, passant.column, "passant")) {
                changeVar("moveOnPassantExist", false);
                return true;
            }
        }
    },

    Knight: (piece, column, row) => {
        if (column > 0) {
            if (row > 1) if (canMoveTo(piece, row - 2, column - 1)) return true;
            if (row < 6) if (canMoveTo(piece, row + 2, column - 1)) return true;
            if (column > 1) {
                if (row > 0) if (canMoveTo(piece, row - 1, column - 2)) return true;
                if (row < 7) if (canMoveTo(piece, row + 1, column - 2)) return true;
            }
        }
        if (column < 7) {
            if (row > 1) if (canMoveTo(piece, row - 2, column + 1)) return true;
            if (row < 6) if (canMoveTo(piece, row + 2, column + 1)) return true;
            if (column < 6) {
                if (row > 0) if (canMoveTo(piece, row - 1, column + 2)) return true;
                if (row < 7) if (canMoveTo(piece, row + 1, column + 2)) return true;
            }
        }
    },

    Queen: (piece, column, row) => {
        if (moveExist.Rook(piece, column, row)) return true;
        if (moveExist.Bishop(piece, column, row)) return true;
    },

    King: (piece, column, row) => {
        if (moveExist.Rook(piece, column, row)) return true;
        if (moveExist.Bishop(piece, column, row)) return true;
    },
};

const stalemate = () => {
    for (const Piece of pieces) {
        if (Piece && Piece.color === vars.color && moveExist[Piece.type](Piece, Piece.column, Piece.row)) return;
    }
    return "stalemate";
};

export {stalemate};