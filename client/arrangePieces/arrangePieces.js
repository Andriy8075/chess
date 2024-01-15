import {ownPieces} from "../onClick/ownPieces.js";
import {nameCells} from "./cells.js";
import {changeVar, gameState} from "../data.js";
import {cellOrOpponent} from "../onClick/cellOrOpponent.js";
import {Piece} from "./piece.js";

let cells;

const changeCell = (row, column, input) => {
    cells[row][column] = input;
};

let pieces = [];
const changePiecesArray = (id, input) => {
    pieces[id] = input;
};

const arrangePieces = (color) => {
    changeVar("color", color);
    let order;
    let pieceID;
    let changePieceID;
    if (gameState.color === "white") {
        order = ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook",];
        changeVar("oppositeColor", "black");
        changeVar("movePossibility", true);
        pieceID = 1;
        changePieceID = () => pieceID++;
        changeVar("kingRow", 7);
        changeVar("kingColumn", 4);
        changeVar("kingID", 29);
    } else {
        order = ["Rook", "Knight", "Bishop", "King", "Queen", "Bishop", "Knight", "Rook",];
        changeVar("oppositeColor", "white");
        const countOfPieces = 32;
        pieceID = countOfPieces;
        changePieceID = () => pieceID--;
        changeVar("kingRow", 7);
        changeVar("kingColumn", 3);
        changeVar("kingID", 5);
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
        pieceImage.src = `pictures/${color}${type}.png`;
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
        createElement(gameState.oppositeColor, "Pawn", 1, column, true);
    }
    for (let column = 0; column < 8; column++) {
        createElement(gameState.color, "Pawn", 6, column, false);
    }
    for (let column = 0; column < 8; column++) {
        createElement(gameState.color, order[column], 7, column, false);
    }
    const images = document.getElementsByClassName("chooseColorImages");
    for (const image of images) {
        image.style.display = "none";
    }
    nameCells();
};

export {cells, arrangePieces, pieces, changeCell, changePiecesArray};
