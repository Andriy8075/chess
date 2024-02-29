import {changeCell, changePiecesArray} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, sendPacket, appearance} from "../dataAndFunctions.mjs";
import {clear, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";
const move = ({piece, toRow, toColumn, killingPiece, clearPosition, passant}) => {
    changeCell(toRow, toColumn, piece.id);
    changeCell(piece.row, piece.column, null);
    let kill;
    if (killingPiece) {
        killingPiece.HTMLImage.remove();
        changePiecesArray(killingPiece.id, null);
        clearPosition = true;
        kill = killingPiece.id;
    }
    piece.row = toRow;
    piece.column = toColumn;
    piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
    piece.HTMLImage.style.left = `${appearance.cellSize * toColumn}em`;
    piece.HTMLImage.style.removeProperty("background-color");

    changeVar(false, "moveOrder");
    changeVar(null, "chosenPiece");
    changeVar(false, "moveOnPassantExist");

    if (clearPosition) {
        clear();
    } else {
        writeDownPosition();
    }
    sendPacket('move', {
        pieceId: piece.id,
        toRow: 7 - toRow,
        toColumn: 7 - toColumn,
        clearPosition: clearPosition,
        passant: passant,
        kill: kill,
    });
};

export {move};
