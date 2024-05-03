import {arrangePieces, changeCell, changePiecesArray, pieces} from "../arrangePieces/arrangePieces.mjs";
import {
    appearance,
    changeVar,
    gameState, inputMessageInChat,
    sendPacket,
    startGameState
} from "../dataAndFunctions.mjs";
import {notEnoughPieces} from "../endOfGame/notEnoughPieces.mjs";
import {attack} from "../moves/attackAndCheck.mjs";
import {checkmate} from "../endOfGame/checkmate.mjs";
import {stalemate} from "../endOfGame/stalemate.mjs";
import {clear, repeatingTheSameMoves, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";
import {display, unDisplay} from "../dataAndFunctions.mjs";

const rematchArrangePieces = (color) => {
    for(const piece of pieces) {
        if(piece) piece.HTMLImage.remove();
    }
    for(const key of Object.keys(gameState)) {
        changeVar(startGameState[key], gameState[key]);
    }
    arrangePieces(color);
    for(const button of document.getElementsByClassName('gameManageButtons')) {
        button.style.display = 'none';
    }
    unDisplay('nextGame', 'gameResult');
    changeVar(undefined, 'rematch');
}
const writeGameResultText = (text) => {
    const textField = document.getElementById("gameResult");
    textField.style.display = 'block';
    if(!textField.innerHTML) textField.innerHTML = text;
    changeVar(false, "turnToMove");
    changeVar(false, "inGame");
    display('rematch', 'newGame');
};

const endGame = (method, text) => {
    writeGameResultText(text);
    sendPacket(method, {text: text});
};

const move = ({pieceId, toRow, toCol, killId, passant: setPassant, clearPosition}) => {
    const piece = pieces[pieceId];
    const PieceStyle = piece.HTMLImage.style;
    PieceStyle.top = `${appearance.cellSize * toRow}em`;
    PieceStyle.left = `${appearance.cellSize * toCol}em`;
    changeCell(toRow, toCol, piece.id);
    changeCell(piece.row, piece.col, undefined);
    piece.row = toRow;
    piece.col = toCol;
    if(killId) {
        const pieceToKill = pieces[killId];
        pieceToKill.HTMLImage.remove();
        changePiecesArray(killId, null);
        //pieces[killId] = null;
    }
    if(!setPassant) {
        changeVar(undefined, 'passant', 'col');
        changeVar(undefined, 'passant', 'id');
    }
    else {
        changeVar(setPassant.id, 'passant', 'id');
        changeVar(setPassant.col, 'passant', 'col');
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
        color: gameState.color,
        toRow: gameState.kingRow,
        toCol: gameState.kingCol
    });
    if(attackingPiece) {
        changeVar(attackingPiece, 'attackingPiece');
        if (checkmate()) {
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
            nextGame.innerHTML = 'opponent wants a rematch';
        }
    },
    move: ({pieceId, toRow, toCol, killId, passant, clearPosition}) => {
        move({pieceId, toRow, toCol, killId, passant, clearPosition});
        checkForEndOfGame();
    },
    connectToID: ({color}) => {
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
            labelConnectTo.innerHTML = `You are connected to player with id ${gameState.userId}`;
            const images = document.getElementsByClassName("chooseColorImages");
            for (const image of images) {
                image.style.display = "flex";
            }
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
        unDisplay('rematch');
        if(gameState.inGame) {
            writeGameResultText("Your opponent disconnected, so you win");
        }
        else {
            const nextGame = document.getElementById('nextGame');
            nextGame.innerHTML = 'your opponent disconnected';
            nextGame.style.display = 'block';
        }
    },
    passant: ({pieceId, toCol, killId}) => {
        const rowOfOwnPiece = 4;
        const enemyPieceMovesToRow = 5;

        changeCell(rowOfOwnPiece, toCol, undefined);
        const pieceToKill = pieces[killId];
        pieceToKill.HTMLImage.remove();
        changePiecesArray(killId, null);

        move({
            pieceId,
            toRow: enemyPieceMovesToRow,
            toCol,
            clearPosition: true
        });
        checkForEndOfGame();
    },
    promotion: ({pawnId, type, src, toCol, killId}) => {
        const pawn = pieces[pawnId];
        pawn.type = type;
        pawn.HTMLImage.src = src;

        move({
            pieceId: pawnId,
            toRow: 7,
            toCol,
            killId,
            clearPosition: true,
        });
        checkForEndOfGame();
    },
    castling: ({rookId, kingId, moveKingToCol, moveRookToCol}) => {
        move({
            pieceId: rookId,
            toRow: 0,
            toCol: moveRookToCol,
            clearPosition: true
        });
        move({
            pieceId: kingId,
            toRow: 0,
            toCol: moveKingToCol,
            clearPosition: true
        });
        checkForEndOfGame();
    },
    message: ({text}) => {
        inputMessageInChat(text);
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

export {onMessage, rematchArrangePieces}
