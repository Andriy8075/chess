import {cells, changeCell, pieces, changePiecesArray} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, socket, gameState, appearance,} from "../data.mjs";
import {checkAfterMove} from "./check.mjs";
import {move} from "./move.mjs";
import {canPieceMove} from "./canPieceMove.mjs";

const wantMove = {
    pawn: (Piece, toRow, toColumn, opponentPiece) => {
        if (Piece.row !== 1) {
            const rowDifference = Piece.row - toRow;
            if (toColumn === Piece.column && !opponentPiece) {
                if (rowDifference === 1) {
                    if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                        move(Piece, toRow, toColumn, opponentPiece, true);
                        return;
                    }
                }
                if (Piece.row === 6 && toRow === 4 && !checkAfterMove(Piece, toRow, toColumn, opponentPiece) && !cells[5][toColumn]) {
                    move(Piece, toRow, toColumn, opponentPiece, true, {
                        id: Piece.id, column: 7 - toColumn,
                    });
                }
            } else {
                if (canPieceMove.pawn(Piece.row, Piece.column, toRow, toColumn, "killPiece",)) {
                    if (gameState.moveOnPassantExist) {
                        changeVar(false, "moveOnPassantExist");
                        const PieceThatKillsOnPassant = pieces[cells[3][gameState.passant.column]];
                        const killId = PieceThatKillsOnPassant.id
                        pieces[killId].HTMLImage.remove();
                        changePiecesArray(killId, null);
                        //kill(PieceThatKillsOnPassant.id);
                        move(Piece, 2, toColumn, null, true);
                        changeCell(3, toColumn, null);
                        const packet = {
                            method: "killOnPassant",
                            userId: gameState.userId,
                            cellColumn: 7 - toColumn,
                            pieceId: killId,
                        };
                        socket.send(JSON.stringify(packet));
                    } else if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) move(Piece, toRow, toColumn, opponentPiece, true);
                }
            }
        } else {
            if (toColumn === Piece.column && !opponentPiece) {
                if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                    const backgroundImage = new Image(appearance.cellSize, appearance.cellSize);
                    const divBoard = document.getElementById("divBoard");
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
            if ((toColumn - Piece.column === 1 || toColumn - Piece.column === -1) && opponentPiece) {
                if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                    const pieceThatKills = pieces[cells[0][toColumn]];
                    changeVar(pieceThatKills.id, 'promotionKillingPieceId');
                    pieceThatKills.HTMLImage.style.backgroundColor = "#d5cd7f";
                    const promotionImages = document.getElementsByClassName(`${gameState.color}PromotionImages`,);
                    for (let image of promotionImages) {
                        image.style.display = "flex";
                    }
                }
            }
        }
    },

    knight: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.knight(Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            move(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    bishop: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.bishop(Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            move(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    rook: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.rook(Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            if (Piece.column === 0) changeVar(undefined, 'canCastling', 'leftRook');
            else if (Piece.column === 7) changeVar(undefined, 'canCastling', 'rightRook');
            move(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    queen: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.rook(Piece.row, Piece.column, toRow, toColumn)) {
            if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                move(Piece, toRow, toColumn, opponentPiece);
            }
        } else if (canPieceMove.bishop(Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            move(Piece, toRow, toColumn, opponentPiece);
        }
    },

    king: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.king(Piece.row, Piece.column, toRow, toColumn, "withCastling",) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            changeVar(toRow, "kingRow");
            changeVar(toColumn, "kingColumn");
            move(Piece, toRow, toColumn, opponentPiece);
            changeVar(undefined, 'canCastling', 'king');
        }
    },
};

export {wantMove};
