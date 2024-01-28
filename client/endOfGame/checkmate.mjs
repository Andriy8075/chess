import {changeVar, gameState} from "../data.mjs";
import {attack, checkAfterMove} from "../moves/check.mjs";
import {cells, pieces} from "../arrangePieces/arrangePieces.mjs";
//import {stalemate} from "./stalemate.mjs";

const checkmate = (attackingPiece) => {
    const king = pieces[gameState.kingID];
    //const attackingPiece = attack(gameState.color, gameState.kingRow, gameState.kingColumn, null);
    //if (!attackingPiece) return stalemate(); else {
        //check for checkmate
    for (let row = gameState.kingRow - 1; row <= gameState.kingRow + 1; row++) {
        if (row >= 0 && row < 8) {
            for (let column = gameState.kingColumn - 1; column <= gameState.kingColumn + 1; column++) {
                if (column >= 0 && column < 8) {
                    if (row === gameState.kingRow && column === gameState.kingColumn) continue;
                    if (!cells[row][column] && !checkAfterMove(king, row, column, null)) return;
                    const enemyPiece = pieces[cells[row][column]];
                    if (enemyPiece && enemyPiece.color === gameState.oppositeColor && !checkAfterMove(king, row, column, enemyPiece)) {
                        return;
                    }
                }
            }
        }
    }
    const secondPieceThatMakeCheck = attack(gameState.color, gameState.kingRow, gameState.kingColumn, [attackingPiece], "makeCheck",);
    if (secondPieceThatMakeCheck) {
        return "checkmate";
    }
    let ignoringPieces = [king];
    const killAttackingPiece = (i) => {
        const savingPiece = attack(gameState.oppositeColor, attackingPiece.row, attackingPiece.column, ignoringPieces, "killPiece", i,);
        if (savingPiece) {
            if (gameState.moveOnPassantExist) {
                changeVar(false, "moveOnPassantExist");
                return true;
            }
            if (checkAfterMove(savingPiece, attackingPiece.row, attackingPiece.column, attackingPiece,)) {
                return killAttackingPiece(savingPiece.id + 1);
            }
            ignoringPieces = [king];
            return true;
        }
        ignoringPieces = [king];
    };
    const hideKing = (cellRow, cellColumn, i) => {
        const savingPiece = attack(gameState.oppositeColor, cellRow, cellColumn, ignoringPieces, "hideKing", i,);
        if (savingPiece) {
            if (gameState.moveOnPassantExist) return true;
            if (checkAfterMove(savingPiece, cellRow, cellColumn)) {
                return hideKing(cellRow, cellColumn, savingPiece.id + 1);
            }
            ignoringPieces = [king];
            return true;
        }
        ignoringPieces = [king];
    };
    if (!killAttackingPiece()) {
        ignoringPieces = [king];
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
                    for (let currentCellColumn = gameState.kingColumn - 1; currentCellColumn > attackingPiece.column; currentCellColumn--) {
                        if (hideKing(gameState.kingRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                } else {
                    for (let currentCellColumn = gameState.kingColumn + 1; currentCellColumn < attackingPiece.column; currentCellColumn++) {
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
                    for (let currentCellRow = gameState.kingRow - 1; currentCellRow > attackingPiece.row; currentCellRow--, currentCellColumn--) {
                        if (hideKing(currentCellRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                } else {
                    let currentCellColumn = gameState.kingColumn + 1;
                    for (let currentCellRow = gameState.kingRow - 1; currentCellRow > attackingPiece.row; currentCellRow--, currentCellColumn++) {
                        if (hideKing(currentCellRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                }
            } else {
                if (attackingPiece.column < gameState.kingColumn) {
                    let currentCellColumn = gameState.kingColumn - 1;
                    for (let currentCellRow = gameState.kingRow + 1; currentCellRow < attackingPiece.row; currentCellRow++, currentCellColumn--) {
                        if (hideKing(currentCellRow, currentCellColumn)) {
                            return;
                        }
                    }
                    return "checkmate";
                } else {
                    let currentCellColumn = gameState.kingColumn + 1;
                    for (let currentCellRow = gameState.kingRow + 1; currentCellRow < attackingPiece.row; currentCellRow++, currentCellColumn++) {
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
//};

export {checkmate};
