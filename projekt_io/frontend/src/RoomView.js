import React, { useEffect, useState } from "react";

function RoomView({ roomCode, nickname }) {
    const [connectedUsers, setConnectedUsers] = useState([]);

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

    return (
        <div id="join-room-section" className="text-center">
            <h2 className="text-center">Room: { roomCode }</h2>
            <ul>
                {connectedUsers.map((user, index) => (
                    <li key={index}>{user}</li>
                ))}
            </ul>
        </div>
    );
}

export default RoomView;