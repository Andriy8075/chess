import {wantMove} from "../moves/wantMove.mjs";
import {canPieceMove} from "../moves/canPieceMove.mjs";

class Piece {
    constructor(HTMLImage, id, color, type, row, column) {
        this.id = id;
        this.HTMLImage = HTMLImage;
        this.type = type;
        this.color = color;
        this.row = row;
        this.column = column;
        this.wantMove = wantMove[type].bind(null, this);
    }

    canMove(toRow, toColumn, moveType) {
        if (canPieceMove[this.type](this.row, this.column, toRow, toColumn, moveType)) return true;
    }
}

export {Piece};
