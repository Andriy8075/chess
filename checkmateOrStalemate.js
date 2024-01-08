import {vars} from './data.js';
import {checkAfterMove, attack} from './moves.js';
import {cells, pieces} from './arrangePieces.js';
import { movesExist } from './movesExist.js';


const checkmateOrStalemate = () => {

    const king = pieces[vars.kingID];
    const attackingPiece = attack(vars.color,vars.kingRow, vars.kingColumn, null, 'makeCheck');
    if (attackingPiece) {
        for (let row = vars.kingRow - 1; row <= vars.kingRow + 1; row++) {
            if (row >= 0 && row < 8) {
                for (let column = vars.kingColumn - 1; column <= vars.kingColumn + 1; column++) {
                    if (column >= 0 && column < 8) {
                        if (row === vars.kingRow && column === vars.kingColumn) continue;
                        if (!cells[row][column] &&
                            (!checkAfterMove(king, row, column, null))) return;
                        const enemyPiece = pieces[cells[row][column]];    
                        if (enemyPiece && enemyPiece.color === vars.oppositeColor && 
                            !checkAfterMove(king, row, column, enemyPiece)){
                                return;
                        }
                    }
                }
            }
        }
        const secondPieceThatMakeCheck = attack(vars.color, vars.kingRow, vars.kingColumn,
            [attackingPiece], 'makeCheck');
        if (secondPieceThatMakeCheck) {
            return 'checkmate';
        }
        let ignoringPieces = [king];
        const killAttackingPiece = (i) => {
            const savingPiece = attack(vars.oppositeColor,
                attackingPiece.row, attackingPiece.column, ignoringPieces, 'killPiece', i);
            if(savingPiece) {
                if(vars.moveOnPassantExist) return;
                if(checkAfterMove(savingPiece, attackingPiece.row, attackingPiece.column, attackingPiece)) {
                    return killAttackingPiece(savingPiece.id+1);
                }
                ignoringPieces = [king];
                return true;
            } 
            ignoringPieces = [king];
        }
        const hideKing = (cellRow, cellColumn, i) => {
            const savingPiece = attack(vars.oppositeColor, cellRow, cellColumn,
                ignoringPieces, 'hideKing', i);
            if(savingPiece) {
                if(vars.moveOnPassantExist) return true;
                if(checkAfterMove(savingPiece, cellRow, cellColumn)) {
                    return hideKing(cellRow, cellColumn, savingPiece.id+1);
                }
                ignoringPieces = [king];
                return true;
            } 
            ignoringPieces = [king];
        }
        if (!killAttackingPiece()) {
            ignoringPieces = [king];
            if (attackingPiece.type === 'Pawn' ||
                attackingPiece.type === 'Knight') return 'checkmate';
            const checkFromRook = () => {
                if (attackingPiece.column === vars.kingColumn) {
                    if (attackingPiece.row < vars.kingRow) {
                        for (let currentCellRow = vars.kingRow - 1; currentCellRow > attackingPiece.row;
                             currentCellRow--) {
                            if (hideKing(currentCellRow, vars.kingColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        for (let currentCellRow = vars.kingRow + 1; currentCellRow < attackingPiece.row;
                             currentCellRow++) {
                            if (hideKing(currentCellRow, vars.kingColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    }
                } else {
                    if (attackingPiece.column < vars.kingColumn) {
                        for (let currentCellColumn = vars.kingColumn - 1;
                             currentCellColumn > attackingPiece.column;
                             currentCellColumn--) {
                            if (hideKing(vars.kingRow, currentCellColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        for (let currentCellColumn = vars.kingColumn + 1; currentCellColumn < attackingPiece.column;
                             currentCellColumn++) {
                            if (hideKing(vars.kingRow, currentCellColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    }
                }
            }
            const checkFromBishop = () => {
                if (attackingPiece.row < vars.kingRow) {
                    if (attackingPiece.column < vars.kingColumn) {
                        let currentCellColumn = vars.kingColumn - 1;
                        for (let currentCellRow = vars.kingRow - 1; currentCellRow > attackingPiece.row;
                             currentCellRow--, currentCellColumn--) {
                            if (hideKing(currentCellRow, currentCellColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        let currentCellColumn = vars.kingColumn + 1;
                        for (let currentCellRow = vars.kingRow - 1; currentCellRow > attackingPiece.row;
                             currentCellRow--, currentCellColumn++) {
                            if (hideKing(currentCellRow, currentCellColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    }
                } else {
                    if (attackingPiece.column < vars.kingColumn) {
                        let currentCellColumn = vars.kingColumn - 1;
                        for (let currentCellRow = vars.kingRow + 1; currentCellRow < attackingPiece.row;
                             currentCellRow++, currentCellColumn--) {
                            if (hideKing(currentCellRow, currentCellColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        let currentCellColumn = vars.kingColumn + 1;
                        for (let currentCellRow = vars.kingRow + 1; currentCellRow < attackingPiece.row;
                             currentCellRow++, currentCellColumn++) {
                            if (hideKing(currentCellRow, currentCellColumn)) {
                                return;
                            }
                        }
                        return 'checkmate';
                    }
                }
            }

            if (attackingPiece.type === 'Rook') {
                return checkFromRook();
            }
            if (attackingPiece.type === 'Bishop') {
                return checkFromBishop();
            }
            if (attackingPiece.type === 'Queen') {
                if (attackingPiece.column === vars.kingColumn ||
                    attackingPiece.row === vars.kingRow) {
                    return checkFromRook();
                } else return checkFromBishop();
            }
        }
    } else {
        
        for (const Piece of pieces) {
            if (Piece && Piece.color === vars.color && movesExist[Piece.type](Piece, Piece.column, Piece.row)) return;
         }
        return 'stalemate';
    }
}

export {checkmateOrStalemate};