import {cellOrOpponent} from "./cellOrOpponent.js";
import {vars} from'./data.js';

const nameCells = () => {
    for(let row = 0; row < 8; row++) {
        for(let column = 0; column < 8; column++) {
            const board = document.getElementById('boardMap');
            const area = document.createElement('area');
            area.shape = 'rectangle';
            area.coords = `${column*vars.cellSize*16},${row*vars.cellSize*16},
            ${(column*vars.cellSize+vars.cellSize)*16},${(row*vars.cellSize+vars.cellSize)*16}`
            board.appendChild(area);
            area.row = row; 
            area.column = column;
            cellOrOpponent(area);
        }
    }
}

export {nameCells};
