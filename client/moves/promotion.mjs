import {pieces} from "../arrangePieces/arrangePieces.mjs";
import {gameState, maxRowAndCol, sendPacket} from "../dataAndFunctions.mjs";
import {wantMove} from "./wantMove.mjs";
import {canPieceMove} from "./canPieceMove.mjs";
import {move} from "./move.mjs";

const changePawnToAnotherPiece = (col, killPiece, pawn, promotionImage) => {
    pawn.HTMLImage.src = promotionImage.src;
    const colorLength = gameState.color.length;
    const newType = promotionImage.id.slice(colorLength).toLowerCase();
    pawn.type = newType;
    pawn.wantMove = wantMove[newType](pawn);
    pawn.canMove = function({ toRow, toCol, moveType }) {
        const check = canPieceMove[this.type];
        const fromRow = this.row;
        const fromCol = this.col;
        return check({ fromRow, fromCol, toRow, toCol, moveType });
    }

    for (let image of document.getElementsByClassName('promotionImage')) {
        image.style.display = "none";
    }

    move({
        piece: pawn,
        toRow: 0,
        toCol: col,
        killPiece,
        clearPosition: true,
        dontSendPacket: true
    });
    sendPacket('promotion', {
        toCol: maxRowAndCol - col,
        opponentId: killPiece ? killPiece.id : undefined,
        pawnId: pawn.id,
        killId: killPiece ? killPiece.id : undefined,
        type: newType,
        src: promotionImage.src,
    });
};

const onPromotion = (promotionImage) => {
    const backgroundImage = document.getElementById("backgroundImage");
    let pawn;
    for (const piece of pieces) {
        if (!piece) continue;
        if (piece.color === gameState.oppositeColor) continue;
        if (piece.HTMLImage.style.backgroundColor) {
            pawn = piece;
            pawn.HTMLImage.style.removeProperty("background-color");
            break;
        }
    }
    if (backgroundImage) {
        changePawnToAnotherPiece(pawn.col, null, pawn, promotionImage);
        backgroundImage.remove();
    } else {
        const killPiece = pieces[gameState.promotionKillingPieceId];
        changePawnToAnotherPiece(killPiece.col, killPiece, pawn, promotionImage);
    }
}

export {onPromotion}
