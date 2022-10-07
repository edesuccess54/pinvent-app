const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middleWare/errorMiddleWare')
const cookieParser = require('cookie-parser')

const userRoute = require('./routes/userRoute');

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser( ))
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

// routes middleware
app.use("/api/users", userRoute)

// routes
app.get("/", (req, res) => {
    res.send("Home page");
})

// error middleware
app.use(errorHandler)

const PORT = process.env.PORT || 6000;
// connect to mongoDB and start server
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
})
.catch((error) => {
    console.log(error.message)
})





