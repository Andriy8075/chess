import {gameState} from "../dataAndFunctions.mjs";
import {pieces} from "../arrangePieces/arrangePieces.mjs";
import {Piece} from "../arrangePieces/piece.mjs";

const event = (cellOrOpponentPiece, isPiece) => {
    if (gameState.turnToMove && gameState.chosenPiece) {
        const pieceThatMoves = pieces[gameState.chosenPiece];
        pieceThatMoves.wantMove({
            toRow: isPiece ? cellOrOpponentPiece.row :
                parseInt(cellOrOpponentPiece.dataset.row),
            toCol: isPiece ? cellOrOpponentPiece.col :
                parseInt(cellOrOpponentPiece.dataset.col),
            killPiece: isPiece ? cellOrOpponentPiece : null});
    }
}

const cellOnClick = (cell) => {
    cell.addEventListener("click", () => event(cell, false));
}

const opponentOnClick = (opponent) => {
    opponent.HTMLImage.addEventListener("click", () => event(opponent, true));
}

export { cellOnClick, opponentOnClick };
