const { JWT_Admin_Password } = require("../config");
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token for admin
const adminMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_Admin_Password);
        req.userId = decoded.id; // Attach user id to the request object
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};


module.exports = {
    adminMiddleware
};
