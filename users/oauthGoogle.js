const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const userModel = require("./schema");
const jwt = require("jsonwebtoken");

const authenticate = async (user) => {
  try {
    // generate tokens
    const newAccessToken = await jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );

    return { token: newAccessToken };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID:
        "661623475170-07r1tnns5ku8jqc4ht1eri95nl4796eh.apps.googleusercontent.com",
      clientSecret: "GmXIoMDX2dzBQWnyUmOIpA9F",
      callbackURL: "http://localhost:3003/users/googleRedirect",
      passReqToCallback: true,
    },

    async (request, accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleId: profile.id,
        username: profile.name.givenName,
        email: profile.emails[0].value,
      };
      try {
        const user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          const tokens = await authenticate(user);
          done(null, { user, tokens });
        } else {
          let createdUser = await userModel.create(newUser);
          const tokens = await authenticate(createdUser);
          done(null, { user, tokens });
        }
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
