var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');

var usersRouter = express.Router();

/* GET users listing. */
usersRouter.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
	User.find({}, function (err, user) {
        if (err) throw err;
        res.json(user);
  	});
});

usersRouter.get('/facebook', passport.authenticate('facebook'), function (req, res) {});

usersRouter.get('/facebook/callback', function (req, res, next) {
// <--- na ovu će rutu (sa '/facebook' rute) facebook vratiti nakon što potvrdi identitet vlasnika fb naloga <--- 
	
	passport.authenticate('facebook', function (err, user, info) {
		if (err) { // ako ima greske...
			return next(err);
		}
		if (!user) { // ako nema korisnika...
			return res.status(401).json({
				err: info
			});
		}
		req.logIn(user, function (err) {
			if (err) {
				return res.status(500).json({
					err: 'Could not log in user'
				});
			}

			var token = Verify.getToken(user);

			res.status(200).json({
				status: 'Login successful!',
				success: true,
				token: token
			});
		});
	})(req, res, next);

});

usersRouter.post('/register', function (req, res, next) {
	User.register(new User({ username: req.body.username }),
		req.body.password, function (err, user) {
			if (err) {
				return res.status(500).json({err: err});
			}

			if (req.body.firstName) {
				user.lastName = req.body.lastName;
			}

			user.save(function (err, user) {
				passport.authenticate('local')(req, res, function () {
					return res.status(200).json({status: 'Registration Successful!'});
				});
			});
		});
});

usersRouter.post('/login', function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(401).json({
				err: info
			});
		}

		req.logIn(user, function(err) {
	    	if (err) {
		        return res.status(500).json({
		          err: 'Could not log in user'
		        });
		      }
	        
	        // ovde vraca token za navedenog korisnika (ili ga i pravi prethodno?) -->
		    var token = Verify.getToken(user);

	        res.status(200).json({
		        status: 'Login successful!',
		        success: true,
		        token: token
		    });
	    });
	})(req, res, next);
});

	// <<--- token nije unisten, logout nemoguc! --->>
usersRouter.get('/logout', Verify.verifyOrdinaryUser, function (req, res) {
	req.logout(); // nepostojeca logout() funkcija?
	res.status(200).json({
		status: 'Bye!'
	});
	// takodje bi ovde trebao biti unisten token
	// kako se korisnik ne bi mogao vratiti kao prijavljen,
	// ali to je ovde propusteno da se uradi.
});

module.exports = usersRouter;