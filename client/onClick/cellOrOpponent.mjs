import {gameState} from "../data.mjs";
import {pieces} from "../arrangePieces/arrangePieces.mjs";
import {Piece} from "../arrangePieces/piece.mjs";

const event = (cellOrOpponent, opponentPiece) => {
    if (gameState.movePossibility && gameState.chosenPiece) {
        const pieceThatMoves = pieces[gameState.chosenPiece];
        pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, opponentPiece);
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
