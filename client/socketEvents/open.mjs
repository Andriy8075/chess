import {changeVar, gameState, socket} from "../data.mjs";

const inputAnotherPlayersIDHere = document.getElementById("inputAnotherPlayersIDHere",);
const input = document.getElementById("input");

const getID = () => {
    const userId = parseInt(Math.random().toString().slice(2));
    gameState.userId = userId;
    return userId;
};
const onOpen = () => {
    const userId = localStorage.getItem("userId");
    if (userId) changeVar(userId, "userId"); else changeVar(getID(), "userId");
    inputAnotherPlayersIDHere.style.display = "flex";
    input.style.display = "flex";
    //deleteConnectedToID();
    const yourIDLabel = document.getElementById(`id`);
    yourIDLabel.innerHTML = `Your ID: ${gameState.userId}`;
    const pocket = {
        method: "assignID", userId: gameState.userId,
    };
    socket.send(JSON.stringify(pocket));
    localStorage.removeItem("userId");
}

export {onOpen}