const { JWT_User_Password } = require("../config");
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function userMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];  // Format: 'Bearer <token>'
    
    if (!token) {
        return res.status(401).json({ message: "Token is missing" });  // Use 401 for missing token
    }

    try {
        const decodedInfo = jwt.verify(token, JWT_User_Password);
        req.userId = decodedInfo.id;  // Attach decoded user ID to request
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token!" });  // Use 401 for invalid token
    }
}

module.exports = {
    userMiddleware
};
