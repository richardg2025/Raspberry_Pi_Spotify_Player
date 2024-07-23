// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

app.post('/assign', (req, res) => {
    const filePath = path.join(__dirname, 'AssignedTags.json');
    const { id, uri } = req.body;

    if (!id || !uri) {
        return res.status(400).send('RFID ID and URI are required.');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Server error.');
        }

        let jsonData = [];

        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }

        jsonData.push({ [id]: uri });

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', writeErr => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).send('Server error.');
            }

            res.send('Assignment successful.');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});