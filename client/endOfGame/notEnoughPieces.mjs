import {pieces} from "../arrangePieces/arrangePieces.mjs";

const notEnoughPieces = () => {
    let allPieces = 0;
    for (const Piece of pieces) {
        if (Piece) {
            const type = Piece.type;
            if (type === "rook" || type === "queen" || type === "pawn") return;
            allPieces++;
        }
    }
    if (allPieces < 4) return true;
};

export {notEnoughPieces};
