import React, { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';

import Chess from 'chess.js';

function GameRoom({ roomCode, connectedUsers, userId, myRole }) {
    console.log(roomCode);
    console.log(connectedUsers);
    //console.log(userId);
    //console.log(initUser);
    const [currentRole, setCurrentRole] = useState(0);
    const [game, setGame] = useState(new Chess());
    const [piece, setPiece] = useState(game.PAWN);
    const [legalFigures, setLegalFigures] = useState(['p', 'n']);
    const [legalMoves, setLegalMoves] = useState([]);
    console.log(myRole);

    const [isMoveMade, setIsMoveMade] = useState(false);
    // [TODO]: zainicjalizowanie na startowy state 
    // (zaczyna user white brain, szachownica jest pusta, etc)
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/hand_and_brain/${roomCode}/`);
        
        socket.addEventListener('open', () => {
            if (isMoveMade) {
              const message = {
                type: 'hand_choose_move',
                fen: game.fen(),
                current_role: currentRole,
              };
              console.log("Sending message:", message);
              socket.send(JSON.stringify(message));
              setIsMoveMade(false);
            }
        });

        const handleChooseFigure = (figure) => {
            console.log(figure);
            const message = {
                type: 'brain_choose_figure',
                figure: figure,
                fen: game.fen(),
                current_role: currentRole,
            }
            socket.send(JSON.stringify(message));
        }
        
        const handleMakeMove = () => {
            const message = {
                type         : 'hand_choose_move',
                fen          : game.fen(),
                current_role : currentRole,
            }
            console.log(message);
            socket.send(JSON.stringify(message));
            console.log("handleMakeMove done");
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data).payload;
            console.log(data);
            switch (data.event) {
                case "brain_choose_figure":
                    console.log("case brain_choose_figure");
                    setCurrentRole(data.current_role);
                    console.log("new currentRole: " + currentRole);
                    console.log(data);
                    console.log(data.current_role + " " + currentRole);
                    setLegalMoves(data.moves);
                    break;
                case "hand_choose_move":
                    console.log("case hand_choose_move");
                    setCurrentRole(data.current_role);
                    console.log("new currentRole: " + currentRole);
                    console.log(data);
                    setLegalFigures(data.figures);
                    break;
                default:
                    console.log("unknown event");
            }
        }
        
        const hand_move = document.getElementById('hand-move');
        if (hand_move != null) hand_move.addEventListener('click', handleMakeMove);
        
        const handleChooseP = () => { return handleChooseFigure('p'); }
        const handleChooseN = () => { return handleChooseFigure('n'); }
        const handleChooseR = () => { return handleChooseFigure('r'); }
        const handleChooseB = () => { return handleChooseFigure('b'); }
        const handleChooseK = () => { return handleChooseFigure('k'); }
        const handleChooseQ = () => { return handleChooseFigure('q'); }

        const brain_choose_p = document.getElementById('brain-choose-p');
        const brain_choose_n = document.getElementById('brain-choose-n');
        const brain_choose_r = document.getElementById('brain-choose-r');
        const brain_choose_b = document.getElementById('brain-choose-b');
        const brain_choose_k = document.getElementById('brain-choose-k');
        const brain_choose_q = document.getElementById('brain-choose-q');

        if (brain_choose_p != null) brain_choose_p.addEventListener('click', handleChooseP);
        if (brain_choose_n != null) brain_choose_n.addEventListener('click', handleChooseN);
        if (brain_choose_r != null) brain_choose_r.addEventListener('click', handleChooseR);
        if (brain_choose_b != null) brain_choose_b.addEventListener('click', handleChooseB);
        if (brain_choose_k != null) brain_choose_k.addEventListener('click', handleChooseK);
        if (brain_choose_q != null) brain_choose_q.addEventListener('click', handleChooseQ);

        socket.addEventListener('message', handleMessage);

        return () => {
            if (brain_choose_p != null) brain_choose_p.removeEventListener('click', handleChooseP);
            if (brain_choose_n != null) brain_choose_n.removeEventListener('click', handleChooseN);
            if (brain_choose_r != null) brain_choose_r.removeEventListener('click', handleChooseR);
            if (brain_choose_b != null) brain_choose_b.removeEventListener('click', handleChooseB);
            if (brain_choose_k != null) brain_choose_k.removeEventListener('click', handleChooseK);
            if (brain_choose_q != null) brain_choose_q.removeEventListener('click', handleChooseQ);

            socket.removeEventListener('message', handleMessage);
        }

    }, [roomCode, userId, isMoveMade, game, myRole]);

    function updateGame(modify) {
        setGame((g) => {
            const update = { ...g };
            modify(update);
            return update;
        });
    }

    function onDrop(sourceSquare, targetSquare) {
        const moveUCI = `${sourceSquare}${targetSquare}`;
        if (!legalMoves.includes(moveUCI)) {
            return false;
        }
        
        let move = null;
        updateGame((game) => {
            move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
            });
        });

        if (move === null) return false;
        //console.log(currentRole);
        setIsMoveMade(true);
        return true;
    }
    
    const buttonRef = useRef(null);
    
    return (
        <div id="game-room-section" className="text-center">
            <div style={{ display: 'none' }}>
                <button ref={buttonRef} id="hand-move">Hand move</button>
            </div>
            <div>
                <Chessboard position={game.fen()} onPieceDrop={onDrop} />
                {game.fen()}
            </div>
            
            <div className="container">
                {currentRole === myRole ? <p>Your turn</p> : <p>Wait for your turn</p>}
                {myRole % 2 === 0 && currentRole === myRole && (
                    <>
                    <p>Choose a figure:</p>
                    {legalFigures.map((figure) => (
                        <button
                        className="btn btn-secondary"
                        id={`brain-choose-${figure}`}
                        key={figure}
                        >
                        {figure.toUpperCase()}
                        </button>
                    ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default GameRoom;