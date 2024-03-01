import {changeCell, changePiecesArray} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, sendPacket, appearance} from "../dataAndFunctions.mjs";
import {clear, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";
const move = ({piece, toRow, toColumn, killPiece, clearPosition, passant, dontSendPacket}) => {
    changeCell(toRow, toColumn, piece.id);
    changeCell(piece.row, piece.column, null);
    let killId;
    if (killPiece) {
        killPiece.HTMLImage.remove();
        changePiecesArray(killPiece.id, null);
        clearPosition = true;
        killId = killPiece.id;
    }
    piece.row = toRow;
    piece.column = toColumn;
    piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
    piece.HTMLImage.style.left = `${appearance.cellSize * toColumn}em`;
    piece.HTMLImage.style.removeProperty("background-color");

    changeVar(false, "turnToMove");
    changeVar(undefined, "chosenPiece");
    changeVar(false, "moveOnPassantExist");

    if (clearPosition) {
        clear();
    } else {
        writeDownPosition();
    }
    if(!dontSendPacket) {
        sendPacket('move', {
            pieceId: piece.id,
            toRow: 7 - toRow,
            toColumn: 7 - toColumn,
            clearPosition,
            passant,
            killId,
        });
    }
};

export {move};
