import {arrangePieces, changeCell, changePiecesArray, pieces} from "../arrangePieces/arrangePieces.mjs";
import {changeVar, gameState, socket} from "../data.mjs";
import {notEnoughPieces} from "../endOfGame/notEnoughPieces.mjs";
import {attack} from "../moves/check.mjs";
import {checkmate} from "../endOfGame/checkmate.mjs";
import {stalemate} from "../endOfGame/stalemate.mjs";
import {clear, repeatingTheSameMoves, writeDownPosition} from "../endOfGame/repeatingMoves.mjs";

const writeGameResultText = (text) => {
    const textField = document.getElementById("gameResult");
    textField.innerHTML = text;
    changeVar(false, "movePossibility");
};

const endGame = (method, text) => {
    writeGameResultText(text);
    const pocket = {
        method: method, userId: gameState.userId, text: text,
    };
    socket.send(JSON.stringify(pocket));
};
const move = (parsedData) => {
    const piece = pieces[parsedData.pieceId];
    piece.HTMLImage.style.top = `${gameState.cellSize * parsedData.cellRow}em`;
    piece.HTMLImage.style.left = `${gameState.cellSize * parsedData.cellColumn}em`;
    changeCell(parsedData.cellRow, parsedData.cellColumn, pieces[parsedData.pieceId].id);
    changeCell(pieces[parsedData.pieceId].row, pieces[parsedData.pieceId].column, null);
    piece.row = parsedData.cellRow;
    piece.column = parsedData.cellColumn;
    if(parsedData.kill) {
        pieces[parsedData.kill].HTMLImage.remove();
        pieces[parsedData.kill] = null;
    }
    if(!parsedData.passant) {
        changeVar(undefined, 'passant', 'column');
        changeVar(undefined, 'passant', 'id');
    }
    else {
        changeVar(parsedData.passant.id, 'passant', 'id');
        changeVar(parsedData.passant.column, 'passant', 'column');
    }
    //setPassant(parsed.passant);
    changeVar(true, "movePossibility");
    if (notEnoughPieces()) {
        endGame("notEnoughPieces", "You have a draw. Reason: not enough pieces to continue game",);
        return;
    }
    const attackingPiece = attack(gameState.color, gameState.kingRow, gameState.kingColumn, null);
    if(attackingPiece) {
        if (checkmate(attackingPiece)) {
            endGame("win", "You have checkmate and lost");
            return;
        }
    }
    else {
        if (stalemate()) {
            endGame("stalemate", "You have a draw. Reason: stalemate");
            return;
        }
    }
    if (parsedData.clear) {
        clear();
    }
    else {
        writeDownPosition();
        const end = repeatingTheSameMoves();
        if (end) {
            endGame("repeatingTheSameMoves", "You have a draw. Reason: repeating the same moves",);
        }
    }
    // if (end) {
    //     if (end === "checkmate") {
    //         endGame("win", "You have checkmate and lost");
    //     }
    //     if (end === "stalemate") {
    //         endGame("stalemate", "You have a draw. Reason: stalemate");
    //     }
    // }
};
const onMessage = ({data}) => {
    const parsed = JSON.parse(data);
    const methods = {
        doMove: () => {
            move(parsed);
        },
        // kill: () => {
        //     pieces[parsed.pieceId].HTMLImage.remove();
        //     pieces[parsed.pieceId] = null;
        // },
        // assignID: () => {
        //     const yourIDLabel = document.getElementById(`id`);
        //     yourIDLabel.innerHTML = `Your ID: ${parsed.userId}`;
        // },
        connectToID: () => {
            if (!gameState.inGame) {
                const labelConnectTo = document.getElementById(`connected`);
                labelConnectTo.innerHTML = `You are connected to player with ID ${parsed.userId}`;
                //connectedToID = parsed.userId;
                const images = document.getElementsByClassName("chooseColorImages");
                for (const image of images) {
                    image.style.display = "flex";
                }
                changeVar(true, "inGame");
            }
        },
        receiveColor: () => {
            arrangePieces(parsed.color);
        },
        disconnect: () => {
            writeGameResultText("Your opponent disconnected, so you win");
        },
        killOnPassant: () => {
            const passantRow = 4;
            changeCell(passantRow, parsed.cellColumn, null);
            pieces[parsed.pieceId].HTMLImage.remove();
            changePiecesArray(parsed.pieceId, null);
        },
        promotion: () => {
            const pawn = pieces[parsed.pawn];
            pawn.type = parsed.type;
            pawn.HTMLImage.src = `pictures/${gameState.oppositeColor}${parsed.type}.png`;
            if (parsed.opponentId) {
                pieces[parsed.opponentId].HTMLImage.remove();
                pieces[parsed.opponentId] = null;
            }
            move({
                method: "doMove",
                userId: gameState.userId,
                pieceId: pawn.id,
                cellRow: parsed.cellRow,
                cellColumn: parsed.cellColumn,
                clear: true,
            });
        },
        win: () => {
            writeGameResultText("You win by making checkmate");
        },
    };
    const method = methods[parsed.method];
    if (method) method(); else {
        if (parsed.text) {
            writeGameResultText(parsed.text);
        }
    }
}
export {onMessage}