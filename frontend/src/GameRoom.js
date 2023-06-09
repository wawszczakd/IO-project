import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChessKing, faChessQueen, faChessRook, faChessBishop, faChessKnight, faChessPawn } from "@fortawesome/free-solid-svg-icons";
import Chess from "chess.js";

function GameRoom({ roomCode, userId, myTeam, myRole, connectedUsers, roles }) {
    const [currentRole, setCurrentRole] = useState(0);
    const [game, setGame] = useState(new Chess());
    const [legalFigures, setLegalFigures] = useState(["p", "n"]);
    const [legalMoves, setLegalMoves] = useState([]);
    const [chosenFigure, setChosenFigure] = useState("none");
    const [isFinished, setIsFinished] = useState(false);
    const [finishMessage, setFinishMessage] = useState("");
    const [isMoveMade, setIsMoveMade] = useState(false);
    const [socket, setSocket] = useState(new WebSocket(`ws://localhost:8000/ws/hand_and_brain/${roomCode}/`));
    
    useEffect(() => {
        if (isMoveMade) {
            const message = {
                type         : "hand_choose_move",
                fen          : game.fen(),
                current_role : currentRole,
            };
            socket.send(JSON.stringify(message));
            setIsMoveMade(false);
        }
        
        const handleChooseFigure = (figure) => {
            const message = {
                type         : "brain_choose_figure",
                figure       : figure,
                fen          : game.fen(),
                current_role : currentRole,
            }
            socket.send(JSON.stringify(message));
        }
        
        const handleMessage = (event) => {
            const data = JSON.parse(event.data).payload;
            switch (data.event) {
                case "brain_choose_figure":
                    setCurrentRole(data.current_role);
                    setLegalMoves(data.moves);
                    setChosenFigure(data.chosen_figure);
                    break;
                case "hand_choose_move":
                    setCurrentRole(data.current_role);
                    setLegalFigures(data.figures);
                    setGame(new Chess(data.fen));
                    break;
                case "game_finished":
                    setCurrentRole(4);
                    setGame(new Chess(data.fen));
                    setIsFinished(true);
                    setFinishMessage(data.content);
                    break;
                default:
                    console.log("unknown event");
            }
        }
        
        const handleChooseP = () => { return handleChooseFigure("p"); }
        const handleChooseN = () => { return handleChooseFigure("n"); }
        const handleChooseR = () => { return handleChooseFigure("r"); }
        const handleChooseB = () => { return handleChooseFigure("b"); }
        const handleChooseK = () => { return handleChooseFigure("k"); }
        const handleChooseQ = () => { return handleChooseFigure("q"); }
        
        const brain_choose_p = document.getElementById("brain-choose-p");
        const brain_choose_n = document.getElementById("brain-choose-n");
        const brain_choose_r = document.getElementById("brain-choose-r");
        const brain_choose_b = document.getElementById("brain-choose-b");
        const brain_choose_k = document.getElementById("brain-choose-k");
        const brain_choose_q = document.getElementById("brain-choose-q");
        
        if (brain_choose_p != null) brain_choose_p.addEventListener("click", handleChooseP);
        if (brain_choose_n != null) brain_choose_n.addEventListener("click", handleChooseN);
        if (brain_choose_r != null) brain_choose_r.addEventListener("click", handleChooseR);
        if (brain_choose_b != null) brain_choose_b.addEventListener("click", handleChooseB);
        if (brain_choose_k != null) brain_choose_k.addEventListener("click", handleChooseK);
        if (brain_choose_q != null) brain_choose_q.addEventListener("click", handleChooseQ);
        
        socket.addEventListener("message", handleMessage);
        
        return () => {
            if (brain_choose_p != null) brain_choose_p.removeEventListener("click", handleChooseP);
            if (brain_choose_n != null) brain_choose_n.removeEventListener("click", handleChooseN);
            if (brain_choose_r != null) brain_choose_r.removeEventListener("click", handleChooseR);
            if (brain_choose_b != null) brain_choose_b.removeEventListener("click", handleChooseB);
            if (brain_choose_k != null) brain_choose_k.removeEventListener("click", handleChooseK);
            if (brain_choose_q != null) brain_choose_q.removeEventListener("click", handleChooseQ);
            
            socket.removeEventListener("message", handleMessage);
        }
    }, [roomCode, userId, game, myRole, currentRole, isMoveMade, socket]);
    
    function updateGame(modify) {
        setGame((g) => {
            const update = { ...g };
            modify(update);
            return update;
        });
    }
    
    function onDrop(sourceSquare, targetSquare) {
        if (currentRole != myRole) return false;
        
        const moveUCI = `${sourceSquare}${targetSquare}`;
        if (!legalMoves.includes(moveUCI)) {
            return false;
        }
        
        let move = null;
        updateGame((game) => {
            move = game.move({
                from      : sourceSquare,
                to        : targetSquare,
                promotion : "q"
            });
        });
        
        if (move === null) return false;
        setIsMoveMade(true);
        return true;
    }
    
    function mapSymbolToFigure(symbol) {
        const color = myTeam === 1 ? 'white' : 'black';
        
        if      (symbol === "k") return <FontAwesomeIcon icon={faChessKing} style={{ color }} size="4x" />;
        else if (symbol === "q") return <FontAwesomeIcon icon={faChessQueen} style={{ color }} size="4x" />;
        else if (symbol === "r") return <FontAwesomeIcon icon={faChessRook} style={{ color }}  size="4x"/>;
        else if (symbol === "b") return <FontAwesomeIcon icon={faChessBishop} style={{ color }}  size="4x"/>;
        else if (symbol === "n") return <FontAwesomeIcon icon={faChessKnight} style={{ color }} size="4x"/>;
        else                     return <FontAwesomeIcon icon={faChessPawn} style={{ color }}  size="4x"/>;
    }
    
    return (
        <div id="game-room-section" className="text-center">
            <div className="row">
                <div className="col-3">
                    <table className="table table-dark">
                        <thead>
                            <tr>
                                <th>
                                    Team 1
                                </th>
                            </tr>    
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    {currentRole === 0 ? (
                                        <div className="rounded text-success">
                                            Brain: {connectedUsers[roles["brain_1"]].nickname} {myRole === 0 && <>(You)</>} <br />
                                        </div>
                                    ) : (
                                        <div className="rounded">
                                            Brain: {connectedUsers[roles["brain_1"]].nickname} {myRole === 0 && <>(You)</>} <br />
                                        </div>
                                    )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    {currentRole === 1 ? (
                                        <div className="rounded text-success">
                                            Hand: {connectedUsers[roles["hand_1"]].nickname} {myRole === 1 && <>(You)</>} <br />
                                        </div>
                                    ) : (
                                        <div className="rounded">
                                            Hand: {connectedUsers[roles["hand_1"]].nickname} {myRole === 1 && <>(You)</>} <br />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                    <div className="col-6">
                        <div className="container-fluid text-center">
                            <center>
                                <Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation={myRole < 2 ? "white" : "black"}/>
                            </center>
                        </div>
                    </div>
                <div className="col-3">
                <table className="table table-dark">
                    <thead>
                        <tr>
                            <th>
                                Team 2
                            </th>
                        </tr>    
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {currentRole === 2 ? (
                                    <div className="rounded text-success">
                                        Brain: {connectedUsers[roles["brain_2"]].nickname} {myRole === 2 && <>(You)</>} <br />
                                    </div>
                                ) : (
                                    <div className="rounded">
                                        Brain: {connectedUsers[roles["brain_2"]].nickname} {myRole === 2 && <>(You)</>} <br />
                                    </div>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {currentRole === 3 ? (
                                    <div className="rounded text-success">
                                        Hand: {connectedUsers[roles["hand_2"]].nickname} {myRole === 3 && <>(You)</>} <br />
                                    </div>
                                ) : (
                                    <div className="rounded">
                                        Hand: {connectedUsers[roles["hand_2"]].nickname} {myRole === 3 && <>(You)</>} <br />
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>
            <br />
            
            <div className="container">
                {isFinished ? (
                    <>
                        <p>{finishMessage}</p>
                    </>
                ) : (
                    <>
                        {currentRole === myRole ? (
                            <p>Your turn</p>
                        ) : (
                            <div>
                                <div class="spinner-border"></div>
                                <p>Wait for your turn</p>
                            </div>
                        )}
                        {myRole % 2 === 0 && currentRole === myRole && (
                            <>
                                <p>Choose a figure:</p>
                                {legalFigures.map((figure) => (
                                    <button
                                        className="btn btn-secondary"
                                        id={`brain-choose-${figure}`}
                                        key={figure} >
                                        {mapSymbolToFigure(figure)}
                                    </button>
                                ))}
                            </>
                        )}
                        {myRole % 2 === 1 && currentRole === myRole && (
                            <>
                                <p>Figure chosen by brain: <br /> <span style={{ display: "inline-flex", alignItems: "center", backgroundColor: "grey", 
                                            padding: "2px", borderRadius: "4px", }} >{mapSymbolToFigure(chosenFigure)}</span></p>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default GameRoom;