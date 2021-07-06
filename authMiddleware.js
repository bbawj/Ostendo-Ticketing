function isAuth(req, res, next) {
  if (req.isAuthenticated) {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated && req.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized: Not Admin" });
  }
}

module.exports = { isAuth: isAuth, isAdmin: isAdmin };
