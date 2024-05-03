import {
    appearance, changeVar,
    display,
    gameState, inputMessageInChat,
    sendPacket,
    socket,
    unDisplay
} from "./dataAndFunctions.mjs";
import {onMessage, rematchArrangePieces} from "./socketEvents/message.mjs";
import {onOpen} from "./socketEvents/open.mjs";
import {onPromotion} from "./moves/promotion.mjs";

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
});

const inputId = htmlElements['inputId'];
inputId.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        let value = inputId.value.trim();
        if (!gameState.inGame) {
            const packet = {
                method: "connectToID", from: gameState.userId, to: value,
            };
            socket.send(JSON.stringify(packet));
        }
    }
});

const inputMessage = htmlElements['inputMessage'];
inputMessage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        let text = inputMessage.value.trim();
        inputMessage.value = '';
        inputMessageInChat(text, true);
        sendPacket('message', {text});
    }
});

const nextGame = htmlElements['nextGame'];
htmlElements['quickPlay'].addEventListener('click', () => {
    sendPacket('quickPlay', {quickPlay: gameState.quickPlay});
    if(!gameState.quickPlay) {
        nextGame.innerHTML = 'searching opponent';
        unDisplay('playWithFriend');
        const quickPlay = document.getElementById('quickPlay');
        quickPlay.textContent = 'cancel';
        quickPlay.style.backgroundColor = appearance.red;
        changeVar(true, 'quickPlay');
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
        nextGame.innerHTML = 'waiting opponent';
    }
});

htmlElements['newGame'].addEventListener('click', () => location.reload());

socket.addEventListener("open", onOpen);
socket.addEventListener("message", onMessage);

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
