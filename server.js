/*
   WebProject - ece9065
   Authors :
        saurabh chopra - schopr9@uwo.ca
        Ali javanamrdi - ajavanma@uwo.ca
*/
                            
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var configDB = require('./config/database.js');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
//var googleapis = require('googleapis');
var morgan       = require('morgan');
app.use(express.static(path.resolve(__dirname, 'client')));
mongoose.connect(configDB.url);

require('./config/passport')(passport);

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ 
      resave: true,
      saveUninitialized: true,
    secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session




require('./server/routes.js')(app,passport);



app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
