import {ownPieces} from "../onClick/ownPieces.mjs";
import {clickableCells} from "./cells.mjs";
import {changeVar, gameState} from "../data.mjs";
import {cellOrOpponent} from "../onClick/cellOrOpponent.mjs";
import {Piece} from "./piece.mjs";

let cells;

const changeCell = (row, column, input) => {
    cells[row][column] = input;
};

let pieces = [];
const changePiecesArray = (id, input) => {
    pieces[id] = input;
};

const arrangePieces = (color) => {

    changeVar(color, "color");
    let order;
    let pieceID;
    let changePieceID;
    if (gameState.color === "white") {
        order = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook",];
        changeVar("black", "oppositeColor");
        changeVar(true, "moveOrder");
        pieceID = 1;
        changePieceID = () => pieceID++;
        changeVar(7, "kingRow");
        changeVar(4, "kingColumn");
        changeVar(29, "kingID");
    } else {
        order = ["rook", "knight", "bishop", "king", "queen", "bishop", "knight", "rook",];
        changeVar("white", "oppositeColor");
        const countOfPieces = 32;
        pieceID = countOfPieces;
        changePieceID = () => pieceID--;
        changeVar(7, "kingRow");
        changeVar(3, "kingColumn");
        changeVar(5, "kingID");
    }

    cells = [];
    for (let i = 0; i < 8; i++) {
        cells[i] = [];
        cells[i].length = 8;
    }

    const createElement = (color, type, row, column, opponent) => {
        const board = document.getElementById("pieces");
        const pieceImage = document.createElement("img");
        pieceImage.classList.add("piece");
        pieceImage.style.position = "absolute";
        pieceImage.style.top = `${gameState.cellSize * row}em`;
        pieceImage.style.left = `${gameState.cellSize * column}em`;
        pieceImage.style.width = `${gameState.cellSize}em`;
        pieceImage.style.heigh = `${gameState.cellSize}em`;
        board.appendChild(pieceImage);
        pieceImage.src = `images/${color}${type.charAt(0).toUpperCase() + type.slice(1)}.png`;
        const piece = new Piece(pieceImage, pieceID, color, type, row, column);
        cells[row][column] = pieceID;
        changePiecesArray(pieceID, piece);
        if (opponent) {
            cellOrOpponent(piece);
        } else {
            ownPieces(pieceImage, piece.id);
        }
        changePieceID();
    };

    for (let column = 0; column < 8; column++) {
        createElement(gameState.oppositeColor, order[column], 0, column, true);
    }
    for (let column = 0; column < 8; column++) {
        createElement(gameState.oppositeColor, "pawn", 1, column, true);
    }
    for (let column = 0; column < 8; column++) {
        createElement(gameState.color, "pawn", 6, column, false);
    }
    for (let column = 0; column < 8; column++) {
        createElement(gameState.color, order[column], 7, column, false);
    }
    const images = document.getElementsByClassName("chooseColorImages");
    for (const image of images) {
        image.style.display = "none";
    }
    clickableCells();
};

export {cells, arrangePieces, pieces, changeCell, changePiecesArray};
