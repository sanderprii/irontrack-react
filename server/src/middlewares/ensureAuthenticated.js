module.exports = function ensureAuthenticated(req, res, next) {


    if (req.session && req.session.userId) {

        return next();
    }


    return res.status(401).json({ error: 'Unauthorized', session: req.session });
};
