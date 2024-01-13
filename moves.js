import {
    socket,
    passant,
    piecesForCastlingNeverMoved,
    vars,
    pieceForCastlingMoved,
    changeVar,
} from './data.js';
import {cells, changeCell, pieces, changePiecesArray} from './arrangePieces.js';
import {writeDownPosition, clear} from './repeatingMoves.js';
const attack = (color, attackForRow, attackForColumn, ignorePieces, moveType, i = 1) => {
    if(!moveType) moveType = 'makeCheck';
    const countOfPieces = 32;
    for(i ; i <= countOfPieces; i++) {
        const currentPiece = pieces[i];
        if(!currentPiece) continue;
        if(currentPiece.color === color) {
            const startOfWhitePieces = 17
            if(i < startOfWhitePieces) {
                i = startOfWhitePieces-1;
                continue;
            }
            else break;
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
        if(currentPiece.canMove(attackForRow, attackForColumn, moveType)) return currentPiece;
    }
}
const kill = (id, dontSendPocket) => {
    if(pieces[id]){
        pieces[id].HTMLImage.remove()
        changePiecesArray(id, null);
        if(!dontSendPocket) {
            const pocket = {
                method: 'kill',
                pieceId: id,
                userId: vars.userId,
            }
            socket.send(JSON.stringify(pocket));
        }
    }
}

const checkAfterMove = (Piece, toRow, toColumn, killingPiece) => {
    const previousRow = Piece.row;
    const previousColumn = Piece.column;
    Piece.row = toRow;
    Piece.column = toColumn;
    changeCell(toRow, toColumn, Piece.id);
    changeCell(previousRow, previousColumn, null);
    const isItKing = Piece.type === 'King';
    if (isItKing) {
        changeVar('kingRow', toRow);
        changeVar('kingColumn', toColumn);
    }

    let result;
    if (killingPiece) {
        if (attack(vars.color, vars.kingRow, vars.kingColumn, [killingPiece])) {
            result = true;
        }
    }
    else {
        if (attack(vars.color, vars.kingRow, vars.kingColumn)) {
            result = true;
        }
    }
    if (isItKing) {
        changeVar('kingRow', previousRow);
        changeVar('kingColumn', previousColumn);
    }
    Piece.row = previousRow;
    Piece.column = previousColumn;
    changeCell(toRow, toColumn, killingPiece ? killingPiece.id : null);
    changeCell(previousRow, previousColumn, Piece.id);
    return result;
}

const doMove = (Piece, toRow, toColumn, opponentPiece, clearPosition, passant, dontSendPocket) => {
    changeCell(toRow, toColumn, Piece.id);
    changeCell(Piece.row, Piece.column, null);
    if (opponentPiece) {
        kill(opponentPiece.id, dontSendPocket);
        clearPosition = true;
    }

    Piece.row = toRow;
    Piece.column = toColumn;
    Piece.HTMLImage.style.top = `${vars.cellSize * toRow}em`;
    Piece.HTMLImage.style.left = `${vars.cellSize * toColumn}em`;
    Piece.HTMLImage.style.removeProperty("background-color");
    
    changeVar('movePossibility', false);
    changeVar('chosenPiece', null );
    changeVar('moveOnPassantExist', false);

    if(clearPosition) {
        clear();
    }
    else{
        writeDownPosition();
    }
    if(!dontSendPocket) {
        const pocket = {
            method: 'doMove',
            userId: vars.userId,
            pieceId: Piece.id,
            cellRow: 7 - toRow,
            cellColumn: 7 - toColumn,
            clear: clearPosition,
            passant: passant,
        }
        socket.send(JSON.stringify(pocket));
    }
};

const moves = {
    Pawn: (Piece, toRow, toColumn, opponentPiece) => {
        if (Piece.row !== 1) {
            const rowDifference = Piece.row - toRow;
            if ((toColumn === Piece.column) && (!opponentPiece)) {
                if (rowDifference === 1) {
                    if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                        doMove(Piece, toRow, toColumn, opponentPiece, true);
                        return;
                    }
                }
                if (Piece.row === 6 && toRow === 4 && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)
                && !cells[5][toColumn]) {
                    doMove(Piece, toRow, toColumn, opponentPiece, true, {
                        id: Piece.id,
                        column: 7 - toColumn,
                    });
                }
            }
            else {
                if(canPieceMove['Pawn'](Piece.row, Piece.column, toRow, toColumn, 'killPiece')) {
                    if(vars.moveOnPassantExist) {
                        changeVar('moveOnPassantExist', false);
                        const PieceThatKillsOnPassant = pieces[cells[3][passant.column]]
                        kill(PieceThatKillsOnPassant.id);
                        doMove(Piece, 2, toColumn, null, true);
                        changeCell(3, toColumn, null);
                        const pocket = {
                            method: 'clearArrayCellAfterPassant',
                            userId: vars.userId,
                            cellColumn: 7-toColumn,
                        }
                        socket.send(JSON.stringify(pocket));
                    }
                    else if(!checkAfterMove(Piece, toRow, toColumn, opponentPiece))
                        doMove(Piece, toRow, toColumn, opponentPiece, true);
                }
            }
            // else if (Piece.row - toRow === 1 && (toColumn - Piece.column === 1 || toColumn - Piece.column === -1)) {
            //     if (opponentPiece) {
            //         if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            //             doMove(Piece, toRow, toColumn, opponentPiece);
            //         }
            //     } else if ((Piece.row === 3) && (passant.column === toColumn)) {
            //         const PieceThatKillsOnPassant = pieces[cells[3][passant.column]]
            //         changePiecesArray(cells[3][passant.column], null);
            //         changeCell(Piece.row, toColumn, null);
            //         const check = checkAfterMove(Piece, toRow, toColumn, null);
            //         changePiecesArray(PieceThatKillsOnPassant.id, PieceThatKillsOnPassant);
            //         ownPieces(pieces[PieceToKill.id].HTMLImage, PieceToKill.id);
            //         changeCell(Piece.row, toColumn, PieceThatKillsOnPassant.id);
            //         if (!check) {
            //             kill(PieceThatKillsOnPassant.id);
            //             doMove(Piece, toRow, toColumn);
            //             changeCell(3, toColumn, null);
            //             const pocket = {
            //                 method: 'clearArrayCellAfterPassant',
            //                 userId: vars.userId,
            //                 cellColumn: 7-toColumn,
            //             }
            //             socket.send(JSON.stringify(pocket));
            //         }
            //     }
            // }
        }
        else {
            if (toColumn === Piece.column && !opponentPiece) {
                if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                    const backgroundImage = new Image(vars.cellSize, vars.cellSize);
                    const divBoard = document.getElementById('divBoard');
                    backgroundImage.style.color = '#d5cd7f';
                    backgroundImage.style.zIndex = '5';
                    backgroundImage.style.display = 'flex';
                    backgroundImage.style.position = 'absolute';
                    backgroundImage.setAttribute('id','backgroundImage');
                    backgroundImage.top = toRow;
                    backgroundImage.left = toColumn;
                    backgroundImage.style.top = `${vars.cellSize * toRow}em`;
                    backgroundImage.style.left = `${vars.cellSize * toColumn}em`;
                    divBoard.appendChild(backgroundImage);
                    changeVar('finishImageColumn', toColumn);
                    changeVar('finishImageRow', toRow);
                    const finishImages = document.getElementsByClassName(
                        `${vars.color}FinishImages`);
                    for (let image of finishImages) {
                        image.style.display = 'flex';
                    }
                }
            }
            if (((toColumn - Piece.column) === 1 || (toColumn - Piece.column) === -1) && opponentPiece) {
                if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                    pieces[cells[0][toColumn]].HTMLImage.style.backgroundColor = '#d5cd7f';
                    const finishImages = document.getElementsByClassName(`${vars.color}FinishImages`);
                    for (let image of finishImages) {
                        image.style.display = 'flex';
                    }
                }
            }
        }
    },

    Knight: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove['Knight'](Piece.row, Piece.column, toRow, toColumn) &&
            !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            doMove(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    Bishop: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove['Bishop'](Piece.row, Piece.column, toRow, toColumn) &&
            !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            doMove(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    Rook: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.Rook(Piece.row, Piece.column, toRow, toColumn) &&
            !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            if (Piece.column === 0) pieceForCastlingMoved('leftRook');
            if (Piece.column === 7) pieceForCastlingMoved('rightRook');
            doMove(Piece, toRow, toColumn, opponentPiece);
            return true;

        }
    },

    Queen: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.Rook(Piece.row, Piece.column, toRow, toColumn)) {
            if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                doMove(Piece, toRow, toColumn, opponentPiece);
            }
        }
        else if (canPieceMove.Bishop(Piece.row, Piece.column, toRow, toColumn) && 
        !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            doMove(Piece, toRow, toColumn, opponentPiece);
        }
    },

    King: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.King(Piece.row, Piece.column, toRow, toColumn, 'withCastling') &&
            !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            changeVar('kingRow', toRow);
            changeVar('kingColumn', toColumn);
            doMove(Piece, toRow, toColumn, opponentPiece);
            pieceForCastlingMoved('king');
        }
    },
}

const canPieceMove = {
    Pawn: (fromRow, fromColumn, toRow, toColumn, moveType) => {
        const columnDifference = toColumn - fromColumn;
        const moveTypes = {
            makeCheck: () => {
                if (fromRow - toRow === -1) {
                    if (columnDifference === 1 || columnDifference === -1) {
                        return true;
                    }
                }
            },
            killPiece: () => {
                if (fromRow - toRow === 1 && (columnDifference === 1 || columnDifference === -1) &&
                    cells[toRow][toColumn]) {
                    const piece = pieces[cells[toRow][toColumn]];
                    if(!checkAfterMove(piece, toRow, toColumn, 'makeCheck')) return true;
                }
                else {
                    return canPieceMove['Pawn'](fromRow, fromColumn, toRow, toColumn, 'passant');
                }
            },
            passant: () => {
                if(toRow === 3) toRow = 2;
                if (passant.id && passant.column === toColumn && (fromRow === 3 &&  toRow === 2) &&
                    (columnDifference === 1 || columnDifference === -1)) {
                    const ourPiece = pieces[cells[fromRow][fromColumn]];
                    const PieceToKill = pieces[cells[fromRow][passant.column]];
                    changePiecesArray(PieceToKill.id, null);
                    changeCell(PieceToKill.row, PieceToKill.column, null);
                    const result = checkAfterMove(ourPiece, toRow, toColumn, null);
                    changePiecesArray(PieceToKill.id, PieceToKill);
                    changeCell(PieceToKill.row, PieceToKill.column, PieceToKill.id);
                    if(!result){
                        changeVar('moveOnPassantExist', true);
                        return true;
                    }
                }
            },
            hideKing: () => {
                const rowDifference = fromRow - toRow;
                if (fromColumn === toColumn) {
                    if (rowDifference === 1) return true;
                    if (toRow === 4 && fromRow === 6 && !cells[5][fromColumn]) return true;
                }
                else {
                    return canPieceMove['Pawn'](fromRow, fromColumn, toRow, toColumn, 'passant');
                }
            }
        }
        return moveTypes[moveType]();
        // switch (moveType) {
        //     case 'makeCheck':
        //         if (fromRow - toRow === -1) {
        //             if (columnDifference === 1 || columnDifference === -1) {
        //                 return true;
        //             }
        //         }
        //         break;
        //     case 'killPiece':
        //         if (fromRow - toRow === 1 && (columnDifference === 1 || columnDifference === -1) &&
        //         cells[toRow][toColumn]) {
        //             const piece = pieces[toRow][toColumn];
        //             if(!checkAfterMove(piece, toRow, toColumn, 'makeCheck')) return true;
        //         }
        //         else {
        //             return canPieceMove['Pawn'](fromRow, fromColumn, toRow, toColumn, 'passant');
        //         }
        //         break;
        //     case 'passant':
        //         if(toRow === 3) toRow = 2;
        //         if (passant.column === toColumn && (fromRow === 3 &&  toRow === 2) &&
        //             (columnDifference === 1 || columnDifference === -1)) {
        //             const ourPiece = pieces[cells[fromRow][fromColumn]];
        //             const PieceToKill = pieces[cells[fromRow][passant.column]];
        //             changePiecesArray(PieceToKill.id, null);
        //             changeCell(PieceToKill.row, PieceToKill.column, null);
        //             const result = checkAfterMove(ourPiece, toRow, toColumn, null);
        //             changePiecesArray(PieceToKill.id, PieceToKill);
        //             changeCell(PieceToKill.row, PieceToKill.column, PieceToKill.id);
        //             if(!result){
        //                 changeVar('moveOnPassantExist', true);
        //                 return true;
        //             }
        //         }
        //         break;
        //
        //     case 'hideKing':
        //         const rowDifference = fromRow - toRow;
        //         if (fromColumn === toColumn) {
        //             if (rowDifference === 1) return true;
        //             if (toRow === 4 && fromRow === 6) return true;
        //         }
        //         else {
        //             return canPieceMove['Pawn'](fromRow, fromColumn, toRow, toColumn, 'passant');
        //         }
        //         break;
        // }
    },


    Knight: (fromRow, fromColumn, toRow, toColumn) => {
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

    Bishop: (fromRow, fromColumn, toRow, toColumn) => {
        const rowDifference = toRow - fromRow;
        const columnDifference = toColumn - fromColumn;
        if (rowDifference === columnDifference) {
            if (rowDifference > 0) {
                let column = fromColumn + 1;
                for (let row = fromRow + 1; row < toRow; row++, column++) {
                    if (!cells[row][column]) continue;
                    else return;
                }
                return true;
            }
            else {
                let column = fromColumn - 1;
                for (let row = fromRow - 1; row > toRow; row--, column--) {
                    if (!cells[row][column]) continue;
                    else return;
                }
                return true;
            }
        }
        if (rowDifference === -columnDifference) {
            if (rowDifference > 0) {
                let column = fromColumn - 1;
                for (let row = fromRow + 1; row < toRow; row++, column--) {
                    if (!cells[row][column]) continue;
                    else return;
                }
                return true;
            }
            else {
                let column = fromColumn + 1;
                for (let row = fromRow - 1; row > toRow; row--, column++) {
                    if (!cells[row][column]) continue;
                    else return;
                }
                return true;
            }
        }
    },

    Rook: (fromRow, fromColumn, toRow, toColumn) => {
        if (fromColumn === toColumn) {
            if (toRow > fromRow) {
                for (let row = fromRow + 1; row < toRow; row++) {
                    if (cells[row][toColumn]) return;
                }
                return true;
            }
            else {
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
            }
            else {
                for (let column = fromColumn - 1; column > toColumn; column--) {
                    if (cells[toRow][column]) return;
                }
                return true;
            }
        }
    },

    Queen: function(fromRow, fromColumn, toRow, toColumn) {
        const rook = this.Rook(toRow, toColumn, fromRow, fromColumn);
        if(rook) return true;
        const bishop = this.Bishop(toRow, toColumn, fromRow, fromColumn);
        if(bishop) return true;
    },

    King: (fromRow, fromColumn, toRow, toColumn, moveType) => {
        const rowDifference = toRow - fromRow;
        const columnDifference = toColumn - fromColumn;
        if (moveType === 'killPiece' || moveType === 'hideKing') moveType ='makeCheck';
        const moveTypes = {
            makeCheck: () => {
                if ((rowDifference < 2) && (rowDifference > -2) && (columnDifference < 2) &&
                    (columnDifference > -2)) {
                    return true;
                }
            },
            withCastling: () => {
                const piece = pieces[cells[fromRow][fromColumn]];
                if ((rowDifference < 2) && (rowDifference > -2) && (columnDifference < 2) &&
                    (columnDifference > -2)) {
                    return true;

                }
                else {
                    if (toRow === 7 && piece.row === 7) {
                        let rookID;
                        if (columnDifference === -2) {
                            if (piecesForCastlingNeverMoved.leftRook &&
                                piecesForCastlingNeverMoved.king) {
                                for (let i = 0; i <= vars.kingColumn; i++) {
                                    if (attack(vars.color, 7, i)) return;
                                }
                                for (let i = 1; i <= vars.kingColumn-1; i++) {
                                    if (cells[7][i]) return;
                                }
                                //doMove(rook, 7, vars.kingColumn-1, null, true);
                                //return true;
                                if (vars.color === 'white') {
                                    rookID = 25;
                                }
                                else {
                                    rookID = 8;
                                }
                                const rook = pieces[rookID];
                                doMove(rook, 7, vars.kingColumn-1,
                                    null, true);
                                return true;
                            }
                        }
                        if (columnDifference === 2) {
                            if (piecesForCastlingNeverMoved.rightRook &&
                                piecesForCastlingNeverMoved.king) {
                                for (let i = vars.kingColumn; i <= 7; i++) {
                                    if (attack(vars.color, 7, i)) return;
                                }
                                for (let i = vars.kingColumn+1; i <= 6; i++) {
                                    if (cells[7][i]) return;
                                }
                                //doMove(rook, 7, vars.kingColumn-1, null, true);
                                //return true;
                                if (vars.color === 'white') {
                                    rookID = 32;
                                }
                                else {
                                    rookID = 1;
                                }
                                const rook = pieces[rookID];
                                doMove(rook, 7, vars.kingColumn+1,
                                    null, true);
                                return true;
                            }
                        }
                    }
                }
            },
        }
        return moveTypes[moveType]();
        // switch (moveType) {
        //     case 'makeCheck':
        //         if ((rowDifference < 2) && (rowDifference > -2) && (columnDifference < 2) &&
        //             (columnDifference > -2)) {
        //             return true;
        //         }
        //         break;
        //     case 'withCastling':
        //         const piece = pieces[cells[fromRow][fromColumn]];
        //         if ((rowDifference < 2) && (rowDifference > -2) && (columnDifference < 2) &&
        //             (columnDifference > -2)) {
        //             return true;
        //
        //         }
        //         else {
        //             if (toRow === 7 && piece.row === 7) {
        //                 let rookID;
        //                 const getRook = (id) => {
        //                     return pieces[id];
        //                 }
        //                 if (columnDifference === -2) {
        //                     if (piecesForCastlingNeverMoved.leftRook &&
        //                         piecesForCastlingNeverMoved.king) {
        //                         if (vars.color === 'white') {
        //                             rookID = 25;
        //                             const rook = getRook(rookID);
        //                             for (let i = 0; i <= 4; i++) {
        //                                 if (attack(vars.color, 7, i)) return;
        //                             }
        //                             for (let i = 1; i <= 3; i++) {
        //                                 if (cells[7][i]) return;
        //                             }
        //                             doMove(rook, 7, 3, null, true);
        //                             return true;
        //                         }
        //                         if (vars.color === 'black') {
        //                             rookID = 8;
        //                             const rook = getRook(rookID);
        //                             for (let i = 0; i <= 3; i++) {
        //                                 if (attack(vars.color, 7, i)) return;
        //                             }
        //                             for (let i = 1; i <= 2; i++) {
        //                                 if (cells[7][i]) return;
        //                             }
        //                             doMove(rook, 7, 2, null, true);
        //                             return true;
        //                         }
        //                     }
        //                 }
        //                 if (columnDifference === 2) {
        //                     if (piecesForCastlingNeverMoved.rightRook &&
        //                         piecesForCastlingNeverMoved.king) {
        //                         if (vars.color === 'white') {
        //                             rookID = 32;
        //                             const rook = getRook(rookID);
        //                             for (let i = 7; i >= 4; i--) {
        //                                 if (attack(vars.color, 7, i)) return;
        //                             }
        //                             for (let i = 6; i >= 5; i--) {
        //                                 if (cells[7][i]) return;
        //                             }
        //                             doMove(rook, 7, 5, null, true);
        //                             return true;
        //                         }
        //                         if (vars.color === 'black') {
        //                             rookID = 1;
        //                             const rook = getRook(rookID);
        //                             for (let i = 7; i >= 3; i--) {
        //                                 if (attack(vars.color, 7, i)) return;
        //                             }
        //                             for (let i = 6; i >= 4; i--){
        //                                 if (cells[7][i]) return;
        //                             }
        //                             doMove(rook, 7, 4, null, true);
        //                             return true;
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //         break;
        // }
    }
}

export {moves, canPieceMove, doMove, kill, attack, checkAfterMove };