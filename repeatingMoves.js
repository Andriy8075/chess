import {pieces} from './arrangePieces.js'

let previousMoves = [];

const writeDownPosition = () => {
    let move = [];
    for (const piece of pieces) {
        let pieceInfo;
        if (piece){
            pieceInfo = {
                id: piece.id,
                row: piece.row,
                column: piece.column,
            }
        }
        else {
            pieceInfo = null;
        }
        move.push(pieceInfo);
    }
    previousMoves.push(move);
}

const clear = () => {
    previousMoves = [];
}

function shallowEqual(object1, object2) {
    if(object1 && object2) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
    
        if (keys1.length !== keys2.length) {
        return;
        }
    
        for (let key of keys1) {
            if (object1[key] !== object2[key]) {
                return;
            }
        }
    
        return true;
    }
    else if(object1 === object2) return true;
}

const compareArrays = (array1, array2) => {
    if(array1 && array2) {
        for(let j = 0; j < array1.length; j++) {
            if(!shallowEqual(array1[j], array2[j])) return;
        }
        return true;
    }
    else if(array1 === array2) return true;
}

const draw = () => {
    const currentMove = previousMoves[previousMoves.length-1];
    let theSameMoves = -1;
    for(let i = 1; i <= previousMoves.length; i++) {
        if (compareArrays(currentMove, previousMoves[i])) theSameMoves++;
    }
    if(theSameMoves >= 2) return true;
}

 export {writeDownPosition, clear, draw};