const express = require("express");
const passport = require("passport");
const userRoutes = require("./users");
const auth = require("./users/oauthGoogle.js");
const authFace = require("./users/oathFacebook.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const mongoose = require("mongoose");
dotenv.config();

const whitelist = ["http://localhost:3000","https://spotifyfe.herokuapp.com"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const server = express();
server.use(cookieParser());
server.use(cors(corsOptions));
server.use(passport.initialize());
// server.use()
server.use(express.json());

server.use("/users", userRoutes);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(process.env.PORT, () => {
      console.log("Running on ", process.env.PORT);
    })
  );
