import {cells, changeCell, pieces, changePiecesArray} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, sendPacket, gameState, appearance,} from "../dataAndFunctions.mjs";
import {attack, checkAfterMove} from "./attack.mjs";
import {move} from "./move.mjs";
import {canPieceMove} from "./canPieceMove.mjs";

const wantMove = {
    pawn: (piece, {toRow, toColumn, killPiece}) => {
        if (piece.row !== 1) {
            const rowDifference = piece.row - toRow;
            if (toColumn === piece.column && !killPiece) {
                if (rowDifference === 1) {
                    if (!checkAfterMove({piece,toRow,toColumn,killPiece})) {
                        move({piece, toRow, toColumn, killPiece,
                            clearPosition: true});
                        return;
                    }
                }
                if (piece.row === 6 && toRow === 4 && !checkAfterMove({piece,
                    toRow, toColumn, killPiece}) && !cells[5][toColumn]) {
                    move({piece, toRow, toColumn, 
                        killPiece, clearPosition: true, passant: {id: piece.id, column: 7 - toColumn}
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
                        const killId = PieceThatKillsOnPassant.id;
                        pieces[killId].HTMLImage.remove();
                        changePiecesArray(killId, null);
                        move({
                            piece, 
                            toRow: 2, 
                            toColumn,
                            clearPosition: true,
                            dontSendPacket: true
                        });
                        changeCell(3, toColumn, undefined);
                        sendPacket('passant', {
                            pieceId: piece.id,
                            toColumn: 7 - toColumn,
                            killId,
                        })
                    } else if (!checkAfterMove({piece, toRow, toColumn, killPiece}))
                        move({piece, toRow, toColumn,
                            killPiece, clearPosition: true});
                }
            }
        } else {
            if (toColumn === piece.column && !killPiece) {
                if (!checkAfterMove({piece, toRow, toColumn, killPiece})) {
                    const backgroundImage = new Image(appearance.cellSize, appearance.cellSize);
                    const divBoard = document.getElementById("boardDiv");
                    backgroundImage.style.backgroundColor = "#d5cd7f";
                    backgroundImage.style.zIndex = "5";
                    backgroundImage.style.display = "flex";
                    backgroundImage.style.position = "absolute";
                    backgroundImage.setAttribute("id", "backgroundImage");
                    backgroundImage.style.width = `${appearance.cellSize}em`;
                    backgroundImage.style.height = `${appearance.cellSize}em`;
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
            if ((toColumn - piece.column === 1 || toColumn - piece.column === -1) && killPiece) {
                if (!checkAfterMove({piece, toRow, toColumn, killPiece})) {
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

    knight: (piece, {toRow, toColumn, killPiece}) => {
        if (canPieceMove.knight({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) &&
            !checkAfterMove({piece, toRow, toColumn, killPiece})) {
            move({piece, toRow, toColumn, killPiece});
            return true;
        }
    },

    bishop: (piece, {toRow, toColumn, killPiece}) => {
        if (canPieceMove.bishop({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) && !checkAfterMove({piece, toRow, toColumn, killPiece})) {
            move({piece, toRow, toColumn, killPiece});
            return true;
        }
    },

    rook: (piece, {toRow, toColumn, killPiece}) => {
        if (canPieceMove.rook({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) && !checkAfterMove({piece, toRow, toColumn, killPiece})) {
            if (piece.column === 0) changeVar(false, 'canCastling', 'leftRook');
            else if (piece.column === 7) changeVar(false, 'canCastling', 'rightRook');
            move({piece, toRow, toColumn, killPiece});
            return true;
        }
    },

    queen: (piece, {toRow, toColumn, killPiece}) => {
        if (canPieceMove.rook({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn})) {
            if (!checkAfterMove({piece, toRow, toColumn, killPiece})) {
                move({piece, toRow, toColumn, killPiece});
            }
        } else if (canPieceMove.bishop({fromRow: piece.row, fromColumn: piece.column,
            toRow, toColumn}) && !checkAfterMove({piece, toRow, toColumn,
            killPiece})) {
            move({piece, toRow, toColumn, killPiece});
        }
    },

    king: (piece, {toRow, toColumn, killPiece}) => {
        const rowDifference = toRow - piece.row;
        const columnDifference = toColumn - piece.column;
        if (rowDifference < 2 && rowDifference > -2 && columnDifference < 2 && columnDifference > -2) {
            if(!checkAfterMove({piece,
                toRow, toColumn, killPiece})) {
                move({piece, toRow, toColumn, killPiece});
                changeVar(toRow, "kingRow");
                changeVar(toColumn, "kingColumn");
                changeVar(false, 'canCastling', 'king');
            }
        }
        else {
            if (toRow === 7 && piece.row === 7) {
                let successfulMove;
                let moveRookToColumn;
                let rookId;
                if (columnDifference === -2) {
                    if (gameState.canCastling.leftRook && gameState.canCastling.king) {
                        for (let i = 0; i <= gameState.kingColumn; i++) {
                            if (attack({
                                color: gameState.color, toRow: 7, toColumn: i
                            })) return;
                        }
                        for (let i = 1; i <= gameState.kingColumn - 1; i++) {
                            if (cells[7][i]) return;
                        }
                        if (gameState.color === "white") {
                            rookId = 25;
                        } else {
                            rookId = 8;
                        }
                        // const rook = pieces[rookId];
                        // move({
                        //     piece: rook,
                        //     toRow: 7,
                        //     toColumn: gameState.kingColumn - 1,
                        //     clearPosition: true,
                        //     dontSendPacket: true
                        // });
                        moveRookToColumn = gameState.kingColumn - 1;
                        successfulMove = true;
                    }
                }
                else if (columnDifference === 2) {
                    if (gameState.canCastling.rightRook && gameState.canCastling.king) {
                        for (let i = gameState.kingColumn; i <= 7; i++) {
                            if (attack({
                                color: gameState.color, toRow: 7, toColumn: i
                            })) return;
                        }
                        for (let i = gameState.kingColumn + 1; i <= 6; i++) {
                            if (cells[7][i]) return;
                        }
                        if (gameState.color === "white") {
                            rookId = 32;
                        } else {
                            rookId = 1;
                        }
                        // const rook = pieces[rookId];
                        // move({
                        //     piece: rook,
                        //     toRow: 7,
                        //     toColumn: gameState.kingColumn + 1,
                        //     clearPosition: true,
                        //     dontSendPacket: true
                        // });
                        moveRookToColumn = gameState.kingColumn + 1;
                        successfulMove = true;
                    }
                }
                if(successfulMove) {
                    const rook = pieces[rookId]
                    move({
                        piece: rook,
                        toRow,
                        toColumn: moveRookToColumn,
                        clearPosition: true,
                        dontSendPacket: true
                    });
                    move({piece, toRow, toColumn,
                        clearPosition: true,
                        dontSendPacket: true,
                    });
                    changeVar(toRow, "kingRow");
                    changeVar(toColumn, "kingColumn");
                    changeVar(false, 'canCastling', 'king');
                    sendPacket('castling', {
                        rookId,
                        kingId: piece.id,
                        moveKingToColumn: 7 - toColumn,
                        moveRookToColumn: 7 - moveRookToColumn,
                    })
                }
            }
        }
        // if (canPieceMove.king({fromRow: piece.row, fromColumn: piece.column,
        //     toRow, toColumn, moveType: "withCastling"}) && !checkAfterMove({piece,
        //     toRow, toColumn, killPiece})) {
        //     changeVar(toRow, "kingRow");
        //     changeVar(toColumn, "kingColumn");
        //     move({piece, toRow, toColumn, killPiece});
        //     changeVar(undefined, 'canCastling', 'king');
    },
};

export {wantMove};
