import {changeCell, changePiecesArray, pieces,} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, socket, gameState, appearance} from "../data.mjs";
import {clear, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";

// const kill = (id, dontSendpacket) => {
//     if (pieces[id]) {
//         pieces[id].HTMLImage.remove();
//         changePiecesArray(id, null);
//         if (!dontSendpacket) {
//             const packet = {
//                 method: "kill", pieceId: id, userId: gameState.userId,
//             };
//             socket.send(JSON.stringify(packet));
//         }
//     }
// };
const move = (Piece, toRow, toColumn, opponentPiece, clearPosition, passant, dontSendPacket,) => {
    changeCell(toRow, toColumn, Piece.id);
    changeCell(Piece.row, Piece.column, null);
    let kill;
    if (opponentPiece) {
        const id = opponentPiece.id;
        pieces[id].HTMLImage.remove();
        changePiecesArray(id, null);
        //kill(opponentPiece.id, dontSendPacket);
        clearPosition = true;
        kill = id;
    }

    Piece.row = toRow;
    Piece.column = toColumn;
    Piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
    Piece.HTMLImage.style.left = `${appearance.cellSize * toColumn}em`;
    Piece.HTMLImage.style.removeProperty("background-color");

    changeVar(false, "moveOrder");
    changeVar(null, "chosenPiece");
    changeVar(false, "moveOnPassantExist");

    if (clearPosition) {
        clear();
    } else {
        writeDownPosition();
    }
    if (!dontSendPacket) {
        const packet = {
            method: "move",
            userId: gameState.userId,
            pieceId: Piece.id,
            cellRow: 7 - toRow,
            cellColumn: 7 - toColumn,
            clear: clearPosition,
            passant: passant,
            kill: kill,
        };
        socket.send(JSON.stringify(packet));
    }
};

export {move};
