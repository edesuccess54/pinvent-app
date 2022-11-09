const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler( async(req, res, next) => {
    try {
        const token = req.cookies.token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNTQwMTkwYjEzOTcyMDQwMzc3ZmQzZCIsImlhdCI6MTY2Nzk5ODExMywiZXhwIjoxNjY4MDg0NTEzfQ.tsyTFa0lQAoVubudJw5tez183EeO_xUIpFVFRxsIppg"
        

        console.log("here is the token: ", token)

        if(!token) {
            res.status(401)
            throw new Error("Not authorized, please login oo")
        }

        // verify token 
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // get user id from token 
        const user = await User.findById(verified.id).select("-password")

        if(!user) {
            res.status(401)
            throw new Error("user not found")
        }

        req.user = user;
        next()

    } catch (error) {
        res.status(401).json({
            error: error.message
        })
        // throw new Error("Not authorized please okay nah")
    }
})

module.exports = protect