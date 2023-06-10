import React, { useState, useEffect } from "react";

function JoinRoomSection({ onSubmit, roomCode, onChangeRoomCode }) {
    const handleReturnClick = (event) => {
        event.preventDefault();
        window.location.reload(false);
    };

    return (
        <div id="join-room-section" className="text-center">
            <h2 className="text-center">Join Room</h2>
            <form id="join-room-form" onSubmit={onSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        id="room-code"
                        name="code"
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={onChangeRoomCode}
                    />
                </div>
                <button type="submit" className="btn btn-success mx-3">
                    Join
                </button>
                <button onClick={handleReturnClick} className="btn btn-danger mx-3">
                    Return
                </button>
            </form>
        </div>
    );
}

export default JoinRoomSection;