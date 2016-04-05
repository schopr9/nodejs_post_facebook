var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var BearerStrategy   = require('passport-http-bearer').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;

var User            = require('../server/model/user').User;
var Token            = require('../server/model/user').Token;
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || profile._json.image.url;
          user.save(function(err) {
            req.flash('info', { msg: 'Google account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile.emails[0].value }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
          done(err);
        } else {
          var user = new User();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = profile._json.image.url;
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

passport.use(new TwitterStrategy({

        consumerKey        : configAuth.twitterAuth.clientID,
        consumerSecret    : configAuth.twitterAuth.clientSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}, 
	  function(req, token, tokenSecret, profile, done) {
	    	process.nextTick(function(){
	    		if (!req.user){
	    			console.log("Not logged in");
	    			return done();
	    		}
	    		User.findById(req.user.id, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user) {
	    				//Need elevated permissions for email in Twitter API. So not getting it
	    				user.twitter = profile.id;
	    				user.twitterToken = token;
	    				user.twitterSecret = tokenSecret;

	    				user.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, user);
	    				})
	    				console.log("Done adding twitter details");
	    			}
	    			else {
	    				console.log("No user found");
	    				return done();
	    			}
	    		});
	    	});
	    }
	));

passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true ,
        profileFields: ['id','emails', 'first_name', 'last_name', 'displayName', 'link', 'photos' ]
}, 
	  function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		if (!req.user){
	    			console.log("Not logged in");
	    			return done();
	    		}
	    		User.findById(req.user.id, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user) {
	    				//Need elevated permissions for email in Twitter API. So not getting it
	    				user.facebook = profile.id;
	    				user.facebookToken = accessToken;

	    				user.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, user);
	    				})
	    				console.log("Done adding facebook details");
	    			}
	    			else {
	    				console.log("No user found");
	    				return done();
	    			}
	    		});
	    	});
	    }
	));
	
		passport.use(new LinkedinStrategy({
        clientID        : configAuth.linkedinAuth.clientID,
        clientSecret    : configAuth.linkedinAuth.clientSecret,
        callbackURL     : configAuth.linkedinAuth.callbackURL,
	    passReqToCallback: true,
	    state: true,
	  },
	  function(req, accessToken, refreshToken, profile, done) {
	    		User.findById(req.user.id, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user) {
	    				user.linkedin = profile.id;
	    				user.linkedinToken = accessToken;
	    				user.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, user);
	    				})
	    				console.log("Done adding linkedin details");
	    			}
	    			else {
	    				console.log("No user found");
	    				return done();
	    			}
	    		});
	    	
	    }
	));
};