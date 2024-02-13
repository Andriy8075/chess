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
    changeVar(false, "moveOrder");
};

const endGame = (method, text) => {
    writeGameResultText(text);
    const packet = {
        method: method, userId: gameState.userId, text: text,
    };
    socket.send(JSON.stringify(packet));
};
// const move = (parsedData) => {
//     const piece = pieces[parsedData.pieceId];
//     piece.HTMLImage.style.top = `${gameState.cellSize * parsedData.cellRow}em`;
//     piece.HTMLImage.style.left = `${gameState.cellSize * parsedData.cellColumn}em`;
//     changeCell(parsedData.cellRow, parsedData.cellColumn, pieces[parsedData.pieceId].id);
//     changeCell(pieces[parsedData.pieceId].row, pieces[parsedData.pieceId].column, null);
//     piece.row = parsedData.cellRow;
//     piece.column = parsedData.cellColumn;
//     if(parsedData.kill) {
//         pieces[parsedData.kill].HTMLImage.remove();
//         pieces[parsedData.kill] = null;
//     }
//     if(!parsedData.passant) {
//         changeVar(undefined, 'passant', 'column');
//         changeVar(undefined, 'passant', 'id');
//     }
//     else {
//         changeVar(parsedData.passant.id, 'passant', 'id');
//         changeVar(parsedData.passant.column, 'passant', 'column');
//     }
//     //setPassant(parsed.passant);
//     changeVar(true, "moveOrder");
//     if (notEnoughPieces()) {
//         endGame("notEnoughPieces", "You have a draw. Reason: not enough pieces to continue game",);
//         return;
//     }
//     const attackingPiece = attack(gameState.color, gameState.kingRow, gameState.kingColumn, null);
//     if(attackingPiece) {
//         if (checkmate(attackingPiece)) {
//             endGame("win", "You have checkmate and lost");
//             return;
//         }
//     }
//     else {
//         if (stalemate()) {
//             endGame("stalemate", "You have a draw. Reason: stalemate");
//             return;
//         }
//     }
//     if (parsedData.clear) {
//         clear();
//     }
//     else {
//         writeDownPosition();
//         const end = repeatingTheSameMoves();
//         if (end) {
//             endGame("repeatingTheSameMoves", "You have a draw. Reason: repeating the same moves",);
//         }
//     }
//     // if (end) {
//     //     if (end === "checkmate") {
//     //         endGame("win", "You have checkmate and lost");
//     //     }
//     //     if (end === "stalemate") {
//     //         endGame("stalemate", "You have a draw. Reason: stalemate");
//     //     }
//     // }
// };

const methods = {
    move: (parsedData) => {
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
        changeVar(true, "moveOrder");
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
        //move(parsed);
    },
    // kill: () => {
    //     pieces[parsed.pieceId].HTMLImage.remove();
    //     pieces[parsed.pieceId] = null;
    // },
    // assignID: () => {
    //     const yourIDLabel = document.getElementById(`id`);
    //     yourIDLabel.innerHTML = `Your ID: ${parsed.userId}`;
    // },
    connectToID: (parsedData) => {
        if (!gameState.inGame) {
            const labelConnectTo = document.getElementById(`connected`);
            labelConnectTo.innerHTML = `You are connected to player with id ${parsedData.userId}`;
            //connectedToID = parsed.userId;
            const images = document.getElementsByClassName("chooseColorImages");
            for (const image of images) {
                image.style.display = "flex";
            }
            const exit = document.getElementById('exit');
            exit.style.display = 'flex';
            const quickGame = document.getElementById('quickPlay');
            quickGame.style.display = 'none';
            changeVar(true, "inGame");
            const searchingOpponent = document.getElementById('searchingOpponent');
            searchingOpponent.style.display='none';
        }
    },
    receiveColor: (parsedData) => {
        arrangePieces(parsedData.color);
    },
    disconnect: () => {
        writeGameResultText("Your opponent disconnected, so you win");
    },
    killOnPassant: (parsedData) => {
        const passantRow = 4;
        changeCell(passantRow, parsedData.cellColumn, null);
        pieces[parsedData.pieceId].HTMLImage.remove();
        changePiecesArray(parsedData.pieceId, null);
    },
    promotion: (parsedData) => {
        const pawn = pieces[parsedData.pawn];
        pawn.type = parsedData.type;
        pawn.HTMLImage.src = `images/${gameState.oppositeColor}${parsedData.type}.png`;
        if (parsedData.opponentId) {
            pieces[parsedData.opponentId].HTMLImage.remove();
            pieces[parsedData.opponentId] = null;
        }
        methods.move({
            method: "doMove",
            userId: gameState.userId,
            pieceId: pawn.id,
            cellRow: parsedData.cellRow,
            cellColumn: parsedData.cellColumn,
            clear: true,
        });
    },
    win: () => {
        writeGameResultText("You win by making checkmate");
    },
}
const onMessage = ({data}) => {
    const parsed = JSON.parse(data);
    const method = methods[parsed.method];
    if (method) method(parsed);
    else if (parsed.text) {
        writeGameResultText(parsed.text);
    }
}
export {onMessage}