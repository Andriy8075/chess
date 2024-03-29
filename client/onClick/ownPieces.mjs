import {changeVar, gameState} from "../dataAndFunctions.mjs";
import {pieces} from "../arrangePieces/arrangePieces.mjs";

const ownPieces = (pieceImage, id) => {
    pieceImage.addEventListener("click", () => {
        if (gameState.turnToMove) {
            if (pieceImage.style.backgroundColor) {
                pieceImage.style.removeProperty("background-color");
                changeVar(null, "chosenPiece");
            } else {
                if (gameState.chosenPiece) {
                    pieces[gameState.chosenPiece].HTMLImage.style.removeProperty("background-color",);
                }
                changeVar(id, "chosenPiece");
                pieceImage.style.backgroundColor = "#d5cd7f";
            }
        }
    });
};

export {ownPieces};
