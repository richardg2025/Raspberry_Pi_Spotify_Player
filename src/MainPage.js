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
            console.log('Mini Vinyl scanned:', data);
            setRfidId(data.id);
            navigate('/app', { state: { rfidId: data.id } });
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    return (
        <div className="page-container MainPage">
            <h1 className="page-title">Welcome to Your RFID Spotify Player</h1>
            <p className="page-text">Please scan the Mini Vinyl you want to assign.</p>
        </div>
    );
};

export default MainPage;