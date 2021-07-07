function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.isAuthenticated() && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Not Admin" });
  }
}

module.exports = { isAuth: isAuth, isAdmin: isAdmin };
