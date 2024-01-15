import {gameState} from "../data.js";
import {pieces} from "../arrangePieces/arrangePieces.js";
import {Piece} from "../arrangePieces/piece.js";

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
