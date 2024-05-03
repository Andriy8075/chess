import {pieces} from "../arrangePieces/arrangePieces.mjs";

const notEnoughPieces = () => {
    let allPieces = 0;
    for (const piece of pieces) {
        if(!piece) continue;
        const type = piece.type;
        if (type === "rook" || type === "queen" || type === "pawn")
            return false;
        allPieces++;
    }
    if (allPieces < 4) return true;
};

export {notEnoughPieces};
