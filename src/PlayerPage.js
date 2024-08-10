// PlayerPage.js
import React, { useEffect } from 'react';

const PlayerPage = () => {
    useEffect(() => {
        const startPlayer = async () => {
            try {
                const response = await fetch('http://localhost:4000/start-player', {
                    method: 'POST',
                });
                if (response.ok) {
                    console.log('Player started successfully');
                } else {
                    console.log('Failed to start player');
                }
            } catch (error) {
                console.error('Error starting player:', error);
            }
        };

        startPlayer();
    }, []);

    return (
        <div className="page-container PlayerPage">
            <h1 className="page-title">RFID Music Player</h1>
            <p className="page-text">Please scan the Mini Vinyl you want to play.</p>
        </div>
    );
};

export default PlayerPage;