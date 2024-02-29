import {changeVar, gameState, socket, display, unDisplay} from "../dataAndFunctions.mjs";
import {arrangePieces} from "../arrangePieces/arrangePieces.mjs";

const getID = () => {
    const userId = parseInt(Math.random().toString().slice(2));
    gameState.userId = userId;
    return userId;
};
const onOpen = () => {
    unDisplay('connectionError');
    if(localStorage.getItem('nextGame') === 'rematch') {
        changeVar(localStorage.getItem('id'), "userId");
        changeVar(localStorage.getItem('color'), "color");
        arrangePieces(gameState.color);
        localStorage.removeItem('id');
        localStorage.removeItem('color');
        localStorage.removeItem('nextGame');
    }
    else {
        changeVar(getID(), "userId");
        const packet = {
            method: "assignID", userId: gameState.userId,
        };
        socket.send(JSON.stringify(packet));
        display('quickPlay');
        display('playWithFriend');
    }
}

export {onOpen}