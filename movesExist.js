import { checkAfterMove } from "./moves.js";
import {pieces, cells} from './arrangePieces.js';
import {vars} from './data.js'

const canMoveTo = (Piece, rowMoveTo, columnMoveTo) => {
    if (!cells[rowMoveTo][columnMoveTo]) {
        if(!checkAfterMove(Piece, rowMoveTo, columnMoveTo, null)) {
            return 'makeMove exist';
        } 
    }
    else {
        let enemyPiece = pieces[cells[rowMoveTo][columnMoveTo]];
        if (enemyPiece.color === vars.oppositeColor) {
            if (!checkAfterMove(Piece, rowMoveTo, columnMoveTo, enemyPiece)) return 'makeMove exist';
        }
    }
}

const movesExist = {
    Rook: (piece, column, row) => {
        if (column > 0) {
            if (canMoveTo(piece, row, column - 1)) {
                return 'makeMove exist';
            }
        }
        if (column < 7) {
            if (canMoveTo(piece, row, column + 1)){
                return 'makeMove exist';
            }
        }
        if (row > 0) {
            if (canMoveTo(piece, row - 1, column)){
                return 'makeMove exist';
            }
        }
        if (row < 7) {
            if (canMoveTo(piece, row + 1, column)) {
                return 'makeMove exist';
            }
        }
    },
    Bishop: (piece, column, row) => {
        if (column > 0 && row > 0){
            if (canMoveTo(piece, row - 1, column - 1)){
                return 'makeMove exist';
            }
        }
        if (column < 7 && row > 0) {
            if (canMoveTo(piece, row - 1, column + 1)){
                return 'makeMove exist';
            }
        }
        if (column > 0 && row < 7){
            if (canMoveTo(piece, row + 1, column - 1)){
                return 'makeMove exist';
            }
        }

        if (column < 7 && row < 7){
            if (canMoveTo(piece, row + 1, column + 1)){
                return 'makeMove exist';
            }
        }
    },
    Pawn: (piece, column, row) => {
        if (!cells[row-1][column] && !checkAfterMove(
            piece, row-1, column, null)) return 'makeMove exist';
        const enemyPiece = pieces[cells[row-1][column-1]];
        if (column > 0 && cells[row-1][column-1]) {
            if (pieces[cells[row-1][column-1]].color === vars.oppositeColor){
                if (!checkAfterMove(piece, row-1, column-1, enemyPiece)) return 'makeMove exist';
            }
        }
        if (column < 7 && cells[row-1][column+1]) {
            if (pieces[cells[row-1][column+1]].color === vars.oppositeColor){
                if (!checkAfterMove(piece, row-1, column+1, enemyPiece)) return 'makeMove exist';
            }
        }
    },

    Knight: (piece, column, row) => {
        if (column > 0) {
            if (row > 1)
                if (canMoveTo(piece, row - 2, column - 1)) return 'makeMove exist';
            if (row < 6)
                if (canMoveTo(piece, row + 2, column - 1)) return 'makeMove exist';
            if (column > 1) {
                if (row > 0)
                    if (canMoveTo(piece, row - 1, column - 2))
                        return 'makeMove exist';
                if (row < 7)
                    if (canMoveTo(piece, row + 1, column - 2))
                        return 'makeMove exist';
            }
        }
        if (column < 7) {
            if (row > 1)
                if (canMoveTo(piece, row - 2, column + 1)) return 'makeMove exist';
            if (row < 6)
                if (canMoveTo(piece, row + 2, column + 1)) return 'makeMove exist';
            if (column < 6) {
                if (row > 0)
                    if (canMoveTo(piece, row - 1, column + 2))
                        return 'makeMove exist';
                if (row < 7)
                    if (canMoveTo(piece, row + 1, column + 2))
                        return 'makeMove exist';
            }
        }
    },

    Queen: (piece, column, row) => {
        if(movesExist.Rook(piece, column, row)) return true;
        if(movesExist.Bishop(piece, column, row)) return true;
    },

    King: (piece, column, row) => {
        if(movesExist.Rook(piece, column, row)) return true;
        if(movesExist.Bishop(piece, column, row)) return true;
    },
}

export {movesExist};