var express = require('express');
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
// User authentication using passport
    passport = require('passport'),
// Authentication code moved to separate file
    authenticate = require('./authenticate'),
// import the configuration properties
    config = require('./config');

// Get the connection URL to the MongoDB from the configuration file
mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

var index = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var favoritesRouter = require('./routes/favoritesRouter');

var app = express();

// Secure traffic only
// Ovaj middleware presrece sav saobracaj koji dolazi,
// i u najkracem: svaki zahtev koji dodje na nebezbedni port bice preusmeren na bezbedni.
app.all('*', function (req, res, next) { // zvezdica na mestu 'rute' podrazumeva da se middleware bavi svim saobracajem koji se odvija
  if (req.secure) { // ako zahtev dolazi na 'sigurni port' onda ce 'req.secure' biti 'true' boolean vrednost.
    return next(); // a ako je tako, ovim se takav zahtev prosledjuje dalje 
  };
  res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
  // redirect() je iz express-a. Parametar koji zahteva je URL na koji prosledjujemo sve zahteve koji nisu dosli na 'secure port'.
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// passport initialization (configuration is in authenticate.js)
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotion', promoRouter);
app.use('/leadership', leaderRouter);
app.use('/favorites', favoritesRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers --->

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});
// <--- error handlers end



module.exports = app;
