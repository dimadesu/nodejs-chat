module.exports = function (router) {

    router.use(function (req, res, next) {
        if(!req.isAuthenticated()){
            return res.redirect('/signin');
        }
        return next();
    });

};
