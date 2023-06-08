import React, { useEffect, useState } from "react";
import GameRoom from "./GameRoom";

function RoomView({ roomCode, nickname }) {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [isLobbyVisible, setLobbyVisible] = useState(true);
    const [isGameRoomVisible, setGameRoomVisible] = useState(false);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/room/${roomCode}/`);

        socket.onopen = () => {
            console.log("Connected to socket");
            const message = {
                type: 'user_joined',
                nickname: nickname,
            };
            socket.send(JSON.stringify(message));
        };

        const handleBeforeUnload = () => {
            const message = {
                type: 'user_left',
                nickname: nickname,
            };
            socket.send(JSON.stringify(message));
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        socket.onclose = () => {
            console.log("Disconnected from socket");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data).payload;
            console.log(data);
            switch (data.event) {
                case 'connected_users':
                    setConnectedUsers(data.connected_users);
                    break;
                default:
                    break;
            }
        };

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            socket.close();
        }
    }, [roomCode, nickname]);

    const handleStartGame = () => {
        setGameRoomVisible(true);
        setLobbyVisible(false);
    };

    return (
        <div className="container">
            {isLobbyVisible && (
                <div id="join-room-section" className="text-center">
                    <h2 className="text-center">Room: { roomCode }</h2>
                    <ul>
                        {connectedUsers.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                    <div className="text-center">
                        <button
                            type="button"
                            className="btn btn-primary mx-3"
                            id="create-room-btn"
                            onClick={handleStartGame}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            )}

            {isGameRoomVisible && (
                <GameRoom
                    connectedUsers={connectedUsers}
                />
            )}
        </div>
    );
}

export default RoomView;