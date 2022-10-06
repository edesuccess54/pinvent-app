const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT || 6000;

// connect to mongoDB and start server
mongoose.connect(MONGO_URI)
.then(() => {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
})
.catch((error) => {
    console.log(error.message)
})





