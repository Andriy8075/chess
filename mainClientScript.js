import {arrangePieces, changeCell, pieces} from "./arrangePieces.js";
import {socket, setPassant, vars, changeVar, getID}
 from './data.js';
import {checkmateOrStalemate} from './checkmateOrStalemate.js';
import {notEnoughPieces} from "./notEnoughPieces.js";
import {images} from "./images.js";
import {clear, writeDownPosition, draw} from './repeatingMoves.js';
import {makeMove} from "./moves.js";

const CHAR_RETURN = 13;
const inputAnotherPlayersIDHere = document.getElementById('inputAnotherPlayersIDHere');
let connectedToID;


const board = document.getElementById('boardImage');
changeVar('cellSize', 6);
board.style.width = `${8*vars.cellSize}em`;
board.style.height = `${8*vars.cellSize}em`;
const writeGameResultText = (text) => {
    const textField = document.getElementById('gameResult');
    textField.innerHTML = text;
    changeVar('movePossibility', false);
    changeVar('inGame', false);
    deleteConnectedToID();
}

const endTheGame = (method, text) => {
    writeGameResultText(text);
    const pocket = {
        method: method,
        ID: vars.ID,
        text: text,
    }
    socket.send(JSON.stringify(pocket));
}

const deleteConnectedToID = () => {
    changeVar('connectedToID', null);
    const pocket = {
        method: 'deleteConnectedToID',
    }
    socket.send(JSON.stringify(pocket));
}

socket.addEventListener('open', () => {
    const ID = localStorage.getItem("ID");
    if(ID) changeVar('ID', ID);
    else changeVar('ID', getID());
    inputAnotherPlayersIDHere.style.display = 'flex';
    input.style.display = 'flex';
    deleteConnectedToID();
    const pocket = {
        method: 'assignID',
        ID: vars.ID,
    };
    socket.send(JSON.stringify(pocket));
    localStorage.removeItem('ID');
});
const move = (parsed) => {
    const piece = pieces[parsed.pieceId];
    piece.HTMLImage.style.top = `${vars.cellSize*(parsed.cellRow)}em`;
    piece.HTMLImage.style.left = `${vars.cellSize*(parsed.cellColumn)}em`;
    changeCell(parsed.cellRow, parsed.cellColumn, pieces[parsed.pieceId].id);
    changeCell(pieces[parsed.pieceId].row, pieces[parsed.pieceId].column, null);
    piece.row = (parsed.cellRow);
    piece.column = (parsed.cellColumn);
    setPassant(parsed.passant);
    changeVar('movePossibility', true);
    if(parsed.clear) clear();
    else {
        writeDownPosition();
        const end = draw();
        if(end) {
            endTheGame('repeatingTheSameMoves', 'You have a draw. Reason: repeating the same moves');
        }
    }
    const end = checkmateOrStalemate();
    if (end) {
        if (end === 'checkmate') {
            endTheGame('win', 'You have checkmate and lost');
        }
        if (end === 'stalemate') {
            endTheGame('stalemate', 'You have a draw. Reason: stalemate');
        }
    }
    if(notEnoughPieces()) {
        endTheGame('notEnoughPieces',
            'You have a draw. Reason: not enough pieces to continue game');
    }
}
const kil = (parsed) => {
    pieces[parsed.pieceId].HTMLImage.remove();
    pieces[parsed.pieceId] = null;
}

socket.addEventListener('message', ({data}) => {
    const parsed = JSON.parse(data);
    switch (parsed.method) {
        case 'makeMove':
            move(parsed);
            break;
        case 'kill':
            pieces[parsed.pieceId].HTMLImage.remove();
            pieces[parsed.pieceId] = null;
            break;
        case 'assignID':
            const yourIDLabel = document.getElementById(`id`);
            yourIDLabel.innerHTML = `Your ID: ${parsed.ID}`;
            break;
        case 'connectToID':
            if(!vars.inGame) {
                const labelConnectTo = document.getElementById(`connected`);
                labelConnectTo.innerHTML = `You are connected to player with ID ${parsed.ID}`;
                connectedToID = parsed.ID;
                const images= document.getElementsByClassName('chooseColorImages');
                for (const image of images) {
                    image.style.display = 'flex';
                }
                changeVar('inGame', true);
            }
            break;
        case 'receiveColor':
            arrangePieces(parsed.color);
            break;
        case 'disconnect':
            writeGameResultText('Your opponent disconnected, so you win');
            break;
        case 'clearArrayCellAfterPassant':
            changeCell(4, parsed.cellColumn, null);
            break;    
        case 'changePawnToPiece':
            const pawn = pieces[parsed.pawn];
            pawn.type = parsed.type;
            pawn.HTMLImage.src = `pictures/${vars.oppositeColor}${parsed.type}.png`;
            if(parsed.opponentId) {
                kil({
                    pieceId: parsed.opponentId,
                })
            }
            move({
                    method: 'makeMove',
                    ID: vars.ID,
                    pieceId: pawn.id,
                    cellRow: parsed.cellRow,
                    cellColumn: parsed.cellColumn,
                    clear: true,
                    passant: null,
                })
            break;
        case 'win':
            writeGameResultText('You win by making checkmate');
            break;
        default:
            if(parsed.text) {
                writeGameResultText(parsed.text);
            }
    }
})

const input = document.getElementById('input');
input.addEventListener('keydown', (event) => {
    if (event.keyCode === CHAR_RETURN) {
        let value = input.value.trim();
        if(!vars.inGame) {
            const pocket = {
                method: 'connectToID',
                from: vars.ID,
                to: value,
            };
            socket.send(JSON.stringify(pocket));
        }
    }
});

const exit = document.getElementById('exit');
exit.addEventListener('click', () => {
    localStorage.setItem("ID", vars.ID);
    location.reload();
})

images();




