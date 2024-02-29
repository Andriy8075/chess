import {changeVar, socket, appearance, gameState, sendPacket, unDisplay, display, startGameState} from "./dataAndFunctions.mjs";
import {onOpen} from "./socketEvents/open.mjs";
import {onMessage} from "./socketEvents/message.js";
import {arrangePieces, pieces} from "./arrangePieces/arrangePieces.mjs";
import {onPromotion} from "./arrangePieces/promotion.mjs";

changeVar(appearance.cellSize, "cellSize");

const getHTMLElements = (elementsId) => {
    const elements = {};
    for(const elementId of elementsId) {
        const element = document.getElementById(elementId);
        elements[elementId] = element;
    }
    return elements;
}

const htmlElementsId = ['nextGame', 'inputId', 'playWithFriend', 'newGame',
    'quickPlay', 'inputMessage', 'rematch'];
const htmlElements = getHTMLElements(htmlElementsId);
htmlElements['playWithFriend'].addEventListener('click', () => {
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

socket.addEventListener("open", onOpen);
socket.addEventListener("message", onMessage);

htmlElements['inputId'].addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        let value = htmlElements['inputId'].value.trim();
        if (!gameState.inGame) {
            const packet = {
                method: "connectToID", from: gameState.userId, to: value,
            };
            socket.send(JSON.stringify(packet));
        }
    }
});
htmlElements['quickPlay'].addEventListener('click', () => {
    sendPacket('quickPlay', {quickPlay: gameState.quickPlay});
    if(!gameState.quickPlay) {
        htmlElements['nextGame'].innerHTML = 'searching opponent';
        unDisplay('playWithFriend');
        const quickPlay = document.getElementById('quickPlay');
        quickPlay.textContent = 'cancel';
        quickPlay.style.backgroundColor = appearance.red;
        changeVar(true, 'quickPlay');
    }
});
htmlElements['inputMessage'].addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        let text = htmlElements['inputMessage'].value.trim();
        const message = document.createElement('p');
        message.innerHTML = `You: ${text}`;
        message.style.display = 'flex';
        message.style.lineHeight = '0em';
        const messagesField = document.getElementById('chatMessages');
        messagesField.appendChild(message);
        sendPacket('message', {text});
    }
});
htmlElements['rematch'].addEventListener('click', () => {
    sendPacket('rematch');
    if(gameState.rematch === 'opponent') {
        rematchArrangePieces(gameState.color === 'white' ? 'black' : 'white');
    }
    else {
        gameState.rematch = 'user';
        display('nextGame');
        htmlElements['nextGame'].innerHTML = 'waiting opponent';
    }
});

htmlElements['newGame'].addEventListener('click', () => location.reload());

const chooseColorImages = document.getElementsByClassName("chooseColorImages");
const promotionImages = document.getElementsByClassName("promotionImage");

const onColorChoose = (color) => {
    if (color === "random") {
        const colorNumber = Math.random();
        if (colorNumber < 0.5) color = "white"; else color = "black";
    }
    sendPacket('chooseColor', {color});
}

for (const image of chooseColorImages) {
    image.addEventListener("click", () => {
        onColorChoose(image.id);
    });
}

for (const promotionImage of promotionImages) {
    promotionImage.addEventListener("click", () => {
        onPromotion(promotionImage);
    });
}

export {rematchArrangePieces}
