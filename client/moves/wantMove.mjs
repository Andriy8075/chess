import {cells, changeCell, pieces,
    changePiecesArray} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, sendPacket, gameState, appearance,
    maxRowAndCol, passantRow, rookIds} from "../dataAndFunctions.mjs";
import {canMoveWithoutOpeningCheck, checkAfterMove} from "./attackAndCheck.mjs";
import {makeVisualChanges} from "./makeVisualChanges.mjs";
import {simpleCanMove} from "./simpleCanMove.mjs";

const wantMove = (piece) => ({toRow, toCol}) => {
    const canMove = canMoveWithoutOpeningCheck({piece, toRow, toCol});
    if(canMove) {
        const specificMove = typeof canMove === 'object';
        makeVisualChanges({piece, toRow, toCol,
            specifies: specificMove ? canMove : undefined,
            sendPacket: true,
        });
    }
}
// const wantMove = {
//     pawn: (piece) => ({toRow, toCol, killPiece}) => {
//         if (piece.row !== 1) {
//             if(piece.col - toCol) {
//                 const canMove = simpleCanMove.pawn({
//                     fromRow: piece.row,
//                     fromCol: piece.col,
//                     toRow, toCol,
//                     moveType: 'withKill',
//                 })
//                 if(canMove) {
//                     if (gameState.moveOnPassantExist) {
//                         changeVar(false, "moveOnPassantExist");
//                         const PieceThatKillsOnPassantId =
//                             cells[passantRow+1][gameState.passant.col];
//                         const PieceThatKillsOnPassant =
//                             pieces[PieceThatKillsOnPassantId];
//                         PieceThatKillsOnPassant.HTMLImage.remove();
//                         changePiecesArray(PieceThatKillsOnPassantId, null);
//                         changeCell(passantRow+1, toCol, undefined);
//                         makeVisualChanges({
//                             piece,
//                             toRow: passantRow,
//                             toCol,
//                             clearPosition: true,
//                             dontSendPacket: true
//                         });
//                         sendPacket('passant', {
//                             pieceId: piece.id,
//                             toCol: maxRowAndCol - toCol,
//                             killId: PieceThatKillsOnPassantId,
//                         })
//                     } else if (!checkAfterMove({
//                         piece, toRow, toCol, killPiece
//                     }))
//                         makeVisualChanges({piece, toRow, toCol, killPiece,
//                             clearPosition: true});
//                 }
//             }
//             else {
//                 const canMove = simpleCanMove.pawn({
//                     fromRow: piece.row,
//                     fromCol: piece.col,
//                     toRow, toCol,
//                     moveType: 'withoutKill',
//                 })
//                 if(canMove) {
//                     if(!checkAfterMove({
//                         piece, toRow, toCol
//                     }))
//                     makeVisualChanges({piece, toRow, toCol,
//                         clearPosition: true,
//                         passant: (piece.row - toRow === 2) ? {
//                             id: piece.id,
//                             col: 7 - piece.col,
//                         } : null,
//                     });
//                 }
//             }
//         } else {
//             if (toCol === piece.col && !killPiece && !checkAfterMove({piece, toRow, toCol})) {
//                 const backgroundImage =
//                     new Image(appearance.cellSize, appearance.cellSize);
//                 const divBoard = document.getElementById("boardDiv");
//                 const backgroundImageStyle = backgroundImage.style;
//                 backgroundImageStyle.backgroundColor = "#d5cd7f";
//                 backgroundImageStyle.zIndex = "5";
//                 backgroundImageStyle.display = "flex";
//                 backgroundImageStyle.position = "absolute";
//                 backgroundImage.setAttribute("id", "backgroundImage");
//                 backgroundImageStyle.width = `${appearance.cellSize}em`;
//                 backgroundImageStyle.height = `${appearance.cellSize}em`;
//                 backgroundImageStyle.top = `${appearance.cellSize * toRow}em`;
//                 backgroundImageStyle.left = `${appearance.cellSize * toCol}em`;
//                 divBoard.appendChild(backgroundImage);
//
//                 changeVar(toCol, "promotionImageCol");
//                 const promotionImages =
//                     document.getElementsByClassName(`${gameState.color}PromotionImages`);
//                 for (let image of promotionImages) {
//                     image.style.display = "flex";
//                 }
//             }
//             else if ((toCol - piece.col === 1 || toCol - piece.col === -1)
//                 && killPiece && !checkAfterMove({piece, toRow, toCol, killPiece})) {
//                 const pieceThatKillsId = cells[0][toCol];
//                 const pieceThatKills = pieces[pieceThatKillsId];
//                 changeVar(pieceThatKillsId, 'promotionKillingPieceId');
//
//                 pieceThatKills.HTMLImage.style.backgroundColor = "#d5cd7f";
//                 const promotionImages =
//                     document.getElementsByClassName(
//                     `${gameState.color}PromotionImages`,);
//                 for (let image of promotionImages) {
//                     image.style.display = "flex";
//                 }
//             }
//         }
//     },
//
//     knight: (piece) => ({toRow, toCol, killPiece}) => {
//         if (piece.canMove({toRow, toCol, moveType: "makeCheckForOurKing"}) &&
//             !checkAfterMove({piece, toRow, toCol, killPiece})) {
//             makeVisualChanges({piece, toRow, toCol, killPiece});
//             return true;
//         }
//         return false;
//     },
//
//     bishop: (piece) => ({toRow, toCol, killPiece}) => {
//         if (piece.canMove({toRow, toCol, moveType: "makeCheckForOurKing"}) &&
//             !checkAfterMove({piece, toRow, toCol, killPiece})) {
//             makeVisualChanges({piece, toRow, toCol, killPiece});
//             return true;
//         }
//         return false;
//     },
//
//     rook: (piece) => ({toRow, toCol, killPiece}) => {
//         if (piece.canMove({toRow, toCol, moveType: "makeCheckForOurKing"}) &&
//             !checkAfterMove({piece, toRow, toCol, killPiece})) {
//             if (piece.col === 0) changeVar(false, 'canCastling', 'leftRook');
//             else if (piece.col === maxRowAndCol) changeVar(false, 'canCastling', 'rightRook');
//             makeVisualChanges({piece, toRow, toCol, killPiece});
//             return true;
//         }
//         return false;
//     },
//
//     queen: (piece) => ({toRow, toCol, killPiece}) => {
//         if (piece.canMove({toRow, toCol, moveType: "makeCheckForOurKing"}) &&
//             !checkAfterMove({piece, toRow, toCol, killPiece})) {
//             makeVisualChanges({piece, toRow, toCol, killPiece});
//             return true;
//
//         }
//         return false;
//     },
//
//     king: (piece) => ({toRow, toCol, killPiece}) => {
//         const commonMove = simpleCanMove.king({
//             fromRow: piece.row,
//             fromCol: piece.col,
//             toRow, toCol,
//         });
//         if(commonMove) {
//             const isCheckAfterMove = checkAfterMove({piece,
//                 toRow, toCol, killPiece});
//             if(!isCheckAfterMove) {
//                 makeVisualChanges({piece, toRow, toCol, killPiece});
//                 changeVar(toRow, "kingRow");
//                 changeVar(toCol, "kingCol");
//                 changeVar(false, 'canCastling', 'king');
//             }
//         }
//         else {
//             if(!killPiece) {
//                 return simpleCanMove.king({
//                     piece, toRow, toCol,
//                     moveType: 'castling',
//                 })
//             }
//         }
//     },
// };

export {wantMove};
