import {cellOnClick} from "../onClick/cellOrOpponent.mjs";
import {appearance, boardSize} from "../dataAndFunctions.mjs";

const emSize = 16;
const cellSize = appearance.cellSize
const clickableCells = () => {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            console.log(cellSize);
            const board = document.getElementById("boardMap");
            const area = document.createElement("area");
            area.shape = "rectangle";
            area.coords = `${col * cellSize * emSize},
            ${row * cellSize * emSize},
            ${((col+1) * cellSize) * emSize},
            ${((row+1) * cellSize) * emSize}`;
            board.appendChild(area);
            area.row = row;
            area.col = col;
            cellOnClick(area);
        }
    }
};

export {clickableCells};
