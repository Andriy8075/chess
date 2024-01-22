import {pieces} from "../arrangePieces/arrangePieces.mjs";

const notEnoughPieces = () => {
    let allPieces = 0;
    for (const Piece of pieces) {
        if (Piece) {
            const type = Piece.type;
            if (type === "Rook" || type === "Queen" || type === "Pawn") return;
            allPieces++;
        }
    }
    if (allPieces < 4) return true;
};

export {notEnoughPieces};
