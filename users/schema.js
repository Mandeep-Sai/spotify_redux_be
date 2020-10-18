const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  googleId: String,
  playlists: Array,
  listOfLikedSongs: Array,
});

const userModel = model("spotifyuser", userSchema);

module.exports = userModel;
