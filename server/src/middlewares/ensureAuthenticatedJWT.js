const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'salajane_jwt_voti';

module.exports = function ensureAuthenticatedJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

   let token = authHeader;
    if (!token) {
        return res.status(401).json({ error: 'Invalid Authorization format' });
    }

    

    try {
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
