import {
  changeCell,
  changePiecesArray,
} from "../arrangePieces/arrangePieces.mjs";
import {
  changeVar,
  sendPacket,
  appearance,
  maxRowAndCol,
} from "../dataAndFunctions.mjs";
import { clear, writeDownPosition } from "../endOfGame/repeatingMoves.mjs";
const move = (record) => {
  const { piece, toRow, toCol } = record;
  changeCell(toRow, toCol, piece.id);
  changeCell(piece.row, piece.col, undefined);

  let killId;
  const { killPiece } = record;
  let { clearPosition } = record;
  if (killPiece) {
    killPiece.HTMLImage.remove();
    changePiecesArray(killPiece.id, null);
    clearPosition = true;
    killId = killPiece.id;
  }

  piece.row = toRow;
  piece.col = toCol;
  piece.HTMLImage.style.top = `${appearance.cellSize * toRow}em`;
  piece.HTMLImage.style.left = `${appearance.cellSize * toCol}em`;
  piece.HTMLImage.style.removeProperty("background-color");

  changeVar(false, "turnToMove");
  changeVar(undefined, "chosenPiece");
  changeVar(false, "moveOnPassantExist");

  if (clearPosition) {
    clear();
  } else {
    writeDownPosition();
  }
  const { dontSendPacket, passant } = record;
  if (!dontSendPacket) {
    sendPacket("move", {
      pieceId: piece.id,
      toRow: maxRowAndCol - toRow,
      toCol: maxRowAndCol - toCol,
      clearPosition,
      passant,
      killId,
    });
  }
};

export { move };
