const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');

// Signup - GET Route
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// Signup - POST Route
router.post("/signup", wrapAsync(async (req, res) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser =await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err)
            {
                return next(err);
            }
            req.flash('success', 'Welcome to WayWise!');
            res.redirect('/listings');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect("/signup");
    }
}));

// Login - GET Route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// Login - POST Route
router.post(
    "/login", 
    saveRedirectUrl,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }), 
    async (req, res) => {
        req.flash("success","Welcome-Back to WayWise!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
);

// Logout Route
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) { 
            return next(err); 
        }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
    });
});




module.exports = router;