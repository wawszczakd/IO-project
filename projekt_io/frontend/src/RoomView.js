import React from "react";

function RoomView({ roomCode, socket }) {
    return (
        <div id="join-room-section" className="text-center">
            <h2 className="text-center">Room: { roomCode }</h2>
        </div>
    );
}

export default RoomView;