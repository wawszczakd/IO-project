import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

import Chess from 'chess.js';

function GameRoom({ roomCode, connectedUsers, userId }) {
    const [game, setGame] = useState(new Chess());
    const [piece, setPiece] = useState(game.PAWN);

    // [TODO]: zainicjalizowanie na startowy state 
    // (zaczyna user white brain, szachownica jest pusta, etc)
    const [gameState, setGameState] = useState(null);

    function updateGame(modify) {
        setGame((g) => {
            const update = { ...g };
            modify(update);
            return update;
        });
    }

    function makeRandomMove() {
        const possibleMoves = game.moves();
        if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        updateGame((game) => {
            game.move(possibleMoves[randomIndex]);
        });
    }

    function randomizePiece() {
        const possiblePieces = [game.PAWN, game.KNIGHT, game.BISHOP, game.ROOK, game.QUEEN, game.KING];
        const randomIndex = Math.floor(Math.random() * possiblePieces.length);
        const newPiece = possiblePieces[randomIndex];
        setPiece(newPiece);
        return newPiece;
    }

    function onDrop(sourceSquare, targetSquare) {
        if (game.get(sourceSquare).type !== piece)
            return false;
        let move = null;
        updateGame((game) => {
            move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });
        });

        if (move == null) return false;
        setTimeout(makeRandomMove, 200);
        setPiece(randomizePiece());
        return true;
    }

    // [TODO] czy na pewno fetch? Raczej chcemy używać websocketów, które
    // odsyłają stan wszystkim, dla synchronizacji
    // + coś jest nie tak w routingu i nie czyta i tak api
    // na razie zakomentowałem button
    function getGameState(game_id) {
        const url = "http://localhost:8000/api/gamehandandbrain/4/";
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Work with the JSON data
                console.log(data);
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/hand_and_brain/${roomCode}/`);
        const handleChooseFigure = (figure) => {
            console.log(figure);
            const message = {
                type: 'brain_choose_figure',
                figure: figure,
            }
            socket.send(JSON.stringify(message));
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data).payload;
            switch (data.event) {
                default:
                    console.log(data);
                    break;
            }
        }

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

        brain_choose_p.addEventListener('click', handleChooseP);
        brain_choose_n.addEventListener('click', handleChooseN);
        brain_choose_r.addEventListener('click', handleChooseR);
        brain_choose_b.addEventListener('click', handleChooseB);
        brain_choose_k.addEventListener('click', handleChooseK);
        brain_choose_q.addEventListener('click', handleChooseQ);

        socket.addEventListener('message', handleMessage);

        return () => {
            brain_choose_p.removeEventListener('click', handleChooseP);
            brain_choose_n.removeEventListener('click', handleChooseN);
            brain_choose_r.removeEventListener('click', handleChooseR);
            brain_choose_b.removeEventListener('click', handleChooseB);
            brain_choose_k.removeEventListener('click', handleChooseK);
            brain_choose_q.removeEventListener('click', handleChooseQ);

            socket.removeEventListener('message', handleMessage);
        }

    }, [roomCode, userId]);

    return (
        <div id="game-room-section" className="text-center">
            <div>
                <Chessboard position={game.fen()} onPieceDrop={onDrop} />
                {game.fen()}
            </div>
            <div>
                {piece}
            </div>
            <div>
                <button
                    onClick={() => {
                        randomizePiece();
                    }}
                >
                    reroll piece
                </button>
            </div>
            {/* <button onClick={getGameState(4)}>
                    game_state
            </button> */}
            <div className="container">
                Choose a figure:
                <button className="btn btn-secondary" id="brain-choose-p">Pawn</button>
                <button className="btn btn-secondary" id="brain-choose-n">Knignt</button>
                <button className="btn btn-secondary" id="brain-choose-r">Rook</button>
                <button className="btn btn-secondary" id="brain-choose-b">Bishop</button>
                <button className="btn btn-secondary" id="brain-choose-k">King</button>
                <button className="btn btn-secondary" id="brain-choose-q">Queen</button>
            </div>
        </div>
    );
}

export default GameRoom;