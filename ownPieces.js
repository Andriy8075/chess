import {vars, changeVar} from "./data.js";
import {pieces} from './arrangePieces.js'

const ownPieces = (pieceImage, id) => {
    pieceImage.addEventListener('click', () => {
        if (vars.movePossibility) {
            if(pieceImage.style.backgroundColor) {
                pieceImage.style.removeProperty("background-color");
                changeVar('choosedPiece', null);
            }
            else {
                if (vars.choosedPiece) {
                    pieces[vars.choosedPiece].HTMLImage.style.removeProperty("background-color");
                }
                changeVar('choosedPiece', id);
                pieceImage.style.backgroundColor = '#d5cd7f';
            }
        }
    })
}

export {ownPieces};
