const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(cors());

app.post('/assign', (req, res) => {
    const { id, uri } = req.body;
    console.log('Received ID:', id, 'Received URI:', uri);

    if (!id || !uri) {
        return res.status(400).send('RFID ID and URI are required.');
    }

    res.status(200).send('Assignment successful');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});