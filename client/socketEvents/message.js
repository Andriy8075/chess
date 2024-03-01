import {arrangePieces, changeCell, changePiecesArray, pieces} from "../arrangePieces/arrangePieces.mjs";
import {appearance, changeVar, gameState, sendPacket} from "../dataAndFunctions.mjs";
import {notEnoughPieces} from "../endOfGame/notEnoughPieces.mjs";
import {attack} from "../moves/attack.mjs";
import {checkmate} from "../endOfGame/checkmate.mjs";
import {stalemate} from "../endOfGame/stalemate.mjs";
import {clear, repeatingTheSameMoves, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";
import {display, unDisplay} from "../dataAndFunctions.mjs";
import {rematchArrangePieces} from "../mainClientScript.mjs";

const writeGameResultText = (text) => {
    const textField = document.getElementById("gameResult");
    textField.style.display = 'block';
    if(!textField.innerHTML) textField.innerHTML = text;
    changeVar(false, "turnToMove");
    display('rematch', 'newGame');
};

const endGame = (method, text) => {
    writeGameResultText(text);
    sendPacket(method, {text: text});
};

const move = ({pieceId, toRow, toColumn, killId, passant: setPassant, clearPosition}) => {
    const piece = pieces[pieceId];
    piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
    piece.HTMLImage.style.left = `${appearance.cellSize * toColumn}em`;
    changeCell(toRow, toColumn, piece.id);
    changeCell(piece.row, piece.column, undefined);
    piece.row = toRow;
    piece.column = toColumn;
    if(killId) {
        pieces[killId].HTMLImage.remove();
        pieces[killId] = null;
    }
    if(!setPassant) {
        changeVar(undefined, 'passant', 'column');
        changeVar(undefined, 'passant', 'id');
    }
    else {
        changeVar(setPassant.id, 'passant', 'id');
        changeVar(setPassant.column, 'passant', 'column');
    }
    if (clearPosition) {
        clear();
    }
    else {
        writeDownPosition();
    }
}

const checkForEndOfGame = () => {
    if (notEnoughPieces()) {
        endGame("notEnoughPieces", "You have a draw. Reason: not enough pieces to continue game");
        return;
    }
    if (repeatingTheSameMoves()) {
        endGame("repeatingTheSameMoves", "You have a draw. Reason: repeating the same moves");
        return;
    }
    const attackingPiece = attack({
        color: gameState.color, toRow: gameState.kingRow, toColumn: gameState.kingColumn});
    if(attackingPiece) {
        if (checkmate(attackingPiece)) {
            endGame("win", "You have checkmate and lost");
        }
    }
    else {
        if (stalemate()) {
            endGame("stalemate", "You have a draw. Reason: stalemate");
        }
    }
    changeVar(true, "turnToMove");
}
const methods = {
    rematch: () => {
        if(gameState.rematch === 'user') {
            rematchArrangePieces(gameState.color === 'white' ? 'black' : 'white');
        }
        else {
            gameState.rematch = 'opponent';
            const nextGame = document.getElementById('nextGame')
            display('nextGame');
            nextGame.innerHTML = 'opponent wants rematch';
        }
    },
    move: ({pieceId, toRow, toColumn, killId, passant, clearPosition}) => {
        move({pieceId, toRow, toColumn, killId,
            passant, clearPosition});
        checkForEndOfGame();
        // const piece = pieces[pieceId];
        // piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
        // piece.HTMLImage.style.left = `${appearance.cellSize * toColumn}em`;
        // changeCell(toRow, toColumn, piece.id);
        // changeCell(piece.row, piece.column, undefined);
        // piece.row = toRow;
        // piece.column = toColumn;
        // if(kill) {
        //     pieces[kill].HTMLImage.remove();
        //     pieces[kill] = null;
        // }
        // if(!passant) {
        //     changeVar(undefined, 'passant', 'column');
        //     changeVar(undefined, 'passant', 'id');
        // }
        // else {
        //     changeVar(passant.id, 'passant', 'id');
        //     changeVar(passant.column, 'passant', 'column');
        // }
        // if (notEnoughPieces()) {
        //     endGame("notEnoughPieces", "You have a draw. Reason: not enough pieces to continue game",);
        //     return;
        // }
        // const attackingPiece = attack({
        //     color: gameState.color, toRow: gameState.kingRow, toColumn: gameState.kingColumn});
        // if(attackingPiece) {
        //     if (checkmate(attackingPiece)) {
        //         endGame("win", "You have checkmate and lost");
        //         return;
        //     }
        // }
        // else {
        //     if (stalemate()) {
        //         endGame("stalemate", "You have a draw. Reason: stalemate");
        //         return;
        //     }
        // }
        // if (clearPosition) {
        //     clear();
        // }
        // else {
        //     writeDownPosition();
        //     const end = repeatingTheSameMoves();
        //     if (end) {
        //         endGame("repeatingTheSameMoves", "You have a draw. Reason: repeating the same moves",);
        //     }
        // }
        // changeVar(true, "turnToMove");
    },
    connectToID: ({color, userId}) => {
        changeVar(true, "inGame");
        display('chat');
        if(color) {
            const quickGame = document.getElementById('quickPlay');
            quickGame.style.display = 'none';
            const nextGame = document.getElementById('nextGame');
            nextGame.style.display = 'none';
            arrangePieces(color);
        }
        else {
            const labelConnectTo = document.getElementById(`connected`);
            labelConnectTo.innerHTML = `You are connected to player with id ${userId}`;
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
    receiveColor: ({color}) => {
        arrangePieces(color);
    },
    disconnect: () => {
        writeGameResultText("Your opponent disconnected, so you win");
        const nextGame = document.getElementById('nextGame');
        nextGame.innerHTML = 'your opponent disconnected';
        nextGame.style.display = 'block';
        unDisplay('rematch');
    },
    passant: ({pieceId, toColumn, killId}) => {
        const passantRow = 4;
        changeCell(passantRow, toColumn, undefined);
        pieces[killId].HTMLImage.remove();
        changePiecesArray(killId, null);
        move({pieceId, toRow: 5, toColumn, clearPosition: true});
        checkForEndOfGame();
    },
    promotion: ({pawnId, type, src, toColumn, killId}) => {
        const pawn = pieces[pawnId];
        pawn.type = type;
        pawn.HTMLImage.src = src;
        move({
            pieceId: pawnId,
            toRow: 7,
            toColumn,
            killId: killId,
            clearPosition: true,
        });
        checkForEndOfGame();
    },
    castling: ({rookId, kingId, moveKingToColumn, moveRookToColumn}) => {
        move({
            pieceId: rookId,
            toRow: 0,
            toColumn: moveRookToColumn,
            clearPosition: true
        });
        move({
            pieceId: kingId,
            toRow: 0,
            toColumn: moveKingToColumn,
            clearPosition: true
        });
        checkForEndOfGame();
    },
    message: ({text}) => {
        const message = document.createElement('p');
        message.innerHTML = `Opponent: ${text}`;
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