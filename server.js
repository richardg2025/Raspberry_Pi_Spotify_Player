// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

let playerProcess = null;
let serverProcess = null;

app.use(bodyParser.json());
app.use(cors());

const FILE_PATH = './AssignedTags.json';

app.post('/assign', (req, res) => {
    const { id, uri } = req.body;
    console.log('Received ID:', id, 'Received URI:', uri);

    if (!id || !uri) {
        return res.status(400).send('RFID ID and URI are required.');
    }

    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        let assignedTags = {};
        
        if (err) {
            if (err.code === 'ENOENT') {
                console.log('File not found, creating new one.');
            } else {
                console.error('Error reading file:', err);
                return res.status(500).send('Server error');
            }
        } else {
            try {
                assignedTags = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
            }
        }

        assignedTags[id] = uri;

        fs.writeFile(FILE_PATH, JSON.stringify(assignedTags, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).send('Server error');
            }

            console.log('Assignment successful');
            res.status(200).send('Assignment successful');
        });
    });
});

app.post('/start-server', (req, res) => {
    if (serverProcess) {
        return res.status(400).send('Server is already running');
    }

    serverProcess = spawn('python3', ['server.py']);

    serverProcess.stdout.on('data', (data) => {
        console.log(`Server stdout: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`Server stderr: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        serverProcess = null;
    });

    res.status(200).send('Server started');
});

const axios = require('axios');

app.post('/stop-server', async (req, res) => {
    if (serverProcess) {
        try {
            await axios.get('http://localhost:5000/shutdown');
            serverProcess.kill();
            serverProcess = null;
            res.status(200).send('Server stopped');
        } catch (error) {
            console.error('Error stopping server:', error);
            res.status(500).send('Error stopping server');
        }
    } else {
        res.status(400).send('Server is not running');
    }
});

app.post('/start-player', (req, res) => {
    if (playerProcess) {
      return res.status(400).send('Player is already running');
    }
  
    playerProcess = spawn('python3', ['player.py']);
  
    playerProcess.stdout.on('data', (data) => {
      console.log(`Player stdout: ${data}`);
    });
  
    playerProcess.stderr.on('data', (data) => {
      console.error(`Player stderr: ${data}`);
    });
  
    playerProcess.on('close', (code) => {
      console.log(`Player process exited with code ${code}`);
      playerProcess = null;
    });
  
    res.status(200).send('Player started');
  });
  
  app.post('/stop-player', async (req, res) => {
    if (playerProcess) {
      try {
        playerProcess.kill('SIGTERM');
        playerProcess = null;
        res.status(200).send('Server exited');
      } catch (error) {
        console.error('Error exiting server:', error);
        res.status(500).send('Error exiting server');
      }
    } else {
      res.status(200).send('Server is already exited');
    }
  });

app.listen(PORT, () => {
    console.log(`Server controller running on port ${PORT}`);
});