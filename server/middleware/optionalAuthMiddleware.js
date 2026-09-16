const jwt = require("jsonwebtoken");

// Like authMiddleware, but does NOT reject the request if no token is present.
// Used on public routes so we can still detect a logged-in user and only
// return sensitive fields (like fileUrl) to them.
const optionalAuthMiddleware = (req, res, next) => {

    const token = req.headers.authorization;

    if (!token) {
        req.user = null;
        return next();
    }

    try {

        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded;

    } catch (error) {
        req.user = null;
    }

    next();
};

module.exports = optionalAuthMiddleware;
