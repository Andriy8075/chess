import {socket, vars} from './data.js';
import {makeMove, moves, canPieceMove} from './moves.js';
import {pieces, cells} from './arrangePieces.js'
const images = () => {
    const chooseColorImages = document.getElementsByClassName('chooseColorImages');
    const finishImages = document.getElementsByClassName('finishImage');
    function onColorChoose(color) {
        if (color === 'random') {
            const colorNumber = Math.random();
            if (colorNumber < 0.5) color = 'white';
            else color = 'black'
        }
        const pocket = {
            method: 'chooseColor',
            color: color,
            ID: vars.ID,
        }
        socket.send(JSON.stringify(pocket));
    }

    for (const finishImage of finishImages) {
        finishImage.addEventListener('click', () => {
            const backgroundImage = document.getElementById('backgroundImage');
            let pawn;
            for(const piece of pieces) {
                if(piece) {
                    if(piece.color === vars.color && piece.HTMLImage.style.backgroundColor) {
                        pawn = piece;
                        pawn.HTMLImage.style.removeProperty("background-color");
                        break;
                    }
                }
            }
            const changePawnToAnotherPiece = () => {
                pawn.HTMLImage.src = finishImage.src;
                const type = finishImage.id.slice(5);
                pawn.type = type;
                for (let image of finishImages) {
                    image.style.display = 'none';
                }
                pawn.wantMove = moves[type].bind(null, pawn);
                pawn.canMove = (toRow, toColumn, moveType) => {
                    if(canPieceMove[pawn.type](pawn.row, pawn.column, toRow, toColumn, moveType)) return true;
                }

                const pocket = {
                    method: 'changePawnToPiece',
                    ID: vars.ID,
                    pawn: pawn.id,
                    type: type,
                }
                socket.send(JSON.stringify(pocket));
            }
            if (backgroundImage) {
                makeMove(pawn, backgroundImage.top, backgroundImage.left, null);
                changePawnToAnotherPiece();
                backgroundImage.remove();
            }
            else {
                let cellsElement
                if(pawn.column > 0) {
                    cellsElement = cells[0][pawn.column-1];
                }
                let pieceToKill;
                if(cellsElement) {
                    const isBackgroundColor = pieces[cellsElement].HTMLImage.style.backgroundColor;
                    if (isBackgroundColor) pieceToKill = pieces[cellsElement];
                    else pieceToKill = pieces[cells[0][pawn.column+1]];
                }
                else {
                    pieceToKill = pieces[cells[0][pawn.column+1]];
                }
                makeMove(pawn, pieceToKill.row, pieceToKill.column, pieceToKill);
                changePawnToAnotherPiece();
            }
        })
    }
    for (const image of chooseColorImages) {
        image.addEventListener( 'click', () => {
            onColorChoose(image.id);
        })
    }
}

export {images};