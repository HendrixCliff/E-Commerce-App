module.exports = function isAdmin(req, res, next) {
  console.log('🕵️‍♂️ isAdmin check — req.user:', req.user);

  if (req.user?.role?.toLowerCase() === 'admin') {
    return next();
  }

  res.status(403).json({ message: 'Admin access only' });
};

