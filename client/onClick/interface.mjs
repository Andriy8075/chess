import {gameState, socket} from "../data.mjs";

const input = document.getElementById("input");
//const exit = document.getElementById("exit");
const onInput = (event) => {
    if (event.key === 'Enter') {
        let value = input.value.trim();
        if (!gameState.inGame) {
            const packet = {
                method: "connectToID", from: gameState.userId, to: value,
            };
            socket.send(JSON.stringify(packet));
        }
    }
}
const onExit = () => {
    localStorage.setItem("userId", gameState.userId);
    location.reload();
}

const onQuickPlay = () => {
    const packet = {
        method: 'quickPlay',
        userId: gameState.userId,
    }
    socket.send(JSON.stringify(packet));
    const searchingOpponent = document.getElementById('searchingOpponent');
    searchingOpponent.style.display='flex';
}

export {onInput, onExit, onQuickPlay}