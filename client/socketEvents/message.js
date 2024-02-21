import {arrangePieces, changeCell, changePiecesArray, pieces} from "../arrangePieces/arrangePieces.mjs";
import {appearance, changeVar, gameState, socket} from "../data.mjs";
import {notEnoughPieces} from "../endOfGame/notEnoughPieces.mjs";
import {attack} from "../moves/check.mjs";
import {checkmate} from "../endOfGame/checkmate.mjs";
import {stalemate} from "../endOfGame/stalemate.mjs";
import {clear, repeatingTheSameMoves, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";
import {display, unDisplay} from "../data.mjs";
import {rematchArrangePieces} from "../interface.mjs";

const writeGameResultText = (text) => {
    const textField = document.getElementById("gameResult");
    textField.style.display = 'block';
    if(!textField.innerHTML) textField.innerHTML = text;
    changeVar(false, "moveOrder");
    display('rematch', 'newGame');
};

const endGame = (method, text) => {
    writeGameResultText(text);
    const packet = {
        method: method, userId: gameState.userId, text: text,
    };
    socket.send(JSON.stringify(packet));
};

const methods = {
    rematch: () => {
        if(gameState.rematch === 'user') {
            rematchArrangePieces(gameState.color === 'white' ? 'black' : 'white');
            // localStorage.id = gameState.userId;
            // localStorage.nextGame = 'rematch';
            // localStorage.color = gameState.color === 'white' ? 'black' : 'white';
            // location.reload();
        }
        else {
            gameState.rematch = 'opponent';
            const nextGame = document.getElementById('nextGame')
            display('nextGame');
            nextGame.innerHTML = 'opponent wants rematch';
        }
    },
    move: (parsedData) => {
        const piece = pieces[parsedData.pieceId];

        piece.HTMLImage.style.top = `${appearance.cellSize * parsedData.cellRow}em`;
        piece.HTMLImage.style.left = `${appearance.cellSize * parsedData.cellColumn}em`;
        changeCell(parsedData.cellRow, parsedData.cellColumn, pieces[parsedData.pieceId].id);
        changeCell(pieces[parsedData.pieceId].row, pieces[parsedData.pieceId].column, null);
        piece.row = parsedData.cellRow;
        piece.column = parsedData.cellColumn;
        if(parsedData.kill) {
            pieces[parsedData.kill].HTMLImage.remove();
            pieces[parsedData.kill] = null;
        }
        if(!parsedData.passant) {
            changeVar(undefined, 'passant', 'column');
            changeVar(undefined, 'passant', 'id');
        }
        else {
            changeVar(parsedData.passant.id, 'passant', 'id');
            changeVar(parsedData.passant.column, 'passant', 'column');
        }
        //setPassant(parsed.passant);
        changeVar(true, "moveOrder");
        if (notEnoughPieces()) {
            endGame("notEnoughPieces", "You have a draw. Reason: not enough pieces to continue game",);
            return;
        }
        const attackingPiece = attack(gameState.color, gameState.kingRow, gameState.kingColumn, null);
        if(attackingPiece) {
            if (checkmate(attackingPiece)) {
                endGame("win", "You have checkmate and lost");
                return;
            }
        }
        else {
            if (stalemate()) {
                endGame("stalemate", "You have a draw. Reason: stalemate");
                return;
            }
        }
        if (parsedData.clear) {
            clear();
        }
        else {
            writeDownPosition();
            const end = repeatingTheSameMoves();
            if (end) {
                endGame("repeatingTheSameMoves", "You have a draw. Reason: repeating the same moves",);
            }
        }
        //move(parsed);
    },
    // kill: () => {
    //     pieces[parsed.pieceId].HTMLImage.remove();
    //     pieces[parsed.pieceId] = null;
    // },
    // assignID: () => {
    //     const yourIDLabel = document.getElementById(`id`);
    //     yourIDLabel.innerHTML = `Your ID: ${parsed.userId}`;
    // },
    connectToID: (parsedData) => {
        changeVar(true, "inGame");
        display('chat');
        if(parsedData.color) {
            const quickGame = document.getElementById('quickPlay');
            quickGame.style.display = 'none';
            const nextGame = document.getElementById('nextGame');
            nextGame.style.display = 'none';
            arrangePieces(parsedData.color);
        }
        else {
            const labelConnectTo = document.getElementById(`connected`);
            labelConnectTo.innerHTML = `You are connected to player with id ${parsedData.userId}`;
            //connectedToID = parsed.userId;
            const images = document.getElementsByClassName("chooseColorImages");
            for (const image of images) {
                image.style.display = "flex";
            }
            changeVar(true, "inGame");
        }
    },
    cancelNextGame: () => {
        display('playWithFriend')
        unDisplay('nextGame');
        const quickPlay = document.getElementById('quickPlay');
        quickPlay.textContent = 'quick play';
        quickPlay.style.backgroundColor = appearance.green;
        changeVar(false, 'quickPlay');
    },
    receiveColor: (parsedData) => {
        arrangePieces(parsedData.color);
    },
    disconnect: () => {
        writeGameResultText("Your opponent disconnected, so you win");
        const nextGame = document.getElementById('nextGame');
        nextGame.innerHTML = 'your opponent disconnected';
        nextGame.style.display = 'block';
        unDisplay('rematch');
    },
    killOnPassant: (parsedData) => {
        const passantRow = 4;
        changeCell(passantRow, parsedData.cellColumn, null);
        pieces[parsedData.pieceId].HTMLImage.remove();
        changePiecesArray(parsedData.pieceId, null);
    },
    promotion: (parsedData) => {
        const pawn = pieces[parsedData.pawn];
        pawn.type = parsedData.type;
        pawn.HTMLImage.src = `images/${gameState.oppositeColor}${parsedData.type}.png`;
        if (parsedData.opponentId) {
            pieces[parsedData.opponentId].HTMLImage.remove();
            pieces[parsedData.opponentId] = null;
        }
        methods.move({
            method: "doMove",
            userId: gameState.userId,
            pieceId: pawn.id,
            cellRow: parsedData.cellRow,
            cellColumn: parsedData.cellColumn,
            clear: true,
        });
    },
    message: (parsedData) => {
        const message = document.createElement('p');
        message.innerHTML = `Opponent: ${parsedData.text}`;
        message.style.display = 'flex';
        message.style.lineHeight = '0em';
        const messagesField = document.getElementById('chatMessages');
        messagesField.appendChild(message);
    },
    win: () => {
        writeGameResultText("You win by making checkmate");
    },
}
const onMessage = ({data}) => {
    const parsed = JSON.parse(data);
    const method = methods[parsed.method];
    if (method) method(parsed);
    else if (parsed.text) {
        writeGameResultText(parsed.text);
    }
}
export {onMessage}