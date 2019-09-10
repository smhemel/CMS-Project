const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

router.all('/*', (req, res, next) => {
    req.app.locals.layout  = 'home';
    next();
});


router.get('/', (req, res) => {

    Post.find({}).then(posts => {
        Category.find({}).then(categories => {
            res.render('home/index', {posts: posts, categories: categories});
        });
    });
});

router.get('/about', (req, res) => {
    res.render('home/about');
});


router.get('/login', (req, res) => {
    res.render('home/login');
});

passport.use(new localStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({email: email}).then(user => {

        if(!user) return done(null, false, {message: 'No user found'});

        bcrypt.compare(password, user.password, (err, method) => {
            if(err) throw err;
            if(method) return done(null, user);
            else return done(null, false, {message: 'Incorrect password.'});
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true

    })(req, res, next);
});


router.get('/logout', (req, res ) => {
    req.logOut();
    res.redirect('/login');
})


router.get('/register', (req, res) => {
    res.render('home/register');
});

router.post('/register', (req, res) => {

    let errors = [];

    if(!req.body.firstName) errors.push({message: 'please add your first name'});
    if(!req.body.lastName) errors.push({message: 'please add your last name'});
    if(!req.body.email) errors.push({message: 'please add your email'});
    if(!req.body.password !== !req.body.passwordConfirm) errors.push({message: "password field don't match"});

    if(errors.length>0) {
        res.render('/home/register', {
           errors: errors,
           firstName: req.body.firstName,
           lastName: req.body.lastName,
           email: req.body.email
        });
    } else {

        User.findOne({email: req.body.email}).then(user => {
            if(user) {
                req.flash('error_message', 'This email is already exists');
                res.redirect('/login');
            } else {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                });
        
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err,hash) => {
                        newUser.password = hash;
                        newUser.save().then(savedUser => {
                            req.flash('success_message', 'You are now registered, please login');
                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});

router.get('/post/:id', (req, res) => {
    Post.findOne({_id: req.params.id})
        .populate({path: 'comments', populate: {path: 'user', model: 'users'}})
        .populate('user')
        .then(post => {
            Category.find({}).then(categories => {
                res.render('home/post', {post: post, categories: categories});
            });
        });
});


module.exports = router;