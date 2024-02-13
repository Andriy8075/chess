import {cellOrOpponent} from "../onClick/cellOrOpponent.mjs";
import {gameState} from "../data.mjs";

const emSize = 16;
const clickableCells = () => {
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            const board = document.getElementById("boardMap");
            const area = document.createElement("area");
            area.shape = "rectangle";
            area.coords = `${column * gameState.cellSize * emSize},${row * gameState.cellSize * emSize},
            ${(column * gameState.cellSize + gameState.cellSize) * emSize},${(row * gameState.cellSize + gameState.cellSize) * emSize}`;
            board.appendChild(area);
            area.row = row;
            area.column = column;
            cellOrOpponent(area);
        }
    }
};

export {clickableCells};
