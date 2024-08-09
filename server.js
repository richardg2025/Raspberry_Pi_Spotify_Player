const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 4000;

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
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Server error');
        }

        let assignedTags = [];
        try {
            assignedTags = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }

        assignedTags.push({ id, uri });

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});