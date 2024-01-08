import {ownPieces} from './ownPieces.js';
import {nameCells} from './cells.js';
import {vars, changeVar} from './data.js';
import {cellOrOpponent} from './cellOrOpponent.js';
import {Piece} from './piece.js';

let cells;

const changeCell = (row, column, input) =>{
    cells[row][column] = input;
}

let pieces = [];
const changePiecesArray = (id, input) => {
    pieces[id] = input;
}

const arrangePieces = (color) => {

    changeVar('color', color);
    let order;
    let pieceID;
    let changePieceID;
    if (vars.color === 'white') {
        order = ['Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Bishop', 'Knight', 'Rook'];
        changeVar('oppositeColor', 'black');
        changeVar('movePossibility', true);
        pieceID = 1;
        changePieceID = ()  => pieceID++;
        changeVar('kingRow', 7);
        changeVar('kingColumn', 4);
        changeVar('kingID', 29);
    }
    else {
        order = ['Rook', 'Knight', 'Bishop', 'King', 'Queen', 'Bishop', 'Knight', 'Rook'];
        changeVar('oppositeColor', 'white');
        pieceID = 32;
        changePieceID = ()  => pieceID--;
        changeVar('kingRow', 7);
        changeVar('kingColumn', 3);
        changeVar('kingID', 5);
    }

    cells = [];
    for (let i = 0; i < 8; i++) {
        cells[i] = [];
        cells[i].length = 8;
    }

    const createElement = (color, type, row, column, opponent) => {
        const board = document.getElementById('pieces');
        const pieceImage = document.createElement('img');
        pieceImage.classList.add('piece');
        pieceImage.style.position = 'absolute';
        pieceImage.style.top = `${vars.cellSize*row}em`;
        pieceImage.style.left = `${vars.cellSize*column}em`;
        pieceImage.style.width = `${vars.cellSize}em`;
        pieceImage.style.heigh = `${vars.cellSize}em`;
        board.appendChild(pieceImage);
        pieceImage.src = `pictures/${color}${type}.png`;
        const piece = new Piece(pieceImage, pieceID, color, type, row, column);
        cells[row][column] = pieceID;
        changePiecesArray(pieceID, piece);
        if (opponent) {
            cellOrOpponent(piece);
        }
        else {
            ownPieces(pieceImage, piece.id);
        }
        changePieceID();
    }

    for (let column = 0; column < 8; column++) {
        createElement(vars.oppositeColor, order[column], 0, column, true);
    }
    for (let column = 0; column < 8; column++) {
        createElement(vars.oppositeColor, 'Pawn', 1, column, true);
    }
    for (let column = 0; column < 8; column++) {
        createElement(vars.color, 'Pawn', 6, column, false);
    }
    for (let column = 0; column < 8; column++) {
        createElement(vars.color,  order[column], 7, column, false);
    }
    const images= document.getElementsByClassName('chooseColorImages');
    for (const image of images) {
        image.style.display = 'none';
    }
    nameCells();
}

export {cells, arrangePieces, pieces, changeCell, changePiecesArray};