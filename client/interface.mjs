import {changeVar, gameState, socket, appearance, startGameState} from "./data.mjs";
import {sendPacket, display, unDisplay} from "./data.mjs";
import {arrangePieces, pieces} from "./arrangePieces/arrangePieces.mjs";

const inputId = document.getElementById("inputId");
const inputMessage = document.getElementById("inputMessage");
const playWithFriend =  document.getElementById("playWithFriend");
const rematch = document.getElementById("playWithFriend");
const nextGame = document.getElementById('nextGame');
//const newGame = document.getElementById("newGame");
// const display = (...elementsId) => {
//     for(const elementId of elementsId) {
//         const element = document.getElementById(elementsId);
//         element.style.display = 'flex';
//     }
// }
// const unDisplay = (...elementsId) => {
//     for(const elementId of elementsId) {
//         const element = document.getElementById(elementsId);
//         element.style.display = 'none';
//     }
// }
playWithFriend.addEventListener('click', () => {
    unDisplay('quickPlay', 'playWithFriend');
    display('inputAnotherPlayersIDHere', 'inputId');
    const yourId = document.getElementById('yourId');
    yourId.innerHTML = `Your id: ${gameState.userId}`;
})

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
const  onRematch = () => {
    sendPacket('rematch');
    if(gameState.rematch === 'opponent') {
        rematchArrangePieces(gameState.color === 'white' ? 'black' : 'white');
        // localStorage.nextGame = 'rematch';
        // localStorage.id = gameState.userId;
        // localStorage.color = gameState.color === 'white' ? 'black' : 'white';
        // location.reload();
    }
    else {
        gameState.rematch = 'user';
        display('nextGame');
        nextGame.innerHTML = 'waiting opponent';
    }
    // if(!gameState.rematch) {
    //     for(const piece of pieces) {
    //         if(piece) piece.HTMLImage.remove();
    //     }
    //     if(gameState.quickPlay) {
    //         sendPacket('rematch')
    //     }
    //     rematch.style.backgroundColor = appearance.red;
    //     rematch.textContent = 'cancel';
    //     changeVar('user', 'rematch')
    // }
    // else if(gameState.rematch === 'user') {
    //     if(gameState.quickPlay) {
    //         sendPacket('rematch')
    //     }
    //     rematch.style.backgroundColor = appearance.green;
    //     rematch.textContent = 'rematch';
    // }
    // else {
    //     if(gameState.quickPlay) {
    //         sendPacket('rematch')
    //     }
    //     if(gameState.color === 'white') arrangePieces('white');
    //     else arrangePieces('black');
    // }
}
const onInputMessage = (event) => {
    if (event.key === 'Enter') {
        let text = inputMessage.value.trim();
        const message = document.createElement('p');
        message.innerHTML = `You: ${text}`;
        message.style.display = 'flex';
        message.style.lineHeight = '0em';
        const messagesField = document.getElementById('chatMessages');
        messagesField.appendChild(message);
        sendPacket('message', {text})
        // const packet = {
        //     method: 'message',
        //     userId: gameState.userId,
        //     message,
        // }
        // socket.send(JSON.stringify(packet));
    }
}
const onInputId = (event) => {
    if (event.key === 'Enter') {
        let value = inputId.value.trim();
        if (!gameState.inGame) {
            const packet = {
                method: "connectToID", from: gameState.userId, to: value,
            };
            socket.send(JSON.stringify(packet));
        }
    }
}
const onExit = () => {
    //localStorage.setItem("userId", gameState.userId);
    location.reload();
}

const onQuickPlay = () => {
    const packet = {
        method: 'quickPlay',
        userId: gameState.userId,
        quickPlay: gameState.quickPlay,
    }
    socket.send(JSON.stringify(packet));
    if(!gameState.quickPlay) {
        nextGame.innerHTML = 'searching opponent';
        unDisplay('playWithFriend');
        const quickPlay = document.getElementById('quickPlay');
        quickPlay.textContent = 'cancel';
        quickPlay.style.backgroundColor = appearance.red;
        changeVar(true, 'quickPlay');
    }
}

export {onInputId, onInputMessage, onExit, onQuickPlay, display, unDisplay, onRematch, rematchArrangePieces}