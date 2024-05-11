import {wantMove} from "../moves/wantMove.mjs";
import {simpleCanMove} from "../moves/simpleCanMove.mjs";

class Piece {
    constructor({HTMLImage, id, color, type, row, col}) {
        this.id = id;
        this.HTMLImage = HTMLImage;
        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col;
        this.wantMove = wantMove(this);
    }

    canMove({ toRow, toCol }) {
        const correctFunction = simpleCanMove[this.type];
        return correctFunction({Piece, toRow, toCol});
    }
}

export {Piece};
