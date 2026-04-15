function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.admin !== 1) {
    return res.status(403).render("error", {
      message: "Forbidden",
      error: {},
    });
  }

  next();
}

module.exports = requireAdmin;