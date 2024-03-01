import {gameState} from "../dataAndFunctions.mjs";
import {pieces} from "../arrangePieces/arrangePieces.mjs";
import {Piece} from "../arrangePieces/piece.mjs";

const event = (cellOrOpponent, killPiece) => {
    if (gameState.turnToMove && gameState.chosenPiece) {
        const pieceThatMoves = pieces[gameState.chosenPiece];
        pieceThatMoves.wantMove({toRow: cellOrOpponent.row, toColumn: cellOrOpponent.column, killPiece});
    }
}
const cellOrOpponent = (cellOrOpponent) => {
    if (cellOrOpponent instanceof Piece) {
        cellOrOpponent.HTMLImage.addEventListener("click", () => event(cellOrOpponent, cellOrOpponent));
    } else {
        cellOrOpponent.addEventListener("click", () => event(cellOrOpponent, null));
    }
};

export {cellOrOpponent};
