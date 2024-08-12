import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

const PlayerPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Start player.py when PlayerPage is loaded
    axios.post('http://localhost:4000/start-player')
      .then(response => console.log(response.data))
      .catch(error => console.error('Error starting player:', error));

      return () => {
        axios.post('http://localhost:4000/exit-server')
          .then(response => console.log(response.data))
          .catch(error => console.error('Error exiting server:', error));
      };
    }, []);

  const stopPlayerAndGoHome = async () => {
    try {
      await axios.post('http://localhost:4000/stop-player');
      navigate('/');
    } catch (error) {
      if (error.response.status === 200 && error.response.data === 'Player is already stopped') {
        navigate('/');
      } else {
        console.error('Error stopping player:', error);
      }
    }
  };

  return (
    <div className="page-container PlayerPage">
      <h1 className="page-title">RFID Music Player</h1>
      <p className="page-text">Please scan the Mini Vinyl you want to play.</p>
      <Button variant="primary" onClick={stopPlayerAndGoHome}>
        Home
      </Button>
    </div>
  );
};

export default PlayerPage;