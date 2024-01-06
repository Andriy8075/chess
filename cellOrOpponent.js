import {vars} from './data.js';
import {pieces} from './arrangePieces.js';
import {Piece} from './piece.js';

const cellOrOpponent = (cellOrOpponent) => {
    const moveOnClick = (isItPiece) => {
        if (vars.movePossibility) {
            if(vars.choosedPiece) {
                const pieceThatMoves = pieces[vars.choosedPiece];
                pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, isItPiece ? cellOrOpponent : null);
            }
            changeVar('choosedPiece', null );
        }
    }
    let isItPiece;
    if (cellOrOpponent instanceof Piece) {
        isItPiece = true;
        cellOrOpponent.HTMLImage.addEventListener('click', () => { 
            if (vars.movePossibility) {
                if(vars.choosedPiece) {
                    const pieceThatMoves = pieces[vars.choosedPiece];
                    pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, cellOrOpponent);
                }
            }
        });
    }
    else {
        cellOrOpponent.addEventListener('click', ()=> {
            if (vars.movePossibility) {
                if(vars.choosedPiece) {
                    const pieceThatMoves = pieces[vars.choosedPiece];
                    pieceThatMoves.wantMove(cellOrOpponent.row, cellOrOpponent.column, null);
                }
            }
        });
    }
}

export {cellOrOpponent};