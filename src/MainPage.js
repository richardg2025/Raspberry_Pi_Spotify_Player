import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const LaunchPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('rfid_scan', (data) => {
            console.log('RFID scanned:', data);
            navigate('/app'); // Redirect to the /app URL
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    const handleRedirect = () => {
        window.location.href = '/app'; // Redirect to the /app URL
    };

    return (
        <div>
            <h1>Welcome to Your RFID Spotify Player</h1>
            <p>Please scan your RFID card to continue.</p>
        </div>
    );
};

export default LaunchPage; 