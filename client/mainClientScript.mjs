//import {arrangePieces, changeCell, changePiecesArray, pieces,} from "./arrangePieces/arrangePieces.mjs";
import {changeVar, socket, appearance, gameState, sendPacket} from "./data.mjs";
// import {checkmate} from "./endOfGame/checkmate.mjs";
// import {notEnoughPieces} from "./endOfGame/notEnoughPieces.mjs";
import {images} from "./onClick/images.mjs";
import {onOpen} from "./socketEvents/open.mjs";
import {onMessage} from "./socketEvents/message.js";
import {onInputId, onInputMessage, onExit, onQuickPlay, onRematch} from "./interface.mjs";
import {arrangePieces, pieces} from "./arrangePieces/arrangePieces.mjs";
// import {clear, repeatingTheSameMoves, writeDownPosition} from "./endOfGame/repeatingMoves.mjs";
// import {move} from "./moves/move.mjs"; Y5HU6A1J7S6X1
// const sendPacket = (method, data = {}) => {
//     data['userId'] = gameState.userId;
//     data['method'] = method;
//     socket.send(JSON.stringify(data));
// }

//const changeCssVar = (cssVar, callback) => `${callback(cssVar.charAt(0))}${cssVar.slice(1)}`
//const CHAR_RETURN = 135homputedStyle(document.documentElement).getPropertyValue('--cellSize');
changeVar(appearance.cellSize, "cellSize");
// board.style.width = `${8 * appearance.cellSize}em`;
// board.style.height = `${8 * appearance.cellSize}em`;

socket.addEventListener("open", onOpen);
socket.addEventListener("message", onMessage);

const input = document.getElementById("inputId");
input.addEventListener("keydown", onInputId);
const exit = document.getElementById("newGame");
exit.addEventListener("click", onExit);
const quickPlay = document.getElementById('quickPlay');
quickPlay.addEventListener('click', onQuickPlay);
const inputMessage = document.getElementById('inputMessage');
inputMessage.addEventListener('keydown', onInputMessage);
const rematch = document.getElementById('rematch')
rematch.addEventListener('click', onRematch)
const newGame = document.getElementById('nextGame');
newGame.addEventListener('click', location.reload);

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
//     piece.HTMLImage.style.top = `${appearance.cellSize * parsed.cellRow}em`;
//     piece.HTMLImage.style.left = `${appearance.cellSize * parsed.cellColumn}em`;
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
// const newGame = document.getElementById("newGame");
// newGame.addEventListener("click", () => {
//     localStorage.setItem("userId", gameState.userId);
//     location.reload();
// });
