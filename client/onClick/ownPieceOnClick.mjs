import { changeVar, gameState } from "../dataAndFunctions.mjs";
import { pieces } from "../arrangePieces/arrangePieces.mjs";

const ownPieceOnClick = (pieceImage, id) => {
  pieceImage.addEventListener("click", () => {
    if (gameState.turnToMove) {
      const pieceImageStyle = pieceImage.style;
      if (pieceImageStyle.backgroundColor) {
        pieceImageStyle.removeProperty("background-color");
        changeVar(null, "chosenPiece");
      } else {
        if (gameState.chosenPiece) {
          const chosenPiece = pieces[gameState.chosenPiece];
          chosenPiece.HTMLImage.style.removeProperty("background-color");
        }
        changeVar(id, "chosenPiece");
        pieceImageStyle.backgroundColor = "#d5cd7f";
      }
    }
  });
};

export { ownPieceOnClick };
