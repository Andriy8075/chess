import {pieces} from "./arrangePieces.mjs";
import {gameState, sendPacket} from "../dataAndFunctions.mjs";
import {wantMove} from "../moves/wantMove.mjs";
import {canPieceMove} from "../moves/canPieceMove.mjs";
import {move} from "../moves/move.mjs";

const onPromotion = (promotionImage) => {
    const backgroundImage = document.getElementById("backgroundImage");
    let pawn;
    for (const piece of pieces) {
        if (piece) {
            if (piece.color === gameState.color && piece.HTMLImage.style.backgroundColor) {
                pawn = piece;
                pawn.HTMLImage.style.removeProperty("background-color");
                break;
            }
        }
    }
    const changePawnToAnotherPiece = (row, column, killingPiece) => {
        pawn.HTMLImage.src = promotionImage.src;
        const type = promotionImage.id.slice(5).toLowerCase();
        pawn.type = type;
        for (let image of document.getElementsByClassName('promotionImage')) {
            image.style.display = "none";
        }
        pawn.wantMove = wantMove[type].bind(null, pawn);
        pawn.canMove = (toRow, toColumn, moveType) => {
            if (canPieceMove[pawn.type]({fromRow: pawn.row, fromColumn: pawn.column, toRow, toColumn, moveType}))
                return true;
        };
        move({
            piece:pawn,
            toRow: row,
            toColumn: column,
            killingPiece,
            clearPosition: true});
        sendPacket('promotion', {
            pawnId: pawn.id,
            type: type,
            src: promotionImage.src,
        });
    };
    if (backgroundImage) {
        changePawnToAnotherPiece(0, gameState.promotionImageColumn);
        backgroundImage.remove();
    } else {
        const killingPiece = pieces[gameState.promotionKillingPieceId];
        changePawnToAnotherPiece(killingPiece.row, killingPiece.column, killingPiece);
    }
}

export {onPromotion}