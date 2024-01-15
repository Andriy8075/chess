import {changeVar, gameState} from "../data.js";
import {pieces} from "../arrangePieces/arrangePieces.js";

const ownPieces = (pieceImage, id) => {
    pieceImage.addEventListener("click", () => {
        if (gameState.movePossibility) {
            if (pieceImage.style.backgroundColor) {
                pieceImage.style.removeProperty("background-color");
                changeVar("chosenPiece", null);
            } else {
                if (gameState.chosenPiece) {
                    pieces[gameState.chosenPiece].HTMLImage.style.removeProperty("background-color",);
                }
                changeVar("chosenPiece", id);
                pieceImage.style.backgroundColor = "#d5cd7f";
            }
        }
    });
};

export {ownPieces};
