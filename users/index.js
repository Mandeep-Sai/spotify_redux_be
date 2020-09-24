const express = require("express");
const userModel = require("./schema");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/me", async (req, res) => {
  const token = req.cookies.accessToken;
  const decoded = await jwt.verify(token, process.env.SECRET_KEY);
  if (decoded) {
    const user = await userModel.findById(decoded.id);
    res.send(user);
  }
});

router.post("/register", async (req, res) => {
  try {
    const checkEmail = await userModel.find({ email: req.body.email });
    console.log(checkEmail);
    if (checkEmail.length !== 0) {
      res.status(409).send("user with same email exists");
    } else {
      const plainPassword = req.body.password;
      req.body.password = await bcrypt.hash(plainPassword, 8);
      console.log(req.body);
      const newUser = new userModel(req.body);
      await newUser.save();
      res.send("registered Successfully");
    }
  } catch (error) {
    //next(error);
    res.send(error.errors);
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
