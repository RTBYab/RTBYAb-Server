const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  socialLogin
} = require("../../controllers/auth");

// import password reset validator
const {
  userSignupValidator,
  passwordResetValidator
} = require("../../helpers/validator");
const { userById } = require("../../controllers/user");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// password forgot and reset routes
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidator, resetPassword);

// then use this route for social login
router.post("/social-login", socialLogin);

// any route containing :userId, our app will first execute userByID()
router.param("userId", userById);

module.exports = router;
