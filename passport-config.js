const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("./db");

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    //check if user exists
    const [results] = await getUserByEmail(email);
    //console.log(JSON.stringify(results[0]));
    const user = JSON.parse(JSON.stringify(results[0]));
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }
    //check if pw is correct
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Pasword incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const [results] = await getUserById(id);
    return done(null, results[0]);
  });
}

module.exports = initialize;
