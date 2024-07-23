// MainPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const MainPage = () => {
    const navigate = useNavigate();
    const [rfidId, setRfidId] = useState("");

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('rfid_scan', (data) => {
            console.log('RFID scanned:', data);
            setRfidId(data.id);
            navigate('/app', { state: { rfidId: data.id } });
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    return (
        <div>
            <h1>Welcome to Your RFID Spotify Player</h1>
            <p>Please scan your RFID card to continue.</p>
        </div>
    );
};

export default MainPage;