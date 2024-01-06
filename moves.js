import {
    socket,
    passant,
    piecesForCastlingNeverMoved,
    vars,
    pieceForCastlingMoved,
    changeVar,
} from './data.js';
import {cells, changeCell, pieces, changePieceCell} from './arrangePieces.js';
import {writeDownPosition, clear} from './repeatingMoves.js';

const attack = (color, attackForRow, attackForColumn, ignorePieces, moveType) => {
    let opponentColor
    if (color === 'white') opponentColor = 'black';
    else opponentColor = 'white';
    for (let currentPiece of pieces) {
        if(!currentPiece) continue;
        if(currentPiece.color === color) continue;
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
        if(currentPiece.canMove(attackForRow, attackForColumn, moveType)) return currentPiece
    }
}
const kill = (id) => {
    pieces[id].HTMLImage.remove()
    changePieceCell(id, null);
    const pocket = {
        method: 'kill',
        pieceId: id,
        ID: vars.ID,
    }
    socket.send(JSON.stringify(pocket));
}

const checkAfterMove = (Piece, toRow, toColumn, opponentPiece) => {
    const previousRow = Piece.row;
    const previousColumn = Piece.column;
    Piece.row = toRow;
    Piece.column = toColumn;
    changeCell(toRow, toColumn, Piece.id);
    changeCell(previousRow, previousColumn, null);
    const isItKing = Piece.type === 'King';
    if (isItKing) {
        changeVar('kingRow', toRow)
        changeVar('kingColumn', toColumn)
    }

    let result;
    if (opponentPiece) {
        if (attack(vars.color, vars.kingRow, vars.kingColumn, [opponentPiece], 'makeCheck')) {
            result = true;
        }
    }
    else {
        if (attack(vars.color, vars.kingRow, vars.kingColumn, null, 'makeCheck')) {
            result = true;
        }
    }
    if (isItKing) {
        changeVar('kingRow', previousRow);
        changeVar('kingColumn', previousColumn);
    }
    Piece.row = previousRow;
    Piece.column = previousColumn;
    changeCell(toRow, toColumn, opponentPiece ? opponentPiece.id : null);
    changeCell(previousRow, previousColumn, Piece.id);
    return result;
}

const makeMove = (Piece, toRow, toColumn, opponentPiece, clearPosition, passant) => {
    changeCell(toRow, toColumn, Piece.id);
    changeCell(Piece.row, Piece.column, null);
    if (opponentPiece) {
        kill(opponentPiece.id)
        clearPosition = true;
    }

    Piece.row = toRow;
    Piece.column = toColumn;
    Piece.HTMLImage.style.top = `${vars.cellSize * toRow}px`;
    Piece.HTMLImage.style.left = `${vars.cellSize * toColumn}px`;
    Piece.HTMLImage.style.removeProperty("background-color");
    
    changeVar('movePossibility', false);
    changeVar('choosedPiece', null );

    if(clearPosition) {
        clear();
    }
    else{
        writeDownPosition();
    }

    const pocket = {
        method: 'makeMove',
        ID: vars.ID,
        pieceId: Piece.id,
        cellRow: 7 - toRow,
        cellColumn: 7 - toColumn,
        clear: clearPosition,
        passant: passant,
    }
    socket.send(JSON.stringify(pocket));
};

const moves = {
    Pawn: (Piece, toRow, toColumn, opponentPiece) => {
        if (Piece.row !== 1) {
            const rowDifference = Piece.row - toRow;
            if ((toColumn === Piece.column) && (!opponentPiece)) {
                if (rowDifference === 1) {
                    if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                        makeMove(Piece, toRow, toColumn, opponentPiece, true);
                        return;
                    }
                }
                if (Piece.row === 6 && toRow === 4 && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                    makeMove(Piece, toRow, toColumn, opponentPiece, true, {
                        id: 7 - Piece.id,
                        column: 7 - toColumn,
                    });
                }
            }
            else if (Piece.row - toRow === 1 && (toColumn - Piece.column === 1 || toColumn - Piece.column === -1)) {
                if (opponentPiece) {
                    if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                        makeMove(Piece, toRow, toColumn, opponentPiece);
                    }
                } else if ((Piece.row === 3) && (passant.column === toColumn)) {
                    const PieceThatKillsOnPassant = pieces[cells[3][passant.column]]
                    changeCell(Piece.row, toColumn, null);
                    changePieceCell(cells[3][passant.column], null);
                    if (!checkAfterMove(Piece, toRow, toColumn, null)) {
                        kill(PieceThatKillsOnPassant.id);
                        makeMove(Piece, toRow, toColumn);
                        changeCell(3, toColumn, null);
                        const pocket = {
                            method: 'clearArrayCellAfterPassant',
                            ID: vars.ID,
                            cellColumn: 7-toColumn,
                        }
                        socket.send(JSON.stringify(pocket));
                    }
                    else {
                        pieces[cells[3][passant.column]] = PieceThatKillsOnPassant;
                        changeCell(Piece.row, toColumn, PieceThatKillsOnPassant.id);
                    }
                }
            }
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
                    backgroundImage.style.top = `${vars.cellSize * toRow}px`;
                    backgroundImage.style.left = `${vars.cellSize * toColumn}px`;
                    divBoard.appendChild(backgroundImage);
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
            makeMove(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    Bishop: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove['Bishop'](Piece.row, Piece.column, toRow, toColumn) &&
            !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            makeMove(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    Rook: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.Rook(Piece.row, Piece.column, toRow, toColumn) &&
            !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            if (Piece.column === 0) pieceForCastlingMoved('leftRook');
            if (Piece.column === 7) pieceForCastlingMoved('rightRook');
            makeMove(Piece, toRow, toColumn, opponentPiece);
            return true;

        }
    },

    Queen: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.Rook(Piece.row, Piece.column, toRow, toColumn)) {
            if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                makeMove(Piece, toRow, toColumn, opponentPiece);
            }
        }
        else if (canPieceMove.Bishop(Piece.row, Piece.column, toRow, toColumn) && 
        !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            makeMove(Piece, toRow, toColumn, opponentPiece);
        }
    },

    King: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.King(Piece.row, Piece.column, toRow, toColumn, 'withCastling') &&
            !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            changeVar('kingRow', toRow)
            changeVar('kingColumn', toColumn)
            makeMove(Piece, toRow, toColumn, opponentPiece);
            pieceForCastlingMoved('king');
        }
    },
}

const canPieceMove = {
    Pawn: (fromRow, fromColumn, toRow, toColumn, moveType) => {
        switch (moveType) {
            case 'makeCheck':
                if (fromRow - toRow === -1) {
                    if (toColumn - fromColumn === 1 || toColumn - fromColumn === -1) {
                        return true;
                    }
                };
                break;
            case 'killPiece':
                const columnDifference = toColumn - fromColumn;
                const neighborColumns = columnDifference === 1 || columnDifference === -1;
                if (fromRow - toRow === 1 && neighborColumns) {
                    return true;
                }
                else {
                    if (passant.column === toColumn && fromRow === toRow &&
                        neighborColumns) return true;
                };
                break;
            case 'hideKing':
                const rowDifference = fromRow - toRow;
                if (fromColumn === toColumn) {
                    if (rowDifference === 1) return true;
                    if (toRow === 4 && fromRow === 6) return true;
                }
                else {
                    const columnDifference = toColumn - fromColumn;
                    if (passant.column === toColumn && rowDifference === 1 && (columnDifference === 1 ||
                        columnDifference === -1)) {
                        return true;
                    }
                };
                break;
        }
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
                    else return
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
        switch (moveType) {
            case 'makeCheck':
                if ((rowDifference < 2) && (rowDifference > -2) && (columnDifference < 2) &&
                    (columnDifference > -2)) {
                    return true;
                };
                break;
            case 'withCastling':
                const piece = pieces[cells[fromRow][fromColumn]]
                if ((rowDifference < 2) && (rowDifference > -2) && (columnDifference < 2) &&
                    (columnDifference > -2)) {
                    return true;
                             
                }
                else {
                    if (toRow === 7 && piece.row === 7) {
                        let rookID;
                        let rook;
                        const getRook = (id) => {
                            return pieces[id];
                        }
                        if (columnDifference === -2) {
                            if (piecesForCastlingNeverMoved.leftRook &&
                                piecesForCastlingNeverMoved.king) {
                                if (vars.color === 'white') {
                                    rookID = 25;
                                    getRook(rookID)
                                    for (let i = 0; i <= 4; i++) {
                                        if (attack(vars.color, 7, i, null)) return;
                                    }
                                    for (let i = 1; i <= 3; i++) {
                                        if (cells[7][i]) return;
                                    }
                                    makeMove(rook, 7, 3, null, true);
                                    return true;
                                }
                                if (vars.color === 'black') {
                                    rookID = 8;
                                    const rook = getRook(rookID);
                                    for (let i = 0; i <= 3; i++) {
                                        if (attack(vars.color, 7, i, null)) return;
                                    }
                                    for (let i = 1; i <= 2; i++) {
                                        if (cells[7][i]) return;
                                    }
                                    makeMove(rook, 7, 2, null, true);
                                    return true;
                                }
                            }
                        }
                        if (columnDifference === 2) {
                            if (piecesForCastlingNeverMoved.rightRook &&
                                piecesForCastlingNeverMoved.king) {
                                if (vars.color === 'white') {
                                    rookID = 32;
                                    const rook = getRook(rookID);
                                    for (let i = 7; i >= 4; i--) {
                                        if (attack(vars.color, 7, i, null)) return;
                                    }
                                    for (let i = 6; i >= 5; i--) {
                                        if (cells[7][i]) return;
                                    }
                                    makeMove(rook, 7, 5, null, true);
                                    return true;
                                }
                                if (vars.color === 'black') {
                                    rookID = 1;
                                    const rook = getRook(rookID);
                                    for (let i = 7; i >= 3; i--) {
                                        if (attack(vars.color, 7, i, null)) return;
                                    }
                                    for (let i = 6; i >= 4; i--){
                                        if (cells[7][i]) return;
                                    }
                                    makeMove(rook, 7, 4, null, true);
                                    return true;
                                }
                            }
                        }
                    }
                };
                break;
        }
    }
}

export {moves, canPieceMove, makeMove, kill, attack, checkAfterMove };