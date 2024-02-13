import {changeVar, gameState} from "../data.mjs";
import {pieces} from "../arrangePieces/arrangePieces.mjs";

const ownPieces = (pieceImage, id) => {
    pieceImage.addEventListener("click", () => {
        if (gameState.moveOrder) {
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
