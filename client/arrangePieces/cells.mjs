import {cellOrOpponent} from "../onClick/cellOrOpponent.mjs";
import {gameState} from "../data.mjs";

const nameCells = () => {
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            const board = document.getElementById("boardMap");
            const area = document.createElement("area");
            area.shape = "rectangle";
            area.coords = `${column * gameState.cellSize * 16},${row * gameState.cellSize * 16},
            ${(column * gameState.cellSize + gameState.cellSize) * 16},${(row * gameState.cellSize + gameState.cellSize) * 16}`;
            board.appendChild(area);
            area.row = row;
            area.column = column;
            cellOrOpponent(area);
        }
    }
};

export {nameCells};
