import React, { useEffect, useState } from "react";
import GameRoom from "./GameRoom";

function RoomView({ roomCode, nickname }) {
    const [connectedUsers, setConnectedUsers] = useState({});
    const [userId, setUserId] = useState(null);
    const [ownerId, setOwnerId] = useState(null);
    const [isLobbyVisible, setLobbyVisible] = useState(true);
    const [isGameRoomVisible, setGameRoomVisible] = useState(false);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/room/${roomCode}/`);

        const handleOpen = () => {
            console.log("Connected to socket");
            if (userId == null) {
                console.log("Sending new-user msg");
                const message = {
                    type: 'user_joined',
                    nickname: nickname,
                };
                socket.send(JSON.stringify(message));
            }
        };

        const handleChangeTeam = (newTeam) => {
            console.log("changing to team " + newTeam);
            const message = {
                type: 'team_changed',
                user_id: userId,
                new_team: newTeam,
            };
            socket.send(JSON.stringify(message));
        };

        const handleChangeRole = (newRole) => {
            const message = {
                type: 'role_changed',
                user_id: userId,
                new_role: newRole,
            };
            socket.send(JSON.stringify(message));
        }

        const handleChangeTeam1 = () => handleChangeTeam(1);
        const handleChangeTeam2 = () => handleChangeTeam(2);
        const handleSwitchToHand = () => handleChangeRole("hand");
        const handleSwitchToBrain = () => handleChangeRole("brain");

        const handleClose = () => {
            console.log("Disconnected from socket");
        };

        const handleStartGame = () => {
            const message = {
                type: 'start_game',
                user_id: userId,
            };
            socket.send(JSON.stringify(message));
        }

        const handleBeforeunload = () => {
            if (userId != null) {
                const message = {
                    type: 'user_left',
                    user_id: userId,
                };
                socket.send(JSON.stringify(message));
            }
        }

        const handleMessage = (event) => {
            const data = JSON.parse(event.data).payload;
            switch (data.event) {
                case 'connected_users':
                    setConnectedUsers(data.connected_users);
                    setOwnerId(data.owner_id);
                    if (userId == null)
                        setUserId(data.new_id);

                    break;
                case 'start_game':
                    setGameRoomVisible(true);
                    setLobbyVisible(false);
                default:
                    break;
            }
        }

        const join_team_1_btn = document.getElementById("join-team-1-btn");
        const join_team_2_btn = document.getElementById("join-team-2-btn");
        const switch_to_hand_btn = document.getElementById("switch-to-hand-btn");
        const switch_to_brain_btn = document.getElementById("switch-to-brain-btn");
        const start_game_btn = document.getElementById("start-game-btn");

        start_game_btn.addEventListener('click',        handleStartGame);
        join_team_1_btn.addEventListener('click',       handleChangeTeam1);
        join_team_2_btn.addEventListener('click',       handleChangeTeam2);
        switch_to_hand_btn.addEventListener('click',    handleSwitchToHand);
        switch_to_brain_btn.addEventListener('click',   handleSwitchToBrain);
        window.addEventListener('beforeunload',         handleBeforeunload);
        socket.addEventListener('open',                 handleOpen);
        socket.addEventListener('close',                handleClose);
        socket.addEventListener('message',              handleMessage);

        return () => {
            start_game_btn.removeEventListener('click',         handleStartGame);
            join_team_1_btn.removeEventListener('click',        handleChangeTeam1);
            join_team_2_btn.removeEventListener('click',        handleChangeTeam2);
            switch_to_hand_btn.removeEventListener('click',     handleSwitchToHand);
            switch_to_brain_btn.removeEventListener('click',    handleSwitchToBrain);
            window.removeEventListener('beforeunload',          handleBeforeunload);
            socket.removeEventListener('open',                  handleOpen);
            socket.removeEventListener('close',                 handleClose);
            socket.removeEventListener('message',               handleMessage);
            socket.close();
        }
    }, [nickname, roomCode, userId]);

    // const handleStartGame = () => {
    //     setGameRoomVisible(true);
    //     setLobbyVisible(false);
    // };

    return (
        <div id="join-room-section" className="text-center">
            <div className="container">
                {isLobbyVisible && (
                    <div id="join-room-section" className="text-center">
                        <h2 className="text-center">Room: { roomCode }</h2>
                        <div className="row">
                            <div className="col-sm-6">Team 1</div>
                            <ul>
                                { Object.keys(connectedUsers).map((key, index) => {
                                    return connectedUsers[key].team === 1
                                    ?   <li key={index}>{connectedUsers[key].nickname + " (" + connectedUsers[key].role + ")" + (ownerId == key ? " (owner)" : "")}</li>
                                    :   null
                                })}
                            </ul>
                            <div className="col-sm-6">Team 2</div>
                            <ul>
                                { Object.keys(connectedUsers).map((key, index) => {
                                    return connectedUsers[key].team === 2
                                    ?   <li key={index}>{connectedUsers[key].nickname + " (" + connectedUsers[key].role + ")" + (ownerId == key ? " (owner)" : "")}</li>
                                    :   null
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
                            id="join-team-1-btn"
                        >
                            Join team 1
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary mx-3"
                            id="join-team-2-btn"
                        >
                            Join team 2
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary mx-3"
                            id="switch-to-hand-btn"
                        >
                            Switch to hand
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary mx-3"
                            id="switch-to-brain-btn"
                        >
                            Switch to brain
                        </button>
                    </div>
                )}

                {isGameRoomVisible && (
                    <GameRoom
                        connectedUsers={connectedUsers}
                        roomCode={roomCode}
                        initUser="1"
                    />
                )}
            </div>
        </div>
    );
}

export default RoomView;