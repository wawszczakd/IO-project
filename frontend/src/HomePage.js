import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import JoinRoomSection from "./JoinRoomSection";
import RoomView from "./RoomView";

function HomePage() {
    const [nickname, setNickname] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [isJoinRoomVisible, setJoinRoomVisible] = useState(false);
    const [isMainVisible, setMainVisible] = useState(true);
    const [isRoomVisible, setRoomVisible] = useState(false);

    useEffect(() => {
        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            const { type, payload } = data;
    
            switch (type) {
                case 'room_created':
                    console.log(`Room created: Code ${ payload.room_code }`);
                    setRoomCode(payload.room_code);
                    switchToRoomView();
                    break;
                case 'room_joined':
                    console.log(`Joined room: Code ${ payload.room_code }`);
                    switchToRoomView();
                    break;
                case 'room_not_found':
                    console.log('Room not found:', payload.error);
                    break;
                default:
                    break;
            }
        }

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, []);

    const switchToRoomView = () => {        
        setRoomVisible(true);
        setMainVisible(false);
        setJoinRoomVisible(false);
    };

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
        const message = {
            type: 'create_room',
            payload: '',
        };
        socket.send(JSON.stringify(message));
    };

    const handleJoinRoomSubmit = (e) => {
        e.preventDefault();
        const message = {
            type: 'join_room',
            payload: roomCode,
        };
        socket.send(JSON.stringify(message));
    };

    return (
        <div className="container">
            <div className="row mt-5">
                <div className="col-md-6 offset-md-3">
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

                    {isRoomVisible && (
                        <RoomView
                            roomCode={roomCode}
                            nickname={nickname}
                            socket={socket}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;