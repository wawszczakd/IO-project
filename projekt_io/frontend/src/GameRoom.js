import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';

import Chess from 'chess.js';

function GameRoom({ connectedUsers }) {
    const [game, setGame] = useState(new Chess());
    const [piece, setPiece] = useState(game.PAWN);

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
        if(game.get(sourceSquare).type !== piece)
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

    return (
        <div id="game-room-section" className="text-center">
            <div>
                <Chessboard position={game.fen()} onPieceDrop={onDrop}/>
                {game.fen()}
            </div>
            <div>
                {piece}
            </div>
            <div>
                <button
                    onClick = {() => {
                        randomizePiece();
                    }}
                >
                reroll piece
                </button>
            </div>
        </div>
    );
}

export default GameRoom;