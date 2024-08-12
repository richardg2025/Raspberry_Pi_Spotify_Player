// MainPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const MainPage = () => {
    const navigate = useNavigate();
    const [rfidId, setRfidId] = useState("");

    useEffect(() => {
        // Start server.py when MainPage is loaded
        axios.post('http://localhost:4000/start-server')
            .then(response => console.log(response.data))
            .catch(error => console.error('Error starting server:', error));

        const socket = io('http://localhost:5000');

        socket.on('rfid_scan', (data) => {
            console.log('Mini Vinyl scanned:', data);
            setRfidId(data.id);
            navigate('/app', { state: { rfidId: data.id } });
        });

        return () => {
            // Stop server.py when MainPage is unmounted
            axios.post('http://localhost:4000/stop-server')
                .then(response => console.log(response.data))
                .catch(error => console.error('Error stopping server:', error));
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