const {
  signup,
  signin,
  signout,
  getById,
  forgotPassword,
  resetPassword,
  socialLogin
} = require("../../controllers/auth");
const {
  userSignupValidator,
  userSigninValidator,
  passwordResetValidator
} = require("../../helpers/validator");
const express = require("express");
const router = express.Router();
const { userById } = require("../../controllers/user");
const { catchErrors } = require("../../helpers/Errors.js");

// TODO: import password reset validator

router.post("/signup", userSignupValidator, catchErrors(signup));
router.post("/signin", userSigninValidator, catchErrors(signin));

// Get User By Id
router.get("/cuser/:id", catchErrors(getById));

router.get("/signout", signout);

// password forgot and reset routes
router.post("/forgot-password", catchErrors(forgotPassword));
router.put(
  "/reset-password",
  passwordResetValidator,
  catchErrors(resetPassword)
);

// then use this route for social login
router.post("/social-login", socialLogin);

// any route containing :userId, our app will first execute userByID()
router.param("userId", catchErrors(userById));

module.exports = router;
