import {changeVar, gameState} from "../dataAndFunctions.mjs";
import {attack, checkAfterMove} from "../moves/attack.mjs";
import {cells, pieces} from "../arrangePieces/arrangePieces.mjs";
//import {stalemate} from "./stalemate.mjs";

const checkmate = (attackingPiece) => {
    const king = pieces[gameState.kingID];
    for (let row = gameState.kingRow - 1; row <= gameState.kingRow + 1; row++) {
        if (row >= 0 && row < 8) {
            for (let column = gameState.kingColumn - 1; column <= gameState.kingColumn + 1; column++) {
                if (column >= 0 && column < 8) {
                    if (row === gameState.kingRow && column === gameState.kingColumn) continue;
                    if (!cells[row][column] && !checkAfterMove({
                        piece: king, toRow: row, toColumn: column})) return;
                    const killingPiece = pieces[cells[row][column]];
                    if (killingPiece && killingPiece.color === gameState.oppositeColor && !checkAfterMove(
                        {piece: king, toRow: row, toColumn: column, killingPiece})) {
                        return;
                    }
                }
            }
        }
    }
    const secondPieceThatMakeCheck = attack({
        color: gameState.color,
        toRow: gameState.kingRow,
        toColumn: gameState.kingColumn,
        ignorePieces: [attackingPiece]
    });
    if (secondPieceThatMakeCheck) {
        return "checkmate";
    }
    let ignorePieces = [king];
    const killAttackingPiece = (i) => {
        const savingPiece = attack({
            color: gameState.oppositeColor,
            toRow: attackingPiece.row,
            toColumn: attackingPiece.column,
            ignoringPieces: ignorePieces,
            moveType: "killPiece",
            firstPieceId: i
        });
        if (savingPiece) {
            if (gameState.moveOnPassantExist) {
                changeVar(false, "moveOnPassantExist");
                return true;
            }
            if (checkAfterMove({
                piece: savingPiece,
                toRow: attackingPiece.row,
                toColumn: attackingPiece.column,
                killingPiece: attackingPiece})) {
                return killAttackingPiece(savingPiece.id + 1);
            }
            ignorePieces = [king];
            return true;
        }
        ignorePieces = [king];
    };
    const hideKing = (toRow, toColumn, i) => {
        const savingPiece = attack({
            color: gameState.oppositeColor,
            toRow, toColumn,
            ignoringPieces: ignorePieces,
            moveType: "hideKing",
            firstPieceId: i});
        if (savingPiece) {
            if (gameState.moveOnPassantExist) return true;
            if (checkAfterMove({piece: savingPiece, toRow, toColumn})) {
                return hideKing(toRow, toColumn, savingPiece.id + 1);
            }
            ignorePieces = [king];
            return true;
        }
        ignorePieces = [king];
    };
    if (!killAttackingPiece()) {
        ignorePieces = [king];
        if (attackingPiece.type === "pawn" || attackingPiece.type === "knight") return "checkmate";
        const checkFromRook = () => {
            if (attackingPiece.column === gameState.kingColumn) {
                if (attackingPiece.row < gameState.kingRow) {
                    for (let currentCellRow = gameState.kingRow - 1; currentCellRow > attackingPiece.row; currentCellRow--) {
                        if (hideKing(currentCellRow, gameState.kingColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                } else {
                    for (let currentCellRow = gameState.kingRow + 1; currentCellRow < attackingPiece.row; currentCellRow++) {
                        if (hideKing(currentCellRow, gameState.kingColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                }
            } else {
                if (attackingPiece.column < gameState.kingColumn) {
                    for (let currentCellColumn = gameState.kingColumn - 1;
                         currentCellColumn > attackingPiece.column; currentCellColumn--) {
                        if (hideKing(gameState.kingRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                } else {
                    for (let currentCellColumn = gameState.kingColumn + 1; currentCellColumn < attackingPiece.column;
                         currentCellColumn++) {
                        if (hideKing(gameState.kingRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                }
            }
        };
        const checkFromBishop = () => {
            if (attackingPiece.row < gameState.kingRow) {
                if (attackingPiece.column < gameState.kingColumn) {
                    let currentCellColumn = gameState.kingColumn - 1;
                    for (let currentCellRow = gameState.kingRow - 1; currentCellRow > attackingPiece.row;
                         currentCellRow--, currentCellColumn--) {
                        if (hideKing(currentCellRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                } else {
                    let currentCellColumn = gameState.kingColumn + 1;
                    for (let currentCellRow = gameState.kingRow - 1; currentCellRow > attackingPiece.row;
                         currentCellRow--, currentCellColumn++) {
                        if (hideKing(currentCellRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                }
            } else {
                if (attackingPiece.column < gameState.kingColumn) {
                    let currentCellColumn = gameState.kingColumn - 1;
                    for (let currentCellRow = gameState.kingRow + 1; currentCellRow < attackingPiece.row;
                         currentCellRow++, currentCellColumn--) {
                        if (hideKing(currentCellRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                } else {
                    let currentCellColumn = gameState.kingColumn + 1;
                    for (let currentCellRow = gameState.kingRow + 1; currentCellRow < attackingPiece.row;
                         currentCellRow++, currentCellColumn++) {
                        if (hideKing(currentCellRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                }
            }
        };

        if (attackingPiece.type === "rook") {
            return checkFromRook();
        }
        if (attackingPiece.type === "bishop") {
            return checkFromBishop();
        }
        if (attackingPiece.type === "queen") {
            if (attackingPiece.column === gameState.kingColumn || attackingPiece.row === gameState.kingRow) {
                return checkFromRook();
            } else return checkFromBishop();
        }
    }
}

export {checkmate};
