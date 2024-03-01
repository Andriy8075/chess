import {pieces} from "../arrangePieces/arrangePieces.mjs";
import {gameState, sendPacket} from "../dataAndFunctions.mjs";
import {wantMove} from "./wantMove.mjs";
import {canPieceMove} from "./canPieceMove.mjs";
import {move} from "./move.mjs";

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
    const changePawnToAnotherPiece = (row, column, killPiece) => {
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
            piece: pawn,
            toRow: row,
            toColumn: column,
            killPiece,
            clearPosition: true,
            dontSendPacket: true
        });
        sendPacket('promotion', {
            toColumn: 7 - column,
            opponentId: killPiece ? killPiece.id : undefined,
            pawnId: pawn.id,
            killId: killPiece ? killPiece.id : undefined,
            type: type,
            src: promotionImage.src,
        });
    };
    if (backgroundImage) {
        changePawnToAnotherPiece(0, gameState.promotionImageColumn);
        backgroundImage.remove();
    } else {
        const killPiece = pieces[gameState.promotionKillingPieceId];
        changePawnToAnotherPiece(killPiece.row, killPiece.column, killPiece);
    }
}

export {onPromotion}