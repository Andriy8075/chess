import {cellOrOpponent} from "./cellOrOpponent.js";
import {vars} from'./data.js';

const nameCells = () => {
    for(let row = 0; row < 8; row++) {
        for(let column = 0; column < 8; column++) {
            const board = document.getElementById('boardMap');
            const area = document.createElement('area');
            area.shape = 'rectangle';
            area.coords = `${column*vars.cellSize},${row*vars.cellSize},${column*vars.cellSize+vars.cellSize},${row*vars.cellSize+vars.cellSize}`
            board.appendChild(area);
            area.row = row; 
            area.column = column;
            cellOrOpponent(area);
        }
    }
}

export {nameCells};
