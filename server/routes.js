var User = require('./model/user');


module.exports = function(app, passport){
	app.get('/', function(req, res){
		res.render('index.ejs');
	});


	app.get('/signup', function(req, res){
		res.render('signup.ejs');
	});




	
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
//  return res.json( {user: req.user});
	res.redirect('/profile');  
});


	app.get('/profile', isLoggedIn, function(req, res){
		res.render('login.ejs', { user: req.user });
	});


	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
});
};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect('/login');
}