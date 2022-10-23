const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const Token = require("../models/tokenModel")
const crypto = require('crypto');
const sendEmail = require("../utils/sendEmail");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register User function
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email has already been taken");
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login User function
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //   Generate Token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});


// logout user function
const logout = asyncHandler( async (req, res) => {
    // Send HTTP-only cookie
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({message: "Successfully Logged out"})
})

// get user data 
const getUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(201).json({
          _id,
          name,
          email,
          photo,
          phone,
          bio,
        });
      } else {
        res.status(400);
        throw new Error("user not found");
      }
})

// get login status 
const loginStatus = asyncHandler(async (req, res) => {

  const token = req.cookies.token;
  if(!token) {
    return res.json(false)
  }

  // verify token 
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if(verified) {
    return res.json(true)
  } else {
    return res.json(false)
  }
})

// update user function 

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if(user) {
    const {name, email, photo, phone, bio } = user
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await User.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    })
  } else {
    res.status(400);
      throw new Error("user not found");
  }

})

// change password function 
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const {oldpassword, password} = req.body

  // check if user exist
  if(!user) {
    res.status(400);
    throw new Error("user not found, please login");
  }

  // validation
  if(!oldpassword ||!password) {
    res.status(400);
    throw new Error("Old password and password are required");
  }

  // check if oldpassword matches password in db 
  const passwordIsCorrect = await bcrypt.compare(oldpassword, user.password);

  if(!passwordIsCorrect) {
      res.status(400);
      throw new Error("Old password is not correct");
  }

  // save new password 
  if(user && passwordIsCorrect) {
    user.password = password;
    await user.save()
    res.status(200).send("password change successfully")
  } else {
    res.status(400);
    throw new Error("Password is not correct");
  }

})

// forgotPassword function
const forgotPassword = asyncHandler( async (req, res) => {
  const {email} = req.body
  const user = await User.findOne({email}) 

  if(!user) {
    res.status(400);
    throw new Error("user does not found");
  }

  // delete token if it exits in database 
  let token = await Token.findOne({userid: user._id})
  if(token) {
    await Token.deleteOne({_id: token._id}) 
  }

  // create reset token 
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  // hash token before saving to db 
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  // save token to db 
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000) //30 minutes,
  }).save()

  // construct reset url 
  const resetUrl = `${process.env.FRONTEND_URL}/auth/resetpassword/${resetToken}`

  // reset email 
  const message = `
    <h2>Hellow ${user.name}</h2>
    <p>Please use the url below to reset your password</p>
    <p>This reset link is only valid for 30 minutes</p>

    <a href=${resetUrl} clicktracking="off">${resetUrl}</a>

    <p>regards...</p>
    <p>Pinvent Team</p>
  `

  const subject = "Password Reset Request";
  const send_to = user.email
  const sent_from = process.env.EMAIL_USER


  try {
    await sendEmail(subject, message, send_to, sent_from)
    res.status(200).json({
      success: true,
      message: "Reset Email Sent"
    })
    
  } catch (error) {
    res.status(500)
    throw new Error("email not sent, please try again")
  }
})

// reset password 
const resetPassword = asyncHandler(async(req, res) => {
  const {password} = req.body
  const resetToken = req.params


})

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}