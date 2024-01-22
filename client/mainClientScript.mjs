import {arrangePieces, changeCell, pieces,} from "./arrangePieces/arrangePieces.mjs";
import {changeVar, getID, setPassant, socket, gameState} from "./data.mjs";
import {checkmateOrStalemate} from "./endOfGame/checkmateOrStalemate.mjs";
import {notEnoughPieces} from "./endOfGame/notEnoughPieces.mjs";
import {images} from "./onClick/images.mjs";
import {clear, repeatingTheSameMoves, writeDownPosition} from "./endOfGame/repeatingMoves.mjs";
import {doMove} from "./moves/doMoveAndKill.mjs";

const CHAR_RETURN = 13;
const inputAnotherPlayersIDHere = document.getElementById("inputAnotherPlayersIDHere",);
let connectedToID;

const board = document.getElementById("boardImage");
changeVar("cellSize", 6);
board.style.width = `${8 * gameState.cellSize}em`;
board.style.height = `${8 * gameState.cellSize}em`;
const writeGameResultText = (text) => {
    const textField = document.getElementById("gameResult");
    textField.innerHTML = text;
    changeVar("movePossibility", false);
};

const endTheGame = (method, text) => {
    writeGameResultText(text);
    const pocket = {
        method: method, userId: gameState.userId, text: text,
    };
    socket.send(JSON.stringify(pocket));
};

socket.addEventListener("open", () => {
    const userId = localStorage.getItem("userId");
    if (userId) changeVar("userId", userId); else changeVar("userId", getID());
    inputAnotherPlayersIDHere.style.display = "flex";
    input.style.display = "flex";
    //deleteConnectedToID();
    const pocket = {
        method: "assignID", userId: gameState.userId,
    };
    socket.send(JSON.stringify(pocket));
    localStorage.removeItem("userId");
});
const move = (parsed) => {
    const piece = pieces[parsed.pieceId];
    piece.HTMLImage.style.top = `${gameState.cellSize * parsed.cellRow}em`;
    piece.HTMLImage.style.left = `${gameState.cellSize * parsed.cellColumn}em`;
    changeCell(parsed.cellRow, parsed.cellColumn, pieces[parsed.pieceId].id);
    changeCell(pieces[parsed.pieceId].row, pieces[parsed.pieceId].column, null);
    piece.row = parsed.cellRow;
    piece.column = parsed.cellColumn;
    setPassant(parsed.passant);
    changeVar("movePossibility", true);
    if (parsed.clear) clear(); else {
        writeDownPosition();
        const end = repeatingTheSameMoves();
        if (end) {
            endTheGame("repeatingTheSameMoves", "You have a draw. Reason: repeating the same moves",);
        }
    }
    const end = checkmateOrStalemate();
    if (end) {
        if (end === "checkmate") {
            endTheGame("win", "You have checkmate and lost");
        }
        if (end === "stalemate") {
            endTheGame("stalemate", "You have a draw. Reason: stalemate");
        }
    }
    if (notEnoughPieces()) {
        endTheGame("notEnoughPieces", "You have a draw. Reason: not enough pieces to continue game",);
    }
};

socket.addEventListener("message", ({data}) => {
    const parsed = JSON.parse(data);
    const methods = {
        doMove: () => {
            move(parsed);
        }, kill: () => {
            pieces[parsed.pieceId].HTMLImage.remove();
            pieces[parsed.pieceId] = null;
        }, assignID: () => {
            const yourIDLabel = document.getElementById(`id`);
            yourIDLabel.innerHTML = `Your ID: ${parsed.userId}`;
        }, connectToID: () => {
            if (!gameState.inGame) {
                const labelConnectTo = document.getElementById(`connected`);
                labelConnectTo.innerHTML = `You are connected to player with ID ${parsed.userId}`;
                connectedToID = parsed.userId;
                const images = document.getElementsByClassName("chooseColorImages");
                for (const image of images) {
                    image.style.display = "flex";
                }
                changeVar("inGame", true);
            }
        }, receiveColor: () => {
            arrangePieces(parsed.color);
        }, disconnect: () => {
            writeGameResultText("Your opponent disconnected, so you win");
        }, clearArrayCellAfterPassant: () => {
            const passantRow = 4;
            changeCell(passantRow, parsed.cellColumn, null);
        }, changePawnToPiece: () => {
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
                passant: null,
            });
        }, win: () => {
            writeGameResultText("You win by making checkmate");
        },
    };
    const method = methods[parsed.method];
    if (method) method(); else {
        if (parsed.text) {
            writeGameResultText(parsed.text);
        }
    }
});

const input = document.getElementById("input");
input.addEventListener("keydown", (event) => {
    if (event.keyCode === CHAR_RETURN) {
        let value = input.value.trim();
        if (!gameState.inGame) {
            const pocket = {
                method: "connectToID", from: gameState.userId, to: value,
            };
            socket.send(JSON.stringify(pocket));
        }
    }
});

const exit = document.getElementById("exit");
exit.addEventListener("click", () => {
    localStorage.setItem("userId", gameState.userId);
    location.reload();
});

images();
