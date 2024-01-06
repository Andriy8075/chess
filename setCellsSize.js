import {changeVar, vars} from "./data.js";

const board = document.getElementById('boardImage');
changeVar('cellSize', 6)
board.style.width = `${vars.cellSize}em`;
board.style.height = `${vars.cellSize}em`;