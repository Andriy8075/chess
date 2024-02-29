import {cells, changeCell, pieces, changePiecesArray} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, sendPacket, gameState, appearance,} from "../dataAndFunctions.mjs";
import {checkAfterMove} from "./attack.mjs";
import {move} from "./move.mjs";
import {canPieceMove} from "./canPieceMove.mjs";

const wantMove = {
    pawn: (piece, {toRow, toColumn, killingPiece}) => {
        if (piece.row !== 1) {
            const rowDifference = piece.row - toRow;
            if (toColumn === piece.column && !killingPiece) {
                if (rowDifference === 1) {
                    if (!checkAfterMove({piece,toRow,toColumn,killingPiece})) {
                        move({piece, toRow, toColumn, killingPiece,
                            clearPosition: true});
                        return;
                    }
                }
                if (piece.row === 6 && toRow === 4 && !checkAfterMove({piece,
                    toRow, toColumn, killingPiece}) && !cells[5][toColumn]) {
                    move({piece, toRow, toColumn, killingPiece,
                        clearPosition: true, passant: {id: piece.id, column: 7 - toColumn}
                });
                }
            } else {
                if (canPieceMove.pawn({
                    fromRow: piece.row,
                    fromColumn: piece.column,
                    toRow, toColumn,
                    moveType: "killPiece",})) {
                    if (gameState.moveOnPassantExist) {
                        changeVar(false, "moveOnPassantExist");
                        const PieceThatKillsOnPassant = pieces[cells[3][gameState.passant.column]];
                        const killId = PieceThatKillsOnPassant.id
                        pieces[killId].HTMLImage.remove();
                        changePiecesArray(killId, null);
                        move({piece, toRow: 2, toColumn,
                            clearPosition: true});
                        changeCell(3, toColumn, null);
                        sendPacket('killOnPassant', {
                            toColumn: 7 - toColumn,
                            pieceId: killId,
                        })
                    } else if (!checkAfterMove({piece, toRow, toColumn, killingPiece}))
                        move({piece, toRow, toColumn, killingPiece,
                            clearPosition: true});
                }
            }
        } else {
            if (toColumn === piece.column && !killingPiece) {
                if (!checkAfterMove({piece, toRow, toColumn, killingPiece})) {
                    const backgroundImage = new Image(appearance.cellSize, appearance.cellSize);
                    const divBoard = document.getElementById("boardDiv");
                    backgroundImage.style.backgroundColor = "#d5cd7f";
                    backgroundImage.style.zIndex = "5";
                    backgroundImage.style.display = "flex";
                    backgroundImage.style.position = "absolute";
                    backgroundImage.setAttribute("id", "backgroundImage");
                    backgroundImage.style.width = `${appearance.cellSize}`;
                    backgroundImage.style.height = `${appearance.cellSize}`;
                    backgroundImage.style.top = `${appearance.cellSize * toRow}em`;
                    backgroundImage.style.left = `${appearance.cellSize * toColumn}em`;
                    divBoard.appendChild(backgroundImage);
                    changeVar(toColumn, "promotionImageColumn");
                    const promotionImages =
                        document.getElementsByClassName(`${gameState.color}PromotionImages`,);
                    for (let image of promotionImages) {
                        image.style.display = "flex";
                    }
                }
            }
            if ((toColumn - piece.column === 1 || toColumn - piece.column === -1) && killingPiece) {
                if (!checkAfterMove({piece, toRow, toColumn, killingPiece})) {
                    const pieceThatKills = pieces[cells[0][toColumn]];
                    changeVar(pieceThatKills.id, 'promotionKillingPieceId');
                    pieceThatKills.HTMLImage.style.backgroundColor = "#d5cd7f";
                    const promotionImages = document.getElementsByClassName(
                        `${gameState.color}PromotionImages`,);
                    for (let image of promotionImages) {
                        image.style.display = "flex";
                    }
                }
            }
        }
    },

    knight: (piece, {toRow, toColumn, killingPiece}) => {
        if (canPieceMove.knight({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) &&
            !checkAfterMove({piece, toRow, toColumn, killingPiece})) {
            move({piece, toRow, toColumn, killingPiece});
            return true;
        }
    },

    bishop: (piece, {toRow, toColumn, killingPiece}) => {
        if (canPieceMove.bishop({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) && !checkAfterMove({piece, toRow, toColumn, killingPiece})) {
            move({piece, toRow, toColumn, killingPiece});
            return true;
        }
    },

    rook: (piece, {toRow, toColumn, killingPiece}) => {
        if (canPieceMove.rook({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) && !checkAfterMove({piece, toRow, toColumn, killingPiece})) {
            if (piece.column === 0) changeVar(undefined, 'canCastling', 'leftRook');
            else if (piece.column === 7) changeVar(undefined, 'canCastling', 'rightRook');
            move({piece, toRow, toColumn, killingPiece});
            return true;
        }
    },

    queen: (piece, {toRow, toColumn, killingPiece}) => {
        if (canPieceMove.rook({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn})) {
            if (!checkAfterMove({piece, toRow, toColumn, killingPiece})) {
                move({piece, toRow, toColumn, killingPiece});
            }
        } else if (canPieceMove.bishop({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) && !checkAfterMove({piece, toRow, toColumn,
            killingPiece})) {
            move({piece, toRow, toColumn, killingPiece});
        }
    },

    king: (piece, {toRow, toColumn, killingPiece}) => {
        if (canPieceMove.king({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn, moveType: "withCastling"}) && !checkAfterMove({piece,
            toRow, toColumn, killingPiece})) {
            changeVar(toRow, "kingRow");
            changeVar(toColumn, "kingColumn");
            move({piece, toRow, toColumn, killingPiece});
            changeVar(undefined, 'canCastling', 'king');
        }
    },
};

export {wantMove};
