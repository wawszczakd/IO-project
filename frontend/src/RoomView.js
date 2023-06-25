import React, { useEffect, useState } from "react";
import GameRoom from "./GameRoom";

function RoomView({ roomCode, nickname }) {
    const [connectedUsers, setConnectedUsers] = useState({});
    const [userId, setUserId] = useState(null);
    const [ownerId, setOwnerId] = useState(null);
    const [isLobbyVisible, setLobbyVisible] = useState(true);
    const [isGameRoomVisible, setGameRoomVisible] = useState(false);
    const [roles, setRoles] = useState(false);
    
    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/room/${roomCode}/`);
        
        const handleOpen = () => {
            console.log("Connected to socket");
            if (userId == null) {
                console.log("Sending new-user msg");
                const message = {
                    type     : "user_joined",
                    nickname : nickname,
                };
                socket.send(JSON.stringify(message));
            }
        };
        
        const handleChangeTeam = () => {
            const newTeam = (connectedUsers[userId].team == 1 ? 2 : 1);
            const message = {
                type     : "team_changed",
                user_id  : userId,
                new_team : newTeam,
            };
            socket.send(JSON.stringify(message));
        };
        
        const handleChangeRole = () => {
            const newRole = (connectedUsers[userId].role == "brain" ? "hand" : "brain");
            const message = {
                type     : "role_changed",
                user_id  : userId,
                new_role : newRole,
            };
            socket.send(JSON.stringify(message));
        }
        
        const handleClose = () => {
            console.log("Disconnected from socket");
        };
        
        const handleStartGame = () => {
            const message = {
                type    : "start_game",
                user_id : userId,
            };
            socket.send(JSON.stringify(message));
        }
        
        const handleBeforeunload = () => {
            if (userId != null) {
                const message = {
                    type    : "user_left",
                    user_id : userId,
                };
                socket.send(JSON.stringify(message));
            }
        }
        
        const handleMessage = (event) => {
            const data = JSON.parse(event.data).payload;
            switch (data.event) {
                case "connected_users":
                    setConnectedUsers(data.connected_users);
                    setOwnerId(data.owner_id);
                    if (userId == null)
                        setUserId(data.new_id);
                    break;
                case "start_game":
                    setGameRoomVisible(true);
                    setLobbyVisible(false);
                    setRoles(data.roles);
                    break;
                case "failed_start":
                    if (data.userId == userId) {
                        alert(data.content);
                    }
                    break;
                default:
                    break;
            }
        }
        
        const change_team_btn = document.getElementById("change-team-btn");
        const change_role_btn = document.getElementById("change-role-btn");
        const start_game_btn = document.getElementById("start-game-btn");
        
        start_game_btn.addEventListener("click", handleStartGame);
        change_team_btn.addEventListener("click", handleChangeTeam);
        change_role_btn.addEventListener("click", handleChangeRole);
        window.addEventListener("beforeunload", handleBeforeunload);
        socket.addEventListener("open", handleOpen);
        socket.addEventListener("close", handleClose);
        socket.addEventListener("message", handleMessage);
        
        return () => {
            start_game_btn.removeEventListener("click", handleStartGame);
            change_team_btn.removeEventListener("click", handleChangeTeam);
            change_role_btn.removeEventListener("click", handleChangeRole);
            window.removeEventListener("beforeunload", handleBeforeunload);
            socket.removeEventListener("open", handleOpen);
            socket.removeEventListener("close", handleClose);
            socket.removeEventListener("message", handleMessage);
            socket.close();
        }
    }, [nickname, roomCode, userId, connectedUsers]);
    
    return (
        <div id="join-room-section" className="text-center">
            <div className="container">
                {isLobbyVisible && (
                    <div id="join-room-section" className="text-center">
                        <h2 className="text-center">Room: {roomCode}</h2>
                        <div className="row">
                            <div className="col-sm-6">Team 1</div>
                            <ul>
                                {Object.keys(connectedUsers).map((key, index) => {
                                    return connectedUsers[key].team === 1
                                        ? <li key={index}>{connectedUsers[key].nickname + " (" + connectedUsers[key].role + ")" + (ownerId == key ? " (owner)" : "")}</li>
                                        : null
                                })}
                            </ul>
                            <div className="col-sm-6">Team 2</div>
                            <ul>
                                {Object.keys(connectedUsers).map((key, index) => {
                                    return connectedUsers[key].team === 2
                                        ? <li key={index}>{connectedUsers[key].nickname + " (" + connectedUsers[key].role + ")" + (ownerId == key ? " (owner)" : "")}</li>
                                        : null
                                })}
                            </ul>
                        </div>
                        <div className="text-center">
                            <button
                                type="button"
                                className="btn btn-success mx-3"
                                id="start-game-btn"
                            >
                                Start Game
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger mx-3"
                                id="leave-room-btn"
                                onClick={() => window.location.reload(false)}
                            >
                                Leave Room
                            </button>
                        </div>
                        
                        <button
                            type="button"
                            className="btn btn-primary mx-3"
                            id="change-team-btn"
                        >
                            Change team
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary mx-3"
                            id="change-role-btn"
                        >
                            Change role
                        </button>
                    </div>
                )}
                
                {isGameRoomVisible && (
                    <GameRoom
                        roomCode={roomCode}
                        connectedUsers={connectedUsers}
                        userId={userId}
                        myTeam={connectedUsers[userId].team}
                        myRole={userId == roles["brain_1"] ? 0 : userId == roles["hand_1"]
                                ? 1 : userId == roles["brain_2"] ? 2 : 3}
                        roles={roles}
                    />
                )}
            </div>
        </div>
    );
}

export default RoomView;