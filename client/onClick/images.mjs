import {socket, gameState} from "../data.mjs";
import {wantMove} from "../moves/wantMove.mjs";
import {move} from "../moves/move.mjs";
import {canPieceMove} from "../moves/canPieceMove.mjs";
import {pieces} from "../arrangePieces/arrangePieces.mjs";

const chooseColorImages = document.getElementsByClassName("chooseColorImages");
const promotionImages = document.getElementsByClassName("promotionImage");

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
    const changePawnToAnotherPiece = (row, column, pieceToKill) => {
        pawn.HTMLImage.src = promotionImage.src;
        const type = promotionImage.id.slice(5).toLowerCase();
        pawn.type = type;
        for (let image of promotionImages) {
            image.style.display = "none";
        }
        pawn.wantMove = wantMove[type].bind(null, pawn);
        pawn.canMove = (toRow, toColumn, moveType) => {
            if (canPieceMove[pawn.type](pawn.row, pawn.column, toRow, toColumn, moveType,)) return true;
        };
        move(pawn, row, column, pieceToKill, true, null, true);
        const packet = {
            method: "promotion",
            userId: gameState.userId,
            pawn: pawn.id,
            type: type,
            cellRow: 7 - row,
            cellColumn: 7 - column,
            opponentId: pieceToKill ? pieceToKill.id : null,
        };
        socket.send(JSON.stringify(packet));
    };
    if (backgroundImage) {
        changePawnToAnotherPiece(0, gameState.promotionImageColumn);
        backgroundImage.remove();
    } else {
        const pieceToKill = pieces[gameState.promotionKillingPieceId];
        // let cellsElement;
        // if (pawn.column > 0) {
        //     cellsElement = cells[0][pawn.column - 1];
        // }
        // let pieceToKill;
        // if (cellsElement) {
        //     const piece = pieces[cellsElement];
        //     if (piece.color === gameState.oppositeColor && piece.HTMLImage.style.backgroundColor) pieceToKill = pieces[cellsElement]; else pieceToKill = pieces[cells[0][pawn.column + 1]];
        // } else {
        //     pieceToKill = pieces[cells[0][pawn.column + 1]];
        // }
        changePawnToAnotherPiece(pieceToKill.row, pieceToKill.column, pieceToKill,);
    }
}

function onColorChoose(color) {
    if (color === "random") {
        const colorNumber = Math.random();
        if (colorNumber < 0.5) color = "white"; else color = "black";
    }
    const packet = {
        method: "chooseColor", color: color, userId: gameState.userId,
    };
    socket.send(JSON.stringify(packet));
}

const images = () => {

    for (const image of chooseColorImages) {
        image.addEventListener("click", () => {
            onColorChoose(image.id);
        });
    }

    for (const promotionImage of promotionImages) {
        promotionImage.addEventListener("click", () => {
            onPromotion(promotionImage)
        });
    }

};

export {images};
