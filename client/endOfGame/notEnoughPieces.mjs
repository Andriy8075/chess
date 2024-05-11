import {pieces} from "../arrangePieces/arrangePieces.mjs";

const piecesThatCanCheckmate = ['rook', 'queen', 'pawn']

const notEnoughPieces = () => {
    let allPieces = 0;
    for (const piece of pieces) {
        if(!piece) continue;
        allPieces++;
        const type = piece.type;
        if (piecesThatCanCheckmate.includes(type))
            return false;
    }
    const minCountOfPiecesToContinueGame = 4;
    if (allPieces < minCountOfPiecesToContinueGame) return true;
};

export {notEnoughPieces};
