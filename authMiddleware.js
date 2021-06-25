function isAuth(req, res, next) {
  if (req.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized", redirectUrl: "/login" });
  }
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated && req.user.admin) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized: Not Admin", redirectUrl: "/login" });
  }
}

module.exports = { isAuth: isAuth, isAdmin: isAdmin };
