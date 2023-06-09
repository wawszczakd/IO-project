import React from "react";

function JoinRoomSection({ onSubmit, roomCode, onChangeRoomCode }) {
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
                <button type="submit" className="btn btn-primary mx-3">
                    Join
                </button>
            </form>
        </div>
    );
}

export default JoinRoomSection;