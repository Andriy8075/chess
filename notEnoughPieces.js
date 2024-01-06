import {pieces} from './arrangePieces.js';
const notEnoughPieces = () => {
    let allPieces = 0;
    let whitePieces = 0;
    let blackPieces = 0;
    for (const Piece of pieces) {
        if (Piece) {
            const type = Piece.type;
            if (type === ('Rook' || 'Queen' || 'Pawn')) return;
            allPieces++;
            if (Piece.color === white) whitePieces++;
            else blackPieces++;
        }
    }
    return true;
}

export {notEnoughPieces};