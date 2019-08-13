exports.createPostValidator = (req, res, next) => {
  // title
  req.check("title", "عنوان نباید خالی باشد").notEmpty();
  req.check("title", "Title must be between 4 to 150 characters").isLength({
    min: 4,
    max: 150
  });
  // body
  req.check("body", "Write a body").notEmpty();
  req.check("body", "Body must be between 4 to 2000 characters").isLength({
    min: 4,
    max: 2000
  });
  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};

exports.createStoreValidator = (req, res, next) => {
  // title
  req.check("name", "نام فروشگاه نمیتواند خالی باشد").notEmpty();
  req.check("name", "نام فروشگاه باید بین ۲ تا ۲۲۲ حرف باشد").isLength({
    min: 4,
    max: 222
  });
  // body
  req.check("description", "لطفا توضیحات را کامل کتید").notEmpty();
  req.check("description", "توضیحات باید بین ۲ تا ۱۲۰۰ کلمه باشد").isLength({
    min: 2,
    max: 1200
  });
  req.check("address", "لطفا آدرس دقیق فروشگاه خود را وارد کنید").notEmpty();
  req.check("address", "آدرس دقیق خود را وارد کنید").isLength({
    min: 4,
    max: 138
  });
  // req.check("coordinates", "مختصات را روی نقشه انتخاب کنید").notEmpty();
  // req.check("coordinates", "آدرس دقیق خود را وارد کنید").isNumber();

  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};

exports.userSignupValidator = (req, res, next) => {
  // name is not null and between 4-10 characters
  req.check("name", "Name is required").notEmpty();
  // email is not null, valid and normalized
  req
    .check("email", "Email must be between 3 to 32 characters")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({
      min: 4,
      max: 2000
    });
  // check for password
  req.check("password", "Password is required").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number");
  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};

exports.userSigninValidator = (req, res, next) => {
  // email is not null, valid and normalized
  req
    .check("email", "لطفا ادرس ایمیل خود را با دقت وارد نمایید")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({
      min: 4,
      max: 2000
    });
  // check for password
  req.check("password", "لطفا رمز عبور خود را با دقت وارد نمایید").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("لطفا رمز عبور خود را با دقت وارد نمایید")
    .matches(/\d/)
    .withMessage("لطفا رمز عبور خود را با دقت وارد نمایید");
  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};

exports.passwordResetValidator = (req, res, next) => {
  // check for password
  req.check("newPassword", "Password is required").notEmpty();
  req
    .check("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars long")
    .matches(/\d/)
    .withMessage("must contain a number")
    .withMessage("Password must contain a number");

  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware or ...
  next();
};
