import {vars, passant} from './data.js';
import {checkAfterMove, attack} from './moves.js';
import {cells, changeCell, pieces, changePieceCell} from './arrangePieces.js';
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
            if(passant.id) {
                let columnRighterOrLefter = 1;
                const save = (columnRighterOrLefter) => {
                    if(cells[3][passant.id+columnRighterOrLefter]) {
                        const savingPiece = pieces[cells[3][passant.id+columnRighterOrLefter]];
                        if(savingPiece.type === 'Pawn' && savingPiece.color === vars.color) {
                            const PieceThatKillsOnPassant = pieces[cells[3][passant.column]];
                            changeCell(PieceThatKillsOnPassant.row, toColumn, null);
                            changePieceCell(passant.id, null);
                            if (!checkAfterMove(savingPiece, toRow, toColumn, null)) return true;
                        }
                    }
                }
                if (save(columnRighterOrLefter)) return;
                columnRighterOrLefter = -1;
                if (save(columnRighterOrLefter)) return;
                return 'checkmate';
            }
        }
        let savingPieces = [king];
        const saveForPiece = () => {
            const savingPiece = attack(vars.oppositeColor,
                attackingPiece.row, attackingPiece.column, savingPieces, 'killPiece');
            if(savingPiece) {
                if(savingPiece.type === 'Pawn' && passant.id === attackingPiece.id && savingPiece.row === 3) {
                    const columnDifference = savingPiece.column - passant.column;
                    if(columnDifference === 1 || columnDifference === -1) return;
                }
                const savingPiecePreviousColumn = savingPiece.column;
                const savingPiecePreviousRow = savingPiece.row;
                savingPiece.column = attackingPiece.column;
                savingPiece.row = attackingPiece.row;
                changeCell(attackingPiece.row, attackingPiece.column, savingPiece.id);
                changeCell(savingPiecePreviousRow, savingPiecePreviousColumn, null);
                const saveAttackingPiece = attackingPiece;
                changePieceCell(attackingPiece.id, null);
                const isAttackAfterMove = attack(vars.color, vars.kingRow, vars.kingColumn, null, 'makeCheck');
                savingPiece.column = savingPiecePreviousColumn;
                savingPiece.row = savingPiecePreviousRow;
                changeCell(savingPiecePreviousRow, savingPiecePreviousColumn, savingPiece.id);
                changeCell(saveAttackingPiece.row, saveAttackingPiece.column, saveAttackingPiece.id);
                changePieceCell(saveAttackingPiece.id, saveAttackingPiece);
                if(isAttackAfterMove) {
                    savingPieces.push(savingPiece);
                    return saveForPiece();
                }
                savingPieces = [king];
                return 'can kill piece';
            } 
            savingPieces = [king];
            return 'cannot kill piece';
        }
        const saveForCell = (cellRow, cellColumn) => {
            const savingPiece = attack(vars.oppositeColor, cellRow, cellColumn, savingPieces, 'hideKing');
            if(savingPiece) {
                const savingPiecePreviousColumn = savingPiece.column;
                const savingPiecePreviousRow = savingPiece.row;
                savingPiece.column = cellColumn;
                savingPiece.row = cellRow;
                changeCell(cellRow, cellColumn, savingPiece.id);
                changeCell(savingPiecePreviousRow, savingPiecePreviousColumn, null);
                const isAttackAfterMove = attack(vars.color, vars.kingRow, vars.kingColumn, null, 'makeCheck')
                savingPiece.column = savingPiecePreviousColumn;
                savingPiece.row = savingPiecePreviousRow;
                changeCell(savingPiecePreviousRow, savingPiecePreviousColumn, savingPiece.id);
                changeCell(cellRow, cellColumn, null);
                if(isAttackAfterMove ) {
                    savingPieces.push(savingPiece);
                    return saveForCell();
                }
                savingPieces = [king];
                return 'can kill piece';
            } 
            savingPieces = [king];
            return 'cannot kill piece';
        }
        if (saveForPiece() === 'cannot kill piece') {
            savingPieces = [king];
            if (attackingPiece.type === 'Pawn' ||
                attackingPiece.type === 'Knight') return 'checkmate';
            const checkFromRook = () => {
                if (attackingPiece.column === vars.kingColumn) {
                    if (attackingPiece.row < vars.kingRow) {
                        for (let currentCellRow = vars.kingRow - 1; currentCellRow > attackingPiece.row;
                             currentCellRow--) {
                            if (saveForCell(currentCellRow, vars.kingColumn) === 'can kill piece') {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        for (let currentCellRow = vars.kingRow + 1; currentCellRow < attackingPiece.row;
                             currentCellRow++) {
                            if (saveForCell(currentCellRow, vars.kingColumn) === 'can kill piece') {
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
                            if (saveForCell(vars.kingRow, currentCellColumn) === 'can kill piece') {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        for (let currentCellColumn = vars.kingColumn + 1; currentCellColumn < attackingPiece.column;
                             currentCellColumn++) {
                            if (saveForCell(vars.kingRow, currentCellColumn) === 'can kill piece') {
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
                            if (saveForCell(currentCellRow, currentCellColumn) === 'can kill piece') {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        let currentCellColumn = vars.kingColumn + 1;
                        for (let currentCellRow = vars.kingRow - 1; currentCellRow > attackingPiece.row;
                             currentCellRow--, currentCellColumn++) {
                            if (saveForCell(currentCellRow, currentCellColumn) === 'can kill piece') {
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
                            if (saveForCell(currentCellRow, currentCellColumn) === 'can kill piece') {
                                return;
                            }
                        }
                        return 'checkmate';
                    } else {
                        let currentCellColumn = vars.kingColumn + 1;
                        for (let currentCellRow = vars.kingRow + 1; currentCellRow < attackingPiece.row;
                             currentCellRow++, currentCellColumn++) {
                            if (saveForCell(currentCellRow, currentCellColumn) === 'can kill piece') {
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