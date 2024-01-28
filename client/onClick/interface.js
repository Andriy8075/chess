import {gameState, socket} from "../data.mjs";

const input = document.getElementById("input");
//const exit = document.getElementById("exit");
const onInput = (event) => {
    if (event.key === 'Enter') {
        let value = input.value.trim();
        if (!gameState.inGame) {
            const pocket = {
                method: "connectToID", from: gameState.userId, to: value,
            };
            socket.send(JSON.stringify(pocket));
        }
    }
}
const onExit = () => {
    localStorage.setItem("userId", gameState.userId);
    location.reload();
}

export {onInput, onExit}