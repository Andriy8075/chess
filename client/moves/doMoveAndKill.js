import {changeCell, changePiecesArray, pieces,} from "../arrangePieces/arrangePieces.js";
import {changeVar, socket, gameState} from "../data.js";
import {clear, writeDownPosition} from "../endOfGame/repeatingMoves.js";

const kill = (id, dontSendPocket) => {
    if (pieces[id]) {
        pieces[id].HTMLImage.remove();
        changePiecesArray(id, null);
        if (!dontSendPocket) {
            const pocket = {
                method: "kill", pieceId: id, userId: gameState.userId,
            };
            socket.send(JSON.stringify(pocket));
        }
    }
};
const doMove = (Piece, toRow, toColumn, opponentPiece, clearPosition, passant, dontSendPocket,) => {
    changeCell(toRow, toColumn, Piece.id);
    changeCell(Piece.row, Piece.column, null);
    if (opponentPiece) {
        kill(opponentPiece.id, dontSendPocket);
        clearPosition = true;
    }

    Piece.row = toRow;
    Piece.column = toColumn;
    Piece.HTMLImage.style.top = `${gameState.cellSize * toRow}em`;
    Piece.HTMLImage.style.left = `${gameState.cellSize * toColumn}em`;
    Piece.HTMLImage.style.removeProperty("background-color");

    changeVar("movePossibility", false);
    changeVar("chosenPiece", null);
    changeVar("moveOnPassantExist", false);

    if (clearPosition) {
        clear();
    } else {
        writeDownPosition();
    }
    if (!dontSendPocket) {
        const pocket = {
            method: "doMove",
            userId: gameState.userId,
            pieceId: Piece.id,
            cellRow: 7 - toRow,
            cellColumn: 7 - toColumn,
            clear: clearPosition,
            passant: passant,
        };
        socket.send(JSON.stringify(pocket));
    }
};

export {doMove, kill};
