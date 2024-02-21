import {cellOrOpponent} from "../onClick/cellOrOpponent.mjs";
import {appearance} from "../data.mjs";

const emSize = 16;
const clickableCells = () => {
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            const board = document.getElementById("boardMap");
            const area = document.createElement("area");
            area.shape = "rectangle";
            area.coords = `${column * appearance.cellSize * emSize},${row * appearance.cellSize * emSize},
            ${(column * appearance.cellSize + appearance.cellSize) * emSize},${(row * appearance.cellSize + appearance.cellSize) * emSize}`;
            board.appendChild(area);
            area.row = row;
            area.column = column;
            cellOrOpponent(area);
        }
    }
};

export {clickableCells};
