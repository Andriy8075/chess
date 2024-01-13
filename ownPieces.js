import { vars, changeVar } from "./data.js";
import { pieces } from "./arrangePieces.js";

const ownPieces = (pieceImage, id) => {
  pieceImage.addEventListener("click", () => {
    if (vars.movePossibility) {
      if (pieceImage.style.backgroundColor) {
        pieceImage.style.removeProperty("background-color");
        changeVar("chosenPiece", null);
      } else {
        if (vars.chosenPiece) {
          pieces[vars.chosenPiece].HTMLImage.style.removeProperty(
            "background-color",
          );
        }
        changeVar("chosenPiece", id);
        pieceImage.style.backgroundColor = "#d5cd7f";
      }
    }
  });
};

export { ownPieces };
