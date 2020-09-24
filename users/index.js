const express = require("express");
const userModel = require("./schema");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const checkEmail = await userModel.find({ email: req.body.email });
    if (checkEmail.length !== 0) {
      res.status(409).send("user with same email exists");
    } else {
      const plainPassword = req.body.password;
      req.body.password = await bcrypt.hash(plainPassword, 8);
      const newUser = new userModel(req.body);
      await newUser.save();
      const token = await jwt.sign(
        { id: newUser._id },
        process.env.SECRET_KEY,
        {
          expiresIn: "1 hour",
        }
      );
      res.cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "none",
        secure: false,
      });
      res.send(newUser);
    }
  } catch (error) {
    //next(error);
    res.send(error.errors);
  }
});

router.post("/login", async (req, res) => {
  const user = await userModel.findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });
  const isAuthorized = await bcrypt.compare(req.body.password, user.password);
  if (isAuthorized) {
    const token = await jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1 hour",
    });
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: false,
    });

    res.send(user);
  } else {
    res.status(409).send("Invalid Credentials");
  }
});

router.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res) => {
    try {
      console.log(req.user);
      const { token } = req.user.tokens;
      res.cookie("accessToken", token, { httpOnly: true });
      res.status(200).redirect("http://localhost:3000/home");
    } catch (error) {
      console.log(error);
    }
  }
);

router.get(
  "/facebookLogin",

  passport.authenticate("facebook")
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { failureRedirect: "/register" }),
  async (req, res) => {
    try {
      console.log(req.user);
      const { token } = req.user.tokens;
      res.cookie("accessToken", token, { httpOnly: true });
      res.status(200).redirect("http://localhost:3000/");
    } catch (error) {
      console.log(error);
    }
  }
);
module.exports = router;
