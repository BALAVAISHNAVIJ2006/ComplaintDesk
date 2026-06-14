/**
 * adminOnly — must run after `protect`.
 * Rejects any user whose role is not 'admin'.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return res.status(403).json({ message: 'Access denied. Admins only.' })
}

module.exports = { adminOnly }
