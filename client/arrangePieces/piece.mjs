import { wantMove } from "../moves/wantMove.mjs";
import { canPieceMove } from "../moves/canPieceMove.mjs";

class Piece {
  constructor({ HTMLImage, id, color, type, row, col }) {
    this.id = id;
    this.HTMLImage = HTMLImage;
    this.type = type;
    this.color = color;
    this.row = row;
    this.col = col;
    this.wantMove = wantMove[type](this);
  }

  canMove({ toRow, toCol, moveType }) {
    const check = canPieceMove[this.type];
    const fromRow = this.row;
    const fromCol = this.col;
    return check({ fromRow, fromCol, toRow, toCol, moveType });
  }
}

export { Piece };
