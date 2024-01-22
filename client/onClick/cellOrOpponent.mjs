import {gameState} from "../data.mjs";
import {pieces} from "../arrangePieces/arrangePieces.mjs";
import {Piece} from "../arrangePieces/piece.mjs";

const cellOrOpponent = (cellOrOpponent) => {
    if (cellOrOpponent instanceof Piece) {
        cellOrOpponent.HTMLImage.addEventListener("click", () => {
            if (gameState.movePossibility) {
                if (gameState.chosenPiece) {
                    const pieceThatMoves = pieces[gameState.chosenPiece];
                    pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, cellOrOpponent,);
                }
            }
        });
    } else {
        cellOrOpponent.addEventListener("click", () => {
            if (gameState.movePossibility) {
                if (gameState.chosenPiece) {
                    const pieceThatMoves = pieces[gameState.chosenPiece];
                    pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, null,);
                }
            }
        });
    }
};

export {cellOrOpponent};
