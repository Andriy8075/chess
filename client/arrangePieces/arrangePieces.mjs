import {ownPieceOnClick} from "../onClick/ownPieceOnClick.mjs";
import {clickableCells} from "./cells.mjs";
import {appearance, changeVar, gameState,
    countOfPieces, boardSize} from "../dataAndFunctions.mjs";
import {opponentOnClick} from "../onClick/cellOrOpponent.mjs";
import {Piece} from "./piece.mjs";
import { defineKing } from "../endOfGame/checkmate.mjs";

let cells;

const changeCell = (row, col, input) => {
    cells[row][col] = input;
};

let pieces = [];
const changePiecesArray = (id, input) => {
    pieces[id] = input;
};

const arrangePieces = (color) => {

    changeVar(true, "inGame");

    changeVar(color, "color");
    let order;
    let pieceID;
    let changePieceID;

    if (color === 'white') {
        order = ["rook", "knight", "bishop", "queen",
            "king", "bishop", "knight", "rook",];
        changeVar("black", "oppositeColor");
        changeVar(true, "turnToMove");
        pieceID = 1;
        changePieceID = () => pieceID++;
        changeVar(boardSize - 1,
            "kingRow");
        changeVar(4, "kingCol");
        changeVar(29, "kingId");
    } else {
        order = ["rook", "knight", "bishop", "king",
            "queen", "bishop", "knight", "rook",];
        changeVar("white", "oppositeColor");
        pieceID = countOfPieces;
        changePieceID = () => pieceID--;
        changeVar(boardSize - 1,
            "kingRow");
        changeVar(3, "kingCol");
        changeVar(5, "kingId");
        defineKing();
    }

    cells = [];
    for (let i = 0; i < boardSize; i++) {
        cells[i] = [];
        cells[i].length = boardSize;
    }

    const createElement = (record) => {

        const board = document.getElementById("pieces");
        const pieceImage =
            document.createElement("img");
        pieceImage.classList.add("piece");
        pieceImage.style.position = "absolute";
        const { row, col } = record;
        pieceImage.style.top = `${appearance.cellSize*row}em`;
        pieceImage.style.left = `${appearance.cellSize*col}em`;
        pieceImage.style.width = `${appearance.cellSize}em`;
        pieceImage.style.heigh = `${appearance.cellSize}em`;
        board.appendChild(pieceImage);

        const { type, ownPiece } = record;
        const pieceColor = ownPiece ? gameState.color : gameState.oppositeColor;
        pieceImage.src = `images/${pieceColor}${type.charAt(0).toUpperCase() + 
            type.slice(1)}.png`;

        const piece = new Piece({
            HTMLImage: pieceImage,
            id: pieceID,
            color: pieceColor,
            type, row, col
        });

        cells[row][col] = pieceID;
        changePiecesArray(pieceID, piece);
        if (ownPiece) {
            ownPieceOnClick(pieceImage, piece.id);
        }
        else {
            opponentOnClick(piece);
        }
        changePieceID();
    };

    {
        const rowOfOpponentPiecesInOrder = 0;
        for (let col = 0; col < boardSize; col++) {
            createElement({
                color: gameState.oppositeColor,
                type: order[col],
                row: rowOfOpponentPiecesInOrder,
                col,
                ownPiece: false,
            });
        }
    }

    {
        const rowOfOpponentPawns = 1;
        for (let col = 0; col < boardSize; col++) {
            createElement({
                color: gameState.oppositeColor,
                type: "pawn",
                row: rowOfOpponentPawns,
                col,
                ownPiece: false,
            });
        }
    }

    {
        const rowOfOwnPawns = 6;
        for (let col = 0; col < boardSize; col++) {
            createElement({
                color: gameState.color,
                type: "pawn",
                row: rowOfOwnPawns,
                col,
                ownPiece: true,
            });
        }
    }


    {
        const rowOfOwnPiecesInOrder = 7;
        for (let col = 0; col < boardSize; col++) {
            createElement({
                color: gameState.color,
                type: order[col],
                row: rowOfOwnPiecesInOrder,
                col,
                ownPiece: true,
            });
        }
    }

    const images =
        document.getElementsByClassName("chooseColorImages");
    for (const image of images) {
        image.style.display = "none";
    }
    clickableCells();
    defineKing();
};

export {cells, pieces, changeCell, changePiecesArray, arrangePieces};
