import { canPieceMove, moves } from "./moves.js";

class Piece {
    constructor(HTMLImage, id, color, type, row, column) {
        this.id = id;
        this.HTMLImage = HTMLImage;
        this.type = type;
        this.color = color;
        this.row = row;
        this.column = column;
        this.wantMove = moves[type].bind(null, this);
    }

    canMove(toRow, toColumn, moveType) {
        if(canPieceMove[this.type](this.row, this.column, toRow, toColumn, moveType)) return true;
    }
}

export {Piece}