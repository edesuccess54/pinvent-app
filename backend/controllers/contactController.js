const asyncHandler = require("express-async-handler");
const { validate } = require("../models/userModel");
const User = require('../models/userModel')
const sendEmail = require('../utils/sendEmail')

const contactUs = asyncHandler (async (req, res) => {
    const {subject, message } = req.body
    const user = await User.findById(req.user.id)

    // validattion
    if(!subject || !message) {
        res.status(404)
        throw new Error("Please add subject and message")
    }

    if (!user) {
        res.status(404)
        throw new Error("user not found please sign in")
    }

    const send_to = process.env.EMAIL_USER
    const sent_from = process.env.EMAIL_USER
    const reply_to = user.email

    try {
        await sendEmail(subject, message, send_to, sent_from, reply_to)
        res.status(200).json({
          success: true,
          message: "Email Sent"
        })
        
      } catch (error) {
        res.status(500)
        throw new Error("email not sent, please try again")
      }

})


module.exports = {
    contactUs
}