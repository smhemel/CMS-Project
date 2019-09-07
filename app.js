const express = require('express');
const app = express();
const path = require('path');
const upload = require('express-fileupload');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const {select} = require('./helpers/handlebars-helpers');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/cms', {useNewUrlParser: true}).then(db => {
    console.log("Mongo Connected");
}).catch(error => console.log(error));

app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select}}));
app.set('view engine', 'handlebars');


//Upload Middleware
app.use(upload());
app.use(flash());


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');

app.use('/', home);
app.use('/admin',admin);
app.use('/admin/posts', posts);


app.listen(5000, () => {
    console.log("Server Running...");
});