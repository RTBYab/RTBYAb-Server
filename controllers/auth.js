const Language = require("../helpers//Language");
const TrezSmsClient = require("trez-sms-client");
const { sendEmail } = require("../helpers");
const expressJwt = require("express-jwt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
require("dotenv").config();

exports.signup = async (req, res) => {
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists)
    return res.status(403).json({
      error: "Email is taken!"
    });
  const user = await new User(req.body);
  await user.save();
  res.status(200).json({ message: "Signup success! Please login." });
};

exports.signin = async (req, res) => {
  // find the user based on email
  const { email, password } = req.body;
  await User.findOne({ email }, (err, user) => {
    // if err or no user
    if (err || !user || !user.isActive) {
      return res.status(401).json({
        error: "User with that email does not exist. Please signup."
      });
    }
    // if user is found make sure the email and password match
    // create authenticate method in model and use here
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }
    // generate a token with user id and secret
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        name: user.name,
        iss: "RTBYAB",
        exp: 1200000000000
      },
      process.env.JWT_SECRET
    );
    // persist the token as 't' in cookie with expiry date
    // res.cookie("t", token, { expire: new Date() + 9999 });
    // retrun response with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};
exports.getById = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -resetPasswordLink -salt -hashed_password -comments -createdAt -created -updatedAt -__v"
  );
  if (!user) res.status(404).json({ message: Language.fa.UserNotFound });
  res.json(user);
};

exports.signout = (req, res) => {
  // res.clearCookie("t");
  return res.json({ message: "Signout success!" });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
});

exports.forgotPassword = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: Language.fa.PleaseEnterAnEmail });
  if (!req.body.email)
    return res.status(400).json({ message: Language.fa.PleaseEnterAnEmail });

  const { email } = req.body;

  const founded = await User.findOne({ email }, (err, user) => {
    if (err || !user)
      return res.status("401").json({
        error: { message: Language.fa.PasswordHasSent }
      });

    const token = jwt.sign(
      { _id: user._id, iss: "RTBYAB" },
      process.env.JWT_SECRET
    );
    const time = Date.now() + 259200;

    const emailData = {
      from: "noreply@rtbyab.com",
      to: email,
      subject: Language.fa.EmailSubject,
      text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
      html: `<p>Please use the following link to reset your password:</p> <p>${process.env.CLIENT_URL}/reset-password/${token}</p>`
    };

    return user.updateOne(
      { resetPasswordLink: token, resetPasswordTime: time },
      (err, success) => {
        if (err) return res.json({ message: err });
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
        });
      }
    );
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne(
    { resetPasswordLink, resetPasswordTime: { $gt: Date.now() } },
    (err, user) => {
      if (err || !user)
        return res.status("401").json({
          error: "Invalid Link!"
        });

      const updatedFields = {
        password: newPassword,
        resetPasswordLink: "",
        resetPasswordTime: ""
      };

      user = _.extend(user, updatedFields);
      user.updated = Date.now();

      user.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err
          });
        }
        res.json({
          message: `Great! Now you can login with your new password.`
        });
      });
    }
  );
};

exports.socialLogin = (req, res) => {
  // try signup by finding user with req.email
  let user = User.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user) {
      // create a new user and login
      user = new User(req.body);
      req.profile = user;
      user.save();
      // generate a token with user id and secret
      const token = jwt.sign(
        { _id: user._id, iss: "NODEAPI" },
        process.env.JWT_SECRET
      );
      // res.cookie("t", token, { expire: new Date() + 9999 });
      // return response with user and token to frontend client
      const { _id, name, email } = user;
      return res.json({ token, user: { _id, name, email } });
    } else {
      // update existing user with new social info and login
      req.profile = user;
      user = _.extend(user, req.body);
      user.updated = Date.now();
      user.save();
      // generate a token with user id and secret
      const token = jwt.sign(
        { _id: user._id, iss: "NODEAPI" },
        process.env.JWT_SECRET
      );
      // res.cookie("t", token, { expire: new Date() + 9999 });
      // return response with user and token to frontend client
      const { _id, name, email } = user;
      return res.json({ token, user: { _id, name, email } });
    }
  });
};

// Signup By Phone
exports.signupByPhoneNumber = async (req, res) => {
  const client = new TrezSmsClient("appnico", "QkPFXMc@bpG6rH8");
  const code = await client.autoSendCode(
    req.body.mobile,
    "آپ نیکو، بهترین کالا و خدمات در اطراف شما"
  );
  return res.status(200).json({ message: `verification code is ${code}` });
};

exports.validateCode = async (req, res) => {
  const client = new TrezSmsClient("appnico", "QkPFXMc@bpG6rH8");

  const mobile = req.body.mobile;
  const code = req.body.code;
  const codeVerification = await client.checkCode(mobile, code);
  res.send(codeVerification);
};
