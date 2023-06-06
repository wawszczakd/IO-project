import React, { useState } from "react";
import JoinRoomSection from "./JoinRoomSection";

function HomePage() {
    const [nickname, setNickname] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [isJoinRoomVisible, setJoinRoomVisible] = useState(false);
    const [isMainVisible, setMainVisible] = useState(true);

    const handleNicknameChange = (e) => {
        setNickname(e.target.value);
    };

    const handleRoomCodeChange = (e) => {
        setRoomCode(e.target.value);
    };

    const handleJoinRoom = () => {
        setJoinRoomVisible(true);
        setMainVisible(false);
    };

    const handleCreateRoom = () => {
        
    };

    const handleJoinRoomSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="container">
            <div className="row mt-5">
                <div className="col-md-6 offset-md-3">
                    <h1 className="text-center">Project IO</h1>
                    {isMainVisible && (
                        <form id="nickname-form">
                            <div className="form-group">
                                <label htmlFor="nickname">Nickname:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nickname"
                                    placeholder="Enter your nickname"
                                    value={nickname}
                                    onChange={handleNicknameChange}
                                />
                            </div>
                            <div className="text-center">
                                <button
                                    type="button"
                                    className="btn btn-primary mx-3"
                                    id="create-room-btn"
                                    onClick={handleCreateRoom}
                                >
                                    Create Room
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary mx-3"
                                    id="join-room-btn"
                                    onClick={handleJoinRoom}
                                >
                                    Join Room
                                </button>
                            </div>
                        </form>
                    )}

                    {isJoinRoomVisible && (
                        <JoinRoomSection
                            onSubmit={handleJoinRoomSubmit}
                            roomCode={roomCode}
                            onChangeRoomCode={handleRoomCodeChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;