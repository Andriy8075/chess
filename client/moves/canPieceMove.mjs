import {cells, changeCell, changePiecesArray,
    pieces} from "../arrangePieces/arrangePieces.mjs";
import {
    changeVar,
    gameState,
    maxRowAndCol, rookIds, sendPacket,
    startPawnRow,
    passantRow
} from "../dataAndFunctions.mjs";
import {attack, checkAfterMove} from "./attackAndCheck.mjs";
import {move} from "./move.mjs";

const pawnMoveTypes = {
    makeCheckForOurKing: ({ fromRow, toRow, fromCol, toCol }) => {
        const colDifference = fromCol - toCol;
        return (fromRow - toRow === -1 &&
            (colDifference === 1 || colDifference === -1))
    },
    killOpponentPiece: ({ fromRow, toRow, fromCol, toCol }) => {
        const colDifference = fromCol - toCol;
        const opponentPieceId = cells[toRow][toCol];
        if (fromRow - toRow === 1 &&
            (colDifference === 1 || colDifference === -1) &&
            opponentPieceId) {
            const opponentPiece = pieces[opponentPieceId];
            const ourPieceId = cells[fromRow][fromCol];
            const ourPiece = pieces[ourPieceId];
            if (!checkAfterMove({
                piece: ourPiece,
                toRow, toCol,
                killPiece: opponentPiece
            })) return true;
        }
        else {
            return canPieceMove.pawn({fromRow, fromCol,
                toRow, toCol, moveType: "passant"});
        }
    },
    passant: ({ fromRow, toRow, fromCol, toCol }) => {
        const colDifference = fromCol - toCol;
        if (toRow === passantRow+1) toRow = passantRow;

        if(!gameState.passant.id) return false;
        if(gameState.passant.col !== toCol) return false;
        if(toRow !== passantRow) return false;
        if(fromRow !== passantRow+1) return false;
        if(colDifference !== 1 && colDifference !== -1) return false;

        const rowWithPawns = cells[fromRow];
        const ourPieceId = rowWithPawns[fromCol];
        const PieceToKillId = rowWithPawns[gameState.passant.col]
        const ourPiece = pieces[ourPieceId];
        const PieceToKill = pieces[PieceToKillId];

        changePiecesArray(PieceToKill.id, null);
        changeCell(PieceToKill.row, PieceToKill.col, undefined);

        const isCheck = checkAfterMove({piece: ourPiece,
            toRow, toCol});

        changePiecesArray(PieceToKill.id, PieceToKill);
        changeCell(PieceToKill.row, PieceToKill.col, PieceToKill.id);

        if (!isCheck) {
            changeVar(true, "moveOnPassantExist");
        }
        return !isCheck;
    },
    withoutKill: ({ fromRow, toRow, fromCol, toCol }) => {
        const rowDifference = fromRow - toRow;
        if (fromCol === toCol) {
            if (rowDifference === 1) return true;
            const isPieceOnIntermediateCell = cells[startPawnRow-1][fromCol];
            if (toRow === startPawnRow-2 && fromRow === startPawnRow &&
                !isPieceOnIntermediateCell) return true;
        }
        return false;
    },
};

const kingMoveTypes = {
    makeCheck: ({ fromRow, toRow, fromCol, toCol }) => {
        const rowDifference = toRow - fromRow;
        const colDifference = toCol - fromCol;
        if (rowDifference < 2 && rowDifference > -2 &&
            colDifference < 2 && colDifference > -2) {
            return true;
        }
    },
    castling: ({ piece, toRow, toCol }) => {
        if (toRow === maxRowAndCol && piece.row === maxRowAndCol) {
            const colDifference = toCol - piece.col;
            let successfulMove;
            let moveRookToCol;
            let rookId;
            if (colDifference === -2) { // king moves to left
                if (gameState.canCastling.leftRook && gameState.canCastling.king) {
                    for (let col = 0; col <= gameState.kingCol; col++) {
                        if (attack({
                            color: gameState.color,
                            toRow: maxRowAndCol,
                            toCol: col
                        })) return false;
                    }
                    for (let col = 1; col <= gameState.kingCol - 1; col++) {
                        const isPieceBetweenKingAndRook = cells[maxRowAndCol][col];
                        if (isPieceBetweenKingAndRook) return false;
                    }
                    if (gameState.color === "white") {
                        rookId = rookIds.whiteLeft;
                    } else {
                        rookId = rookIds.blackLeft;
                    }
                    moveRookToCol = gameState.kingCol - 1;
                    successfulMove = true;
                }
            }
            else if (colDifference === 2) { // king moves to right
                if (gameState.canCastling.rightRook && gameState.canCastling.king) {
                    for (let col = gameState.kingCol; col <= maxRowAndCol; col++) {
                        if (attack({
                            color: gameState.color, toRow: maxRowAndCol, toCol: col
                        })) return false;
                    }
                    for (let col = gameState.kingCol + 1; col <= maxRowAndCol-1; col++) {
                        const isPieceBetweenKingAndRook = cells[maxRowAndCol][col];
                        if (isPieceBetweenKingAndRook) return false;
                    }
                    if (gameState.color === "white") {
                        rookId = rookIds.whiteRight;
                    } else {
                        rookId = rookIds.blackRight;
                    }
                    moveRookToCol = gameState.kingCol + 1;
                    successfulMove = true;
                }
            }
            if(successfulMove) {
                const rook = pieces[rookId]
                move({
                    piece: rook,
                    toRow,
                    toCol: moveRookToCol,
                    clearPosition: true,
                    dontSendPacket: true
                });
                move({piece, toRow, toCol,
                    clearPosition: true,
                    dontSendPacket: true,
                });
                changeVar(toRow, "kingRow");
                changeVar(toCol, "kingCol");
                changeVar(false, 'canCastling', 'king');
                sendPacket('castling', {
                    rookId,
                    kingId: piece.id,
                    moveKingToCol: maxRowAndCol - toCol,
                    moveRookToCol: maxRowAndCol - moveRookToCol,
                });
                return true;
            }
        }
    }
}

const canPieceMove = {
    pawn: (data) => {
        let { moveType } = data;
        if(!moveType || !pawnMoveTypes[moveType]) moveType = 'makeCheck';
        return pawnMoveTypes[moveType](data);
    },

    knight: ({fromRow, fromCol, toRow, toCol}) => {
        const rowDifference = toRow - fromRow;
        const colDifference = toCol - fromCol;
        if (rowDifference === 1 || rowDifference === -1) {
            if (colDifference === 2 || colDifference === -2) {
                return true;
            }
        }
        if (colDifference === 1 || colDifference === -1) {
            if (rowDifference === 2 || rowDifference === -2) {
                return true;
            }
        }
        return false;
    },

    bishop: ({fromRow, fromCol, toRow, toCol}) => {
        const rowDifference = toRow - fromRow;
        const colDifference = toCol - fromCol;
        if (rowDifference === colDifference) {
            if (rowDifference > 0) {    // bishop goes in left and top
                let col = fromCol + 1;
                for (let row = fromRow + 1; row < toRow; row++, col++) {
                    const pieceOnCell = cells[row][col];
                    if (pieceOnCell) return false;
                }
                return true;
            }
            else {  // bishop goes in right and bottom
                let col = fromCol - 1;
                for (let row = fromRow - 1; row > toRow; row--, col--) {
                    const pieceOnCell = cells[row][col];
                    if (pieceOnCell) return false;
                }
                return true;
            }
        }
        if (rowDifference === -colDifference) {
            if (rowDifference > 0) {    // bishop goes in right and top
                let col = fromCol - 1;
                for (let row = fromRow + 1; row < toRow; row++, col--) {
                    const pieceOnCell = cells[row][col];
                    if (pieceOnCell) return false;
                }
                return true;
            }
            else {  // bishop goes in left and bottom
                let col = fromCol + 1;
                for (let row = fromRow - 1; row > toRow; row--, col++) {
                    const pieceOnCell = cells[row][col];
                    if (pieceOnCell) return false;                }
                return true;
            }
        }
    },

    rook: ({fromRow, fromCol, toRow, toCol}) => {
        if (fromCol === toCol) {
            if (toRow > fromRow) {  //rook goes in bottom
                for (let row = fromRow + 1; row < toRow; row++) {
                    const pieceOnCell = cells[row][toCol];
                    if (pieceOnCell) return false;
                }
                return true;
            } else {    //rook goes in top
                for (let row = fromRow - 1; row > toRow; row--) {
                    const pieceOnCell = cells[row][toCol];
                    if (pieceOnCell) return false;
                }
                return true;
            }
        }
        if (fromRow === toRow) {
            if (toCol > fromCol) {  //rook goes righter
                for (let col = fromCol + 1; col < toCol; col++) {
                    const pieceOnCell = cells[toRow][col];
                    if (pieceOnCell) return false;
                }
                return true;
            }
            else {    //rook goes lefter
                for (let col = fromCol - 1; col > toCol; col--) {
                    const pieceOnCell = cells[toRow][col];
                    if (pieceOnCell) return false;
                }
                return true;
            }
        }
    },

    queen: function ({fromRow, fromCol, toRow, toCol}) {
        const moveLikeRook = canPieceMove.rook({
            toRow, toCol, fromRow, fromCol});
        if (moveLikeRook) return true;
        const moveLikeBishop = canPieceMove.bishop({
            toRow, toCol, fromRow, fromCol});
        return moveLikeBishop;
    },

    king: (data) => {
        let { moveType } = data;
        if(!moveType || !kingMoveTypes[moveType]) moveType = 'makeCheck';
        const correctFunction = kingMoveTypes[moveType];
        return correctFunction(data);
    },
};

export {canPieceMove};
