const express = require('express');
const app = express();
const path = require('path');
const upload = require('express-fileupload');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const {select, generateDate} = require('./helpers/handlebars-helpers');
const flash = require('connect-flash');
const session = require('express-session');
const {mongodbUrl} = require('./config/database');
const passport = require('passport');

mongoose.Promise = global.Promise;

mongoose.connect(mongodbUrl, {useNewUrlParser: true}).then(db => {
    console.log("Mongo Connected");
}).catch(error => console.log(error));

app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select, generateDate: generateDate}}));
app.set('view engine', 'handlebars');


//Upload Middleware
app.use(upload());


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'Hemel1234Sm',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//Local Variables using Middleware
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash('error');
    next();
});

const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

app.use('/', home);
app.use('/admin',admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);


app.listen(5000, () => {
    console.log("Server Running...");
});