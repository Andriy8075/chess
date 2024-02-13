//import {arrangePieces, changeCell, changePiecesArray, pieces,} from "./arrangePieces/arrangePieces.mjs";
import {changeVar, socket, gameState} from "./data.mjs";
// import {checkmate} from "./endOfGame/checkmate.mjs";
// import {notEnoughPieces} from "./endOfGame/notEnoughPieces.mjs";
import {images} from "./onClick/images.mjs";
import {onOpen} from "./socketEvents/open.mjs";
import {onMessage} from "./socketEvents/message.js";
import {onInput, onExit, onQuickPlay} from "./onClick/interface.mjs";
// import {clear, repeatingTheSameMoves, writeDownPosition} from "./endOfGame/repeatingMoves.mjs";
// import {move} from "./moves/doMoveAndKill.mjs";
// import {attack} from "./moves/check.mjs";
// import {stalemate} from "./endOfGame/stalemate.mjs";

//const CHAR_RETURN = 13;
//const inputAnotherPlayersIDHere = document.getElementById("inputAnotherPlayersIDHere",);
const board = document.getElementById("boardImage");
changeVar(6, "cellSize");
board.style.width = `${8 * gameState.cellSize}em`;
board.style.height = `${8 * gameState.cellSize}em`;

socket.addEventListener("open", onOpen);
socket.addEventListener("message", onMessage);

const input = document.getElementById("input");
input.addEventListener("keydown", onInput);
const exit = document.getElementById("exit");
exit.addEventListener("click", onExit);
const quickPlay = document.getElementById('quickPlay');
quickPlay.addEventListener('click', onQuickPlay);

images();
// const writeGameResultText = (text) => {
//     const textField = document.getElementById("gameResult");
//     textField.innerHTML = text;
//     changeVar(false, "moveOrder");
// };
//
// const endGame = (method, text) => {
//     writeGameResultText(text);
//     const packet = {
//         method: method, userId: gameState.userId, text: text,
//     };
//     socket.send(JSON.stringify(packet));
// };

//let connectedToID;
// const getID = () => {
//     const userId = parseInt(Math.random().toString().slice(2));
//     gameState.userId = userId;
//     return userId;
// };
// socket.addEventListener("open", () => {
//     const userId = localStorage.getItem("userId");
//     if (userId) changeVar(userId, "userId"); else changeVar(getID(), "userId");
//     inputAnotherPlayersIDHere.style.display = "flex";
//     input.style.display = "flex";
//     //deleteConnectedToID();
//     const yourIDLabel = document.getElementById(`id`);
//     yourIDLabel.innerHTML = `Your ID: ${gameState.userId}`;
//     const packet = {
//         method: "assignID", userId: gameState.userId,
//     };
//     socket.send(JSON.stringify(packet));
//     localStorage.removeItem("userId");
// });
// const move = (parsed) => {
//     const piece = pieces[parsed.pieceId];
//     piece.HTMLImage.style.top = `${gameState.cellSize * parsed.cellRow}em`;
//     piece.HTMLImage.style.left = `${gameState.cellSize * parsed.cellColumn}em`;
//     changeCell(parsed.cellRow, parsed.cellColumn, pieces[parsed.pieceId].id);
//     changeCell(pieces[parsed.pieceId].row, pieces[parsed.pieceId].column, null);
//     piece.row = parsed.cellRow;
//     piece.column = parsed.cellColumn;
//     if(parsed.kill) {
//         pieces[parsed.kill].HTMLImage.remove();
//         pieces[parsed.kill] = null;
//     }
//     if(!parsed.passant) {
//         changeVar(undefined, 'passant', 'column');
//         changeVar(undefined, 'passant', 'id');
//     }
//     else {
//         changeVar(parsed.passant.id, 'passant', 'id');
//         changeVar(parsed.passant.column, 'passant', 'column');
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
//     if (parsed.clear) {
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
//
// socket.addEventListener("message", ({data}) => {
//     const parsed = JSON.parse(data);
//     const methods = {
//         move: () => {
//             move(parsed);
//         },
//         // kill: () => {
//         //     pieces[parsed.pieceId].HTMLImage.remove();
//         //     pieces[parsed.pieceId] = null;
//         // },
//         // assignID: () => {
//         //     const yourIDLabel = document.getElementById(`id`);
//         //     yourIDLabel.innerHTML = `Your ID: ${parsed.userId}`;
//         // },
//         connectToID: () => {
//             if (!gameState.inGame) {
//                 const labelConnectTo = document.getElementById(`connected`);
//                 labelConnectTo.innerHTML = `You are connected to player with ID ${parsed.userId}`;
//                 //connectedToID = parsed.userId;
//                 const images = document.getElementsByClassName("chooseColorImages");
//                 for (const image of images) {
//                     image.style.display = "flex";
//                 }
//                 changeVar(true, "inGame");
//             }
//         },
//         receiveColor: () => {
//             arrangePieces(parsed.color);
//         },
//         disconnect: () => {
//             writeGameResultText("Your opponent disconnected, so you win");
//         },
//         killOnPassant: () => {
//             const passantRow = 4;
//             changeCell(passantRow, parsed.cellColumn, null);
//             pieces[parsed.pieceId].HTMLImage.remove();
//             changePiecesArray(parsed.pieceId, null);
//         },
//         changePawnToPiece: () => {
//             const pawn = pieces[parsed.pawn];
//             pawn.type = parsed.type;
//             pawn.HTMLImage.src = `images/${gameState.oppositeColor}${parsed.type}.png`;
//             if (parsed.opponentId) {
//                 pieces[parsed.opponentId].HTMLImage.remove();
//                 pieces[parsed.opponentId] = null;
//             }
//             move({
//                 method: "move",
//                 userId: gameState.userId,
//                 pieceId: pawn.id,
//                 cellRow: parsed.cellRow,
//                 cellColumn: parsed.cellColumn,
//                 clear: true,
//             });
//         },
//         win: () => {
//             writeGameResultText("You win by making checkmate");
//         },
//     };
//     const method = methods[parsed.method];
//     if (method) method(); else {
//         if (parsed.text) {
//             writeGameResultText(parsed.text);
//         }
//     }
// });

//const input = document.getElementById("input");
// input.addEventListener("keydown", (event) => {
//     if (event.key === 'Enter') {
//         let value = input.value.trim();
//         if (!gameState.inGame) {
//             const packet = {
//                 method: "connectToID", from: gameState.userId, to: value,
//             };
//             socket.send(JSON.stringify(packet));
//         }
//     }
// });
//
// const exit = document.getElementById("exit");
// exit.addEventListener("click", () => {
//     localStorage.setItem("userId", gameState.userId);
//     location.reload();
// });
