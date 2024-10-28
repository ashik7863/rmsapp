const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 4500;

const router = require('./Routes/Router');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, "/client/build")));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(router);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"), function (err) {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('Something went wrong!');
        }
    });
});

app.get('/test', (req, res) => {
    res.send('Hello World2');
});

app.listen(PORT, function () {
    console.log(`Server Started at ${PORT}`);
});
