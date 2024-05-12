import { cellOnClick } from "../onClick/cellOrOpponent.mjs";
import { appearance, boardSize } from "../dataAndFunctions.mjs";

const emSize = 16;
const cellSize = appearance.cellSize;
const clickableCells = () => {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const board = document.getElementById("boardMap");
      const area = document.createElement("area");
      area.shape = "rectangle";
      area.coords = `${col * cellSize * emSize},
            ${row * cellSize * emSize},
            ${(col + 1) * cellSize * emSize},
            ${(row + 1) * cellSize * emSize}`;
      board.appendChild(area);
      area.dataset.row = row.toString();
      area.dataset.col = col.toString();
      cellOnClick(area);
    }
  }
};

export { clickableCells };
