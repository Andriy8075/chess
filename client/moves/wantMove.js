import {cells, changeCell, pieces} from "../arrangePieces/arrangePieces.js";
import {changeVar, passant, pieceForCastlingMoved, socket, gameState,} from "../data.js";
import {checkAfterMove} from "./check.js";
import {doMove, kill} from "./doMoveAndKill.js";
import {canPieceMove} from "./canPieceMove.js";

const wantMove = {
    Pawn: (Piece, toRow, toColumn, opponentPiece) => {
        if (Piece.row !== 1) {
            const rowDifference = Piece.row - toRow;
            if (toColumn === Piece.column && !opponentPiece) {
                if (rowDifference === 1) {
                    if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                        doMove(Piece, toRow, toColumn, opponentPiece, true);
                        return;
                    }
                }
                if (Piece.row === 6 && toRow === 4 && !checkAfterMove(Piece, toRow, toColumn, opponentPiece) && !cells[5][toColumn]) {
                    doMove(Piece, toRow, toColumn, opponentPiece, true, {
                        id: Piece.id, column: 7 - toColumn,
                    });
                }
            } else {
                if (canPieceMove["Pawn"](Piece.row, Piece.column, toRow, toColumn, "killPiece",)) {
                    if (gameState.moveOnPassantExist) {
                        changeVar("moveOnPassantExist", false);
                        const PieceThatKillsOnPassant = pieces[cells[3][passant.column]];
                        kill(PieceThatKillsOnPassant.id);
                        doMove(Piece, 2, toColumn, null, true);
                        changeCell(3, toColumn, null);
                        const pocket = {
                            method: "clearArrayCellAfterPassant", userId: gameState.userId, cellColumn: 7 - toColumn,
                        };
                        socket.send(JSON.stringify(pocket));
                    } else if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) doMove(Piece, toRow, toColumn, opponentPiece, true);
                }
            }
        } else {
            if (toColumn === Piece.column && !opponentPiece) {
                if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                    const backgroundImage = new Image(gameState.cellSize, gameState.cellSize);
                    const divBoard = document.getElementById("divBoard");
                    backgroundImage.style.backgroundColor = "#d5cd7f";
                    backgroundImage.style.zIndex = "5";
                    backgroundImage.style.display = "flex";
                    backgroundImage.style.position = "absolute";
                    backgroundImage.setAttribute("id", "backgroundImage");
                    backgroundImage.style.width = `${gameState.cellSize}em`;
                    backgroundImage.style.height = `${gameState.cellSize}em`;
                    backgroundImage.style.top = `${gameState.cellSize * toRow}em`;
                    backgroundImage.style.left = `${gameState.cellSize * toColumn}em`;
                    divBoard.appendChild(backgroundImage);
                    changeVar("finishImageColumn", toColumn);
                    changeVar("finishImageRow", toRow);
                    const finishImages = document.getElementsByClassName(`${gameState.color}FinishImages`,);
                    for (let image of finishImages) {
                        image.style.display = "flex";
                    }
                }
            }
            if ((toColumn - Piece.column === 1 || toColumn - Piece.column === -1) && opponentPiece) {
                if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                    pieces[cells[0][toColumn]].HTMLImage.style.backgroundColor = "#d5cd7f";
                    const finishImages = document.getElementsByClassName(`${gameState.color}FinishImages`,);
                    for (let image of finishImages) {
                        image.style.display = "flex";
                    }
                }
            }
        }
    },

    Knight: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove["Knight"](Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            doMove(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    Bishop: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove["Bishop"](Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            doMove(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    Rook: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.Rook(Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            if (Piece.column === 0) pieceForCastlingMoved("leftRook");
            if (Piece.column === 7) pieceForCastlingMoved("rightRook");
            doMove(Piece, toRow, toColumn, opponentPiece);
            return true;
        }
    },

    Queen: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.Rook(Piece.row, Piece.column, toRow, toColumn)) {
            if (!checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
                doMove(Piece, toRow, toColumn, opponentPiece);
            }
        } else if (canPieceMove.Bishop(Piece.row, Piece.column, toRow, toColumn) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            doMove(Piece, toRow, toColumn, opponentPiece);
        }
    },

    King: (Piece, toRow, toColumn, opponentPiece) => {
        if (canPieceMove.King(Piece.row, Piece.column, toRow, toColumn, "withCastling",) && !checkAfterMove(Piece, toRow, toColumn, opponentPiece)) {
            changeVar("kingRow", toRow);
            changeVar("kingColumn", toColumn);
            doMove(Piece, toRow, toColumn, opponentPiece);
            pieceForCastlingMoved("king");
        }
    },
};

export {wantMove};
