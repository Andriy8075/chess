import {vars} from "../data.js";
import {pieces} from "../arrangePieces/arrangePieces.js";
import {Piece} from "../arrangePieces/piece.js";

const cellOrOpponent = (cellOrOpponent) => {
    if (cellOrOpponent instanceof Piece) {
        cellOrOpponent.HTMLImage.addEventListener("click", () => {
            if (vars.movePossibility) {
                if (vars.chosenPiece) {
                    const pieceThatMoves = pieces[vars.chosenPiece];
                    pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, cellOrOpponent,);
                }
            }
        });
    } else {
        cellOrOpponent.addEventListener("click", () => {
            if (vars.movePossibility) {
                if (vars.chosenPiece) {
                    const pieceThatMoves = pieces[vars.chosenPiece];
                    pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, null,);
                }
            }
        });
    }
};

export {cellOrOpponent};
