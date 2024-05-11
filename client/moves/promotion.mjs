import {cells, pieces} from "../arrangePieces/arrangePieces.mjs";
import {
    appearance,
    changeVar,
    gameState,
    maxRowAndCol,
    sendPacket,
} from "../dataAndFunctions.mjs";
import {wantMove} from "./wantMove.mjs";
import {simpleCanMove} from "./simpleCanMove.mjs";
import {makeVisualChanges} from "./makeVisualChanges.mjs";

// const wantPromotionWithKill = (toCol) => {
//     const pieceThatKillsId = cells[0][toCol];
//     const pieceThatKills = pieces[pieceThatKillsId];
//     changeVar(pieceThatKillsId, 'promotionKillingPieceId');
//
//     pieceThatKills.HTMLImage.style.backgroundColor = "#d5cd7f";
//     const promotionImages =
//         document.getElementsByClassName(
//         `${gameState.color}PromotionImages`,);
//     for (let image of promotionImages) {
//         image.style.display = "flex";
//     }
// }
//
// const wantPromotionWithoutKill = (toCol) => {
//     const backgroundImage = new Image(appearance.cellSize, appearance.cellSize);
//     const divBoard = document.getElementById("boardDiv");
//     const backgroundImageStyle = backgroundImage.style;
//     backgroundImageStyle.backgroundColor = "#d5cd7f";
//     backgroundImageStyle.zIndex = "5";
//     backgroundImageStyle.display = "flex";
//     backgroundImageStyle.position = "absolute";
//     backgroundImage.setAttribute("id", "backgroundImage");
//     backgroundImageStyle.width = `${appearance.cellSize}em`;
//     backgroundImageStyle.height = `${appearance.cellSize}em`;
//     backgroundImageStyle.top = `${appearance.cellSize * toRow}em`;
//     backgroundImageStyle.left = `${appearance.cellSize * toCol}em`;
//     divBoard.appendChild(backgroundImage);
//
//     changeVar(toCol, "promotionImageCol");
//     const promotionImages =
//         document.getElementsByClassName(`${gameState.color}PromotionImages`);
//     for (let image of promotionImages) {
//         image.style.display = "flex";
//     }
// }

const changePawnToAnotherPiece = (col, killPiece, pawn, promotionImage) => {
    pawn.HTMLImage.src = promotionImage.src;
    const colorLength = gameState.color.length;
    const newType = promotionImage.id.slice(colorLength).toLowerCase();
    pawn.type = newType;
    pawn.wantMove = wantMove[newType](pawn);
    pawn.canMove = function({ toRow, toCol, moveType }) {
        const check = simpleCanMove[this.type];
        const fromRow = this.row;
        const fromCol = this.col;
        return check({ fromRow, fromCol, toRow, toCol, moveType });
    }

    for (let image of document.getElementsByClassName('promotionImage')) {
        image.style.display = "none";
    }

    makeVisualChanges({
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

const onPromotion = (pawn, promotionImage) => {
    const backgroundImage = document.getElementById("backgroundImage");
    if(typeof pawn === 'number') pawn = pieces[pawn];
    // let pawn;
    // for (const piece of pieces) {
    //     if (!piece) continue;
    //     if (piece.color === gameState.oppositeColor) continue;
    //     if (piece.HTMLImage.style.backgroundColor) {
    //         pawn = piece;
    //         pawn.HTMLImage.style.removeProperty("background-color");
    //         break;
    //     }
    // }
    if (backgroundImage) {
        changePawnToAnotherPiece(pawn.col, null, pawn, promotionImage);
        backgroundImage.remove();
    } else {
        const killPiece = pieces[gameState.promotionKillingPieceId];
        changePawnToAnotherPiece(killPiece.col, killPiece, pawn, promotionImage);
    }
}

export {onPromotion}
