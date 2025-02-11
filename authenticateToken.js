const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // Attach user to request
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
