import {
    changeCell,
    pieces,
    cells,
    changePiecesArray
} from "../arrangePieces/arrangePieces.mjs";
import {
    changeVar, gameState, countOfPieces,
    fistColorPieceMaxId, maxRowAndCol
} from "../dataAndFunctions.mjs";

const attack = ({color, toRow, toCol, ignorePiece, firstPieceId}) => {
    let lastPieceId;
    if(firstPieceId) {
        lastPieceId = firstPieceId <= fistColorPieceMaxId ?
            fistColorPieceMaxId : countOfPieces;
    }
    else {
        [firstPieceId, lastPieceId] = color === 'white' ?
            [1, fistColorPieceMaxId] : [fistColorPieceMaxId+1, countOfPieces];
    }
    for (let id = firstPieceId; id <= lastPieceId; id++) {
        const currentPiece = pieces[firstPieceId];
        if (!currentPiece) continue;

        if(ignorePiece && ignorePiece.id === id) continue;

        if (currentPiece.canMove({
            currentPiece, toRow, toCol,
        })) return currentPiece;
    }
};

const checkAfterMoveTypes = {
    common: ({piece, toRow, toCol}) => {
        const previousRow = piece.row;
        const previousCol = piece.col;
        piece.row = toRow;
        piece.col = toCol;
        changeCell(toRow, toCol, piece.id);
        changeCell(previousRow, previousCol, null);

        const isItKing = piece.type === "king";
        if (isItKing) {
            changeVar(toRow, "kingRow");
            changeVar(toCol, "kingCol");
        }

        const killPieceId = cells[toRow][toCol];
        const killPiece = pieces[killPieceId];

        let result;
        if (killPiece) {
            if (attack({
                color: gameState.color,
                toRow: gameState.king[piece.color].kingRow,
                toCol: gameState.king[piece.color].kingCol,
                ignorePiece: killPiece})) {
                result = true;
            }
        } else {
            if (attack({
                color: gameState.color,
                toRow: gameState.king[piece.color].kingRow,
                toCol: gameState.king[piece.color].kingCol})) {
                result = true;
            }
        }

        if (isItKing) {
            changeVar(previousRow, "kingRow");
            changeVar(previousCol, "kingCol");
        }
        piece.row = previousRow;
        piece.col = previousCol;
        changeCell(toRow, toCol, killPiece ? killPiece.id : null);
        changeCell(previousRow, previousCol, piece.id);
        return result;
    },
    castling: ({piece, specifies}) => {
        let result = true;
        const { kingCol } = specifies;
        if (specifies.side === 'right') {
            for (let col = kingCol; col <= maxRowAndCol; col++) {
                if (attack({
                    color: piece.color,
                    toRow: piece.row,
                    toCol: col,
                })) {
                    result = false;
                    break;
                }
            }
        }
        else { // specifies.side === 'left'
            for (let col = 0; col <= kingCol; col++) {
                if (attack({
                    color: piece.color,
                    toRow: piece.row,
                    toCol: col,
                })) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    },
    killOnPassant: ({piece, toRow, toCol, specifies}) => {
        const {row, col} = piece;
        const {pieceThatKillsId} = specifies;

        const pieceThatMovesId = cells[row][col];
        const pieceThatMoves = pieces[pieceThatMovesId];
        const pieceThatKills = pieces[pieceThatKillsId];

        changePiecesArray(pieceThatKills.id, null);
        changeCell(pieceThatKills.row, pieceThatKills.col, undefined);

        const isCheck = checkAfterMoveTypes.common({piece: pieceThatMoves,
            toRow, toCol});

        changePiecesArray(pieceThatKills.id, pieceThatKills);
        changeCell(pieceThatKills.row, pieceThatKills.col, pieceThatKills.id);

        if (!isCheck) {
            changeVar(true, "moveOnPassantExist");
        }
        return isCheck;
    },
}

const checkAfterMove = (data) => {
    const {specifies} = data;
    if(!specifies) return checkAfterMoveTypes.common(data);
    const correctFunction = checkAfterMoveTypes[specifies.moveType];
    return correctFunction ? correctFunction(data) :
        checkAfterMoveTypes.common(data);
};

const isPieceOnTheBoard = (...pieceCoords) => {
    for (const coordinate of pieceCoords) {
        if(coordinate > maxRowAndCol || coordinate < 0) return false;
    }
    return true;
}

const validData = ({piece, toRow, toCol}) => {
    const {row, col} = piece;
    if(!isPieceOnTheBoard(row, col, toRow, toCol)) return false;
    const isPieceOnCellMoveTo = cells[toRow][toCol];
    if(isPieceOnCellMoveTo) {
        const pieceMoveTo = pieces[isPieceOnCellMoveTo];
        if(pieceMoveTo.color === piece.color) return false;
    }
    return true;
}

const canMoveWithoutOpeningCheck = ({piece, toRow, toCol}) => {
    if(!validData({piece, toRow, toCol})) return false;
    const canMove = piece.canMove({toRow, toCol});
    if(!canMove) return false;
    const specificMove = typeof canMove === 'object';
    const result =  checkAfterMove({piece, toRow, toCol,
        specifies: specificMove ? canMove : undefined,
    });
    return result ? (specificMove ? canMove : true) : false
}

export {attack, checkAfterMove, canMoveWithoutOpeningCheck};
