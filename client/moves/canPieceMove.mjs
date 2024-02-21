import {cells, changeCell, changePiecesArray, pieces,} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, gameState,} from "../data.mjs";
import {attack, checkAfterMove} from "./check.mjs";
import {move} from "./move.mjs";

const canPieceMove = {
    pawn: (fromRow, fromColumn, toRow, toColumn, moveType) => {
        const columnDifference = toColumn - fromColumn;
        const moveTypes = {
            makeCheck: () => {
                if (fromRow - toRow === -1 && (columnDifference === 1 || columnDifference === -1))
                        return true
            }, killPiece: () => {
                if (fromRow - toRow === 1 && (columnDifference === 1 || columnDifference === -1) && cells[toRow][toColumn]) {
                    const killingPiece = pieces[cells[toRow][toColumn]];
                    if (!checkAfterMove(killingPiece, toRow, toColumn, killingPiece, "makeCheck",)) return true;
                } else {
                    return canPieceMove.pawn(fromRow, fromColumn, toRow, toColumn, "passant",);
                }
            }, passant: () => {
                if (toRow === 3) toRow = 2;
                if (gameState.passant.id && gameState.passant.column === toColumn && fromRow === 3 && toRow === 2 &&
                    (columnDifference === 1 || columnDifference === -1)) {
                    const ourPiece = pieces[cells[fromRow][fromColumn]];
                    const PieceToKill = pieces[cells[fromRow][gameState.passant.column]];
                    changePiecesArray(PieceToKill.id, null);
                    changeCell(PieceToKill.row, PieceToKill.column, null);
                    const result = checkAfterMove(ourPiece, toRow, toColumn, null);
                    changePiecesArray(PieceToKill.id, PieceToKill);
                    changeCell(PieceToKill.row, PieceToKill.column, PieceToKill.id);
                    if (!result) {
                        changeVar(true, "moveOnPassantExist");
                        return true;
                    }
                }
            }, hideKing: () => {
                const rowDifference = fromRow - toRow;
                if (fromColumn === toColumn) {
                    if (rowDifference === 1) return true;
                    if (toRow === 4 && fromRow === 6 && !cells[5][fromColumn]) return true;
                } else {
                    return canPieceMove.pawn(fromRow, fromColumn, toRow, toColumn, "passant",);
                }
            },
        };
        return moveTypes[moveType]();
    },

    knight: (fromRow, fromColumn, toRow, toColumn) => {
        const rowDifference = toRow - fromRow;
        const columnDifference = toColumn - fromColumn;
        if (rowDifference === 1 || rowDifference === -1) {
            if (columnDifference === 2 || columnDifference === -2) {
                return true;
            }
        }
        if (columnDifference === 1 || columnDifference === -1) {
            if (rowDifference === 2 || rowDifference === -2) {
                return true;
            }
        }
    },

    bishop: (fromRow, fromColumn, toRow, toColumn) => {
        const rowDifference = toRow - fromRow;
        const columnDifference = toColumn - fromColumn;
        if (rowDifference === columnDifference) {
            if (rowDifference > 0) {
                let column = fromColumn + 1;
                for (let row = fromRow + 1; row < toRow; row++, column++) {
                    if (!cells[row][column]) continue; else return;
                }
                return true;
            } else {
                let column = fromColumn - 1;
                for (let row = fromRow - 1; row > toRow; row--, column--) {
                    if (!cells[row][column]) continue; else return;
                }
                return true;
            }
        }
        if (rowDifference === -columnDifference) {
            if (rowDifference > 0) {
                let column = fromColumn - 1;
                for (let row = fromRow + 1; row < toRow; row++, column--) {
                    if (!cells[row][column]) continue; else return;
                }
                return true;
            } else {
                let column = fromColumn + 1;
                for (let row = fromRow - 1; row > toRow; row--, column++) {
                    if (!cells[row][column]) continue; else return;
                }
                return true;
            }
        }
    },

    rook: (fromRow, fromColumn, toRow, toColumn) => {
        if (fromColumn === toColumn) {
            if (toRow > fromRow) {
                for (let row = fromRow + 1; row < toRow; row++) {
                    if (cells[row][toColumn]) return;
                }
                return true;
            } else {
                for (let row = fromRow - 1; row > toRow; row--) {
                    if (cells[row][toColumn]) return;
                }
                return true;
            }
        }
        if (fromRow === toRow) {
            if (toColumn > fromColumn) {
                for (let column = fromColumn + 1; column < toColumn; column++) {
                    if (cells[toRow][column]) return;
                }
                return true;
            } else {
                for (let column = fromColumn - 1; column > toColumn; column--) {
                    if (cells[toRow][column]) return;
                }
                return true;
            }
        }
    },

    queen: function (fromRow, fromColumn, toRow, toColumn) {
        const rook = this.rook(toRow, toColumn, fromRow, fromColumn);
        if (rook) return true;
        const bishop = this.bishop(toRow, toColumn, fromRow, fromColumn);
        if (bishop) return true;
    },

    king: (fromRow, fromColumn, toRow, toColumn, moveType) => {
        const rowDifference = toRow - fromRow;
        const columnDifference = toColumn - fromColumn;
        if (moveType === "killPiece" || moveType === "hideKing") moveType = "makeCheck";
        const moveTypes = {
            makeCheck: () => {
                if (rowDifference < 2 && rowDifference > -2 && columnDifference < 2 && columnDifference > -2) {
                    return true;
                }
            }, withCastling: () => {
                const piece = pieces[cells[fromRow][fromColumn]];
                if (rowDifference < 2 && rowDifference > -2 && columnDifference < 2 && columnDifference > -2) {
                    return true;
                } else {
                    if (toRow === 7 && piece.row === 7) {
                        let rookID;
                        if (columnDifference === -2) {
                            if (gameState.canCastling.leftRook && gameState.canCastling.king) {
                                for (let i = 0; i <= gameState.kingColumn; i++) {
                                    if (attack(gameState.color, 7, i)) return;
                                }
                                for (let i = 1; i <= gameState.kingColumn - 1; i++) {
                                    if (cells[7][i]) return;
                                }
                                if (gameState.color === "white") {
                                    rookID = 25;
                                } else {
                                    rookID = 8;
                                }
                                const rook = pieces[rookID];
                                move(rook, 7, gameState.kingColumn - 1, null, true);
                                return true;
                            }
                        }
                        if (columnDifference === 2) {
                            if (gameState.canCastling.rightRook && gameState.canCastling.king) {
                                for (let i = gameState.kingColumn; i <= 7; i++) {
                                    if (attack(gameState.color, 7, i)) return;
                                }
                                for (let i = gameState.kingColumn + 1; i <= 6; i++) {
                                    if (cells[7][i]) return;
                                }
                                if (gameState.color === "white") {
                                    rookID = 32;
                                } else {
                                    rookID = 1;
                                }
                                const rook = pieces[rookID];
                                move(rook, 7, gameState.kingColumn + 1, null, true);
                                return true;
                            }
                        }
                    }
                }
            },
        };
        return moveTypes[moveType]();
    },
};

export {canPieceMove};
