import {cells, changeCell, changePiecesArray,
    pieces} from "../arrangePieces/arrangePieces.mjs";
import {
    changeVar,
    gameState,
    maxRowAndCol, sendPacket,
} from "../dataAndFunctions.mjs";
import {attack, checkAfterMove} from "./attackAndCheck.mjs";
import {makeVisualChanges} from "./makeVisualChanges.mjs";

const {rowDifferences, startPawnRows, passantRows, endRows} = gameState;

const isOurPieceDefinition = (piece) => piece.color === gameState.color ?
    'our' : 'opponent';

const pawnMoveTypes = {
    // makeCheckForOurKing: ({ fromRow, toRow, fromCol, toCol }) => {
    //     const colDifference = fromCol - toCol;
    //     return (fromRow - toRow === -1 &&
    //         (colDifference === 1 || colDifference === -1))
    // },
    withKill: ({ piece, toRow, toCol }) => {
        const { row } = piece;
        const rowDifference = toRow - row;
        const opponentPieceId = cells[toRow][toCol];
        const isOurPiece = isOurPieceDefinition(piece);
        const correctRowDifference = rowDifferences[isOurPiece];

        if (rowDifference === correctRowDifference && opponentPieceId) {
            return true;
            // const opponentPiece = pieces[opponentPieceId];
            // const ourPieceId = cells[row][col];
            // const ourPiece = pieces[ourPieceId];
            // if (!checkAfterMove({
            //     piece: ourPiece,
            //     toRow, toCol,
            //     killPiece: opponentPiece
            // })) return true;
        }
        else {
            return pawnMoveTypes.killOnPassant[isOurPiece]({piece, toRow, toCol});
        }
    },
    killOnPassant: ({piece, toRow, toCol}) => {
        const {row, col} = piece;
        const colDifference = col - toCol;
        const isOurPawn = isOurPieceDefinition(piece);
        const correctRowDifference = rowDifferences[isOurPawn];
        const passantRow = passantRows[isOurPawn];

        if (toRow === passantRow-correctRowDifference) toRow = passantRow;

        const passantInfo = gameState.passant;
        const pieceThatKillsId = passantInfo.id;

        if(!pieceThatKillsId) return false;
        if(passantInfo.col !== toCol) return false;
        if(toRow !== passantRow) return false;
        if(row !== passantRow+correctRowDifference) return false;
        if(colDifference !== 1 && colDifference !== -1) return false;

        return {
            moveType: 'killOnPassant',
            pieceThatKillsId,
        };
        // const pieceThatMovesId = cells[row][col];
        // const pieceThatMoves = pieces[pieceThatMovesId];
        // const pieceThatKills = pieces[pieceThatKillsId];
        //
        // changePiecesArray(pieceThatKills.id, null);
        // changeCell(pieceThatKills.row, pieceThatKills.col, undefined);
        //
        // const isCheck = checkAfterMove({piece: pieceThatMoves,
        //     toRow, toCol});
        //
        // changePiecesArray(pieceThatKills.id, pieceThatKills);
        // changeCell(pieceThatKills.row, pieceThatKills.col, pieceThatKills.id);
        //
        // if (!isCheck) {
        //     changeVar(true, "moveOnPassantExist");
        // }
        //return !isCheck;
    },
    withoutKill: ({ piece, toRow }) => {
        const {row, col} = piece;
        const rowDifference = toRow - row;
        const isOurPawn = isOurPieceDefinition(piece);
        const correctRowDifference = rowDifferences[isOurPawn];

        if (rowDifference === correctRowDifference) return true;

        const startPawnRow = startPawnRows[isOurPawn];
        const intermediateRow = startPawnRow+correctRowDifference
        const isPieceOnIntermediateCell = cells[intermediateRow][col];
        if(!isPieceOnIntermediateCell && row === startPawnRow &&
            toRow === startPawnRow+(2*correctRowDifference)) {
            return {
                moveType: 'moveThroughPassant',
                color: piece.color,
            }
        }
        return !isPieceOnIntermediateCell && row === startPawnRow &&
            toRow === startPawnRow+(2*correctRowDifference);
    },
};

const kingMoveTypes = {
    common: ({ piece, toRow, toCol }) => {
        const { row, col } = piece;
        const rowDifference = toRow - row;
        const colDifference = toCol - col;
        return (rowDifference < 2 && rowDifference > -2 &&
            colDifference < 2 && colDifference > -2)
    },
    castling: ({ piece, toRow, toCol }) => {
        const kingColor = piece.color;
        const canCastling = gameState.canCastling[kingColor]
        if(!canCastling.king) return false;
        if (piece.row !== toRow) return false;
        const colDifference = toCol - piece.col;
        let successfulMove;
        // let moveRookToCol;
        // let rookId;
        let side;
        const kingInfo = gameState.king[kingColor];
        const {kingCol} = kingInfo;
        if (colDifference === -2) { // king moves to left
            if(!canCastling.leftRook) return false;
            side = 'left';
            // for (let col = 0; col <= kingCol; col++) {
            //     if (attack({
            //         color: piece.color,
            //         toRow: piece.row,
            //         toCol: col,
            //     })) return false;
            // }
            for (let col = 1; col <= kingCol - 1; col++) {
                const isPieceBetweenKingAndRook = cells[maxRowAndCol][col];
                if (isPieceBetweenKingAndRook) return false;
            }
            // rookId = cells[piece.row][0];
            // moveRookToCol = kingCol - 1;
            successfulMove = true;
        }
        else if (colDifference === 2) { // king moves to right
            if(!canCastling.rightRook) return false;
            side = 'right';
            // for (let col = kingCol; col <= maxRowAndCol; col++) {
            //     if (attack({
            //         color: piece.color,
            //         toRow: piece.row,
            //         toCol: col,
            //     })) return false;
            // }
            for (let col = kingCol + 1; col <= maxRowAndCol-1; col++) {
                const isPieceBetweenKingAndRook = cells[maxRowAndCol][col];
                if (isPieceBetweenKingAndRook) return false;
            }
            // rookId = cells[piece.row][maxRowAndCol];
            // moveRookToCol = kingCol + 1;
            successfulMove = true;
        }
        if(successfulMove) {
            return {
                moveType: 'castling',
                side,
                kingCol,
            }
            //const rook = pieces[rookId];
            // makeVisualChanges({
            //     piece: rook,
            //     toRow,
            //     toCol: moveRookToCol,
            //     clearPosition: true,
            //     dontSendPacket: true
            // });
            // makeVisualChanges({piece, toRow, toCol,
            //     clearPosition: true,
            //     dontSendPacket: true,
            // });
            // kingInfo.kingCol = toCol;
            // kingInfo.kingRow = toRow;
            // canCastling.king = false;
            // sendPacket('castling', {
            //     rookId,
            //     kingId: piece.id,
            //     moveKingToCol: maxRowAndCol - toCol,
            //     moveRookToCol: maxRowAndCol - moveRookToCol,
            // });
            //return true;
        }
        return false;
    }
}

const simpleCanMove = {
    pawn: ({piece, toRow, toCol}) => {
        const colDifference = toCol - piece.col;
        let result
        if(colDifference === 1 || colDifference === -1) {
            result = pawnMoveTypes['withKill']({piece, toRow, toCol});
            if(result && toRow === endRows[piece.color]) {
                return {
                    type: 'promotionWithKill',
                    piece,
                    fromCol: piece.col,
                    toCol,
                    toRow,
                }
            }
        }
        else if(!colDifference) {
            result = pawnMoveTypes['withoutKill']({piece, toRow, toCol});
            if(result && toRow === endRows[piece.color]) {
                return {
                    type: 'promotionWithoutKill',
                    piece,
                    fromCol: piece.col,
                    toCol,
                    toRow,
                }
            }
        }
        return result;
    },

    knight: ({piece, toRow, toCol}) => {
        const {row, col} = piece;
        const rowDifference = toRow - row;
        const colDifference = toCol - col;
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

    bishop: ({piece, toRow, toCol}) => {
        const fromRow = piece.row;
        const fromCol = piece.col;
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

    rook: ({piece, toRow, toCol}) => {
        const fromRow = piece.row;
        const fromCol = piece.col;
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

    queen: (data) => {
        const moveLikeRook = simpleCanMove.rook(data);
        if (moveLikeRook) return true;
        const moveLikeBishop = simpleCanMove.bishop(data);
        return moveLikeBishop;
    },

    king: (data) => kingMoveTypes.common(data) || kingMoveTypes.castling(data),
};

export {simpleCanMove, passantRows, rowDifferences};
