import {
    cells,
    changeCell,
    changePiecesArray, pieces
} from "../arrangePieces/arrangePieces.mjs";
import {
    changeVar,
    sendPacket,
    appearance,
    maxRowAndCol,
    gameState
} from "../dataAndFunctions.mjs";
import {clear, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";

const changesTypes = {
    common: (record) => {
        const { piece, toRow, toCol} = record;
        changeCell(toRow, toCol, piece.id);
        changeCell(piece.row, piece.col, undefined);

        const killId = cells[toRow][toCol];
        let { clearPosition } = record
        if (killId) {
            const killPiece = pieces[killId];
            killPiece.HTMLImage.remove();
            changePiecesArray(killPiece.id, null);
            clearPosition = true;
        }

        piece.row = toRow;
        piece.col = toCol;
        piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
        piece.HTMLImage.style.left = `${appearance.cellSize * toCol}em`;
        piece.HTMLImage.style.removeProperty("background-color");

        changeVar(false, "turnToMove");
        changeVar(undefined, "chosenPiece");
        changeVar(false, "moveOnPassantExist");

        if (clearPosition) {
            clear();
        } else {
            writeDownPosition();
        }
        const { dontSendPacket, passant: moveThroughPassant } = record;
    },
    killOnPassant: (record) => {
        const {piece, toRow, toCol, specifies} = record;
        const {pieceThatKillsId} = specifies;
        const killPiece = pieces[pieceThatKillsId];
        killPiece.HTMLImage.remove();
        changePiecesArray(killPiece.id, null);
        changesTypes.common({piece, toRow, toCol, specifies});
    },
    moveThroughPassant: (record) => {
        const { piece } = record;
        gameState[record.specifies.color] = {
            id: piece.id,
            col: piece.col,
        }
        changesTypes.common(record);
    },
    promotionWithKill: (record) => {
        const {piece} = record;
        if(piece.color !== gameState.color)
        const {toCol} = record;
        const pieceThatKillsId = cells[0][toCol];
        const pieceThatKills = pieces[pieceThatKillsId];
        changeVar(pieceThatKillsId, 'promotionKillingPieceId');

        pieceThatKills.HTMLImage.style.backgroundColor = "#d5cd7f";
        const promotionImages =
            document.getElementsByClassName(
                `${gameState.color}PromotionImages`,);
        for (let image of promotionImages) {
            image.style.display = "flex";
        }
    },
    promotionWithoutKill: (record) => {
        const {toCol, toRow} = record;
        const backgroundImage = new Image(appearance.cellSize, appearance.cellSize);
        const divBoard = document.getElementById("boardDiv");
        const backgroundImageStyle = backgroundImage.style;
        backgroundImageStyle.backgroundColor = "#d5cd7f";
        backgroundImageStyle.zIndex = "5";
        backgroundImageStyle.display = "flex";
        backgroundImageStyle.position = "absolute";
        backgroundImage.setAttribute("id", "backgroundImage");
        backgroundImageStyle.width = `${appearance.cellSize}em`;
        backgroundImageStyle.height = `${appearance.cellSize}em`;
        backgroundImageStyle.top = `${appearance.cellSize * toRow}em`;
        backgroundImageStyle.left = `${appearance.cellSize * toCol}em`;
        divBoard.appendChild(backgroundImage);

        changeVar(toCol, "promotionImageCol");
        const promotionImages =
            document.getElementsByClassName(`${gameState.color}PromotionImages`);
        for (let image of promotionImages) {
            image.style.display = "flex";
        }
    }
}

const makeVisualChanges = (record) => {
    const {specifies, piece, toRow, toCol} = record;
    if(!specifies) {
        changesTypes.common(record)
    }
    else {
        const correctFunction = changesTypes[specifies.moveType];
        correctFunction ? correctFunction(record) :
            changesTypes.common(record);
    }
    if(record.sendPacket) {
        sendPacket('makeVisualChanges', {
            pieceId: piece.id,
            toRow: maxRowAndCol - toRow,
            toCol: maxRowAndCol - toCol,
            // clearPosition,
            // passant: moveThroughPassant,
        });
    }

    // const { piece, toRow, toCol} = record;
    // changeCell(toRow, toCol, piece.id);
    // changeCell(piece.row, piece.col, undefined);
    //
    // let killId;
    // const { killPiece } = record;
    // let { clearPosition } = record
    // if (killPiece) {
    //     killPiece.HTMLImage.remove();
    //     changePiecesArray(killPiece.id, null);
    //     clearPosition = true;
    //     killId = killPiece.id;
    // }
    //
    // piece.row = toRow;
    // piece.col = toCol;
    // piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
    // piece.HTMLImage.style.left = `${appearance.cellSize * toCol}em`;
    // piece.HTMLImage.style.removeProperty("background-color");
    //
    // changeVar(false, "turnToMove");
    // changeVar(undefined, "chosenPiece");
    // changeVar(false, "moveOnPassantExist");
    //
    // if (clearPosition) {
    //     clear();
    // } else {
    //     writeDownPosition();
    // }
    // const { dontSendPacket, passant } = record;
    // if(!dontSendPacket) {
    //     sendPacket('makeVisualChanges', {
    //         pieceId: piece.id,
    //         toRow: maxRowAndCol - toRow,
    //         toCol: maxRowAndCol - toCol,
    //         clearPosition,
    //         passant,
    //         killId,
    //     });
    // }
};

export {makeVisualChanges};
