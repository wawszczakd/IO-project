import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';

import Chess from 'chess.js';

function GameRoom({ connectedUsers }) {
    const [game, setGame] = useState(new Chess());

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

    function onDrop(sourceSquare, targetSquare) {
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
        return true;
    }

    return (
        <div id="game-room-section" className="text-center">
            <div>
                <Chessboard position={game.fen()} onPieceDrop={onDrop}/>
                {game.fen()}
            </div>
        </div>
    );
}

export default GameRoom;