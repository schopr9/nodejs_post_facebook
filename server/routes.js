var User            = require('../server/model/user').User;
var FB= require('fb');
var request = require('request');
var graph = require('fbgraph');
var async1 = require("async"); 
var Step    = require('step');
var api = require('./api');
var Twitter = require('twitter');
var Twit = require('twit');
var configAuth = require('../config/auth');
var Linkedin = require('node-linkedin')(configAuth.linkedinAuth.clientID, configAuth.linkedinAuth.clientSecret, configAuth.linkedinAuth.callbackURL);
var extend = require('util')._extend

FB.options({appId:'928334653922557',appSecret:'a58d7e5b70932c12f129ab5b0aeef668'});
var client = new Twitter({
  consumer_key: 'mWCu0nB2gATvPZ2CnAw3olOCq',
  consumer_secret: 'x8cfNYG4W8etrK6B5TA4nVyAwwHom5D8VTqYw3KDe1vtDeK8Yk',
});



module.exports = function(app, passport,FB){
	app.get('/', function(req, res){
		res.render('index.ejs');
	});


	app.get('/signup', function(req, res){
		res.render('signup.ejs');
	});
	
	app.get('/auth/google', passport.authenticate('google',	{ scope: 'profile email' }));
	app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
		res.redirect('/profile');  
	});

	app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email', 'publish_actions'] }));
	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res,next) {
	  res.redirect('/profile');
	});

	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
	  res.redirect( '/profile');
	});
	
	app.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress', 'w_share'] }));
	app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { 
	  successRedirect: '/profile', failureRedirect: '/' 
	}));


	app.get('/userdata', isLoggedIn, function(req, res){
			var data = req.body.postdata;
			var post = new User.post();
			User.post.title = data
			User.post.content = data
			User.save()
			res.json({use :'updated'});
		});

	
	app.post('/api/post/',postfacebook, twitterpost,linkedinpost,function(req, res) {//create a post
		console.log(req.postid)
		body = req.body.postdata;
	    User.findOne({'email':req.body.email},function(err,user){
	        if(!err  ) {
	            user.post.push({postBody:body,
	                            postDate: Date.now(), postID : req.postid, postKind : 'facebook',twitterPostID: req.twitterPostId, linkedinPostID: req.linkedinPostId
	            });
				
	            var lastPostID = user.post[user.post.length-1]._id;
	            user.save(function (err) {
	                  if(!err) 
	                        res.json({"status":"success"});
	            });
	        }
	        else
	            res.json({"status":"failed"});
	    });
	});
	
	
	app.get('/api/post/:email/:id', function(req, res) {//get a post by id
	    User.findOne({'email':req.params.email},function(err,user){
	        if(!err  ) {
	            var post = user.post.id(req.params.id);
	            console.log(post);
	            req.fPostId =  post.postID
	            facebookComments(req)
	            if(post != null){
	            	var target = extend(post,req.facebookcomments);
	            	console.log(target);
	                res.json(target
	                );
	                
	            }
	            else
	                res.json({ "status":"failed"});
	        }
	        else
	            res.json({ "status":"failed"});
	    });
	});
	
	//update a post 
	app.put('/api/post/:email/:id', editfacebook, function(req, res) {
	    User.findOne({'email':req.params.email},function(err,user){
	        if(!err  ) {
	            var post = user.post.id(req.params.id);
	            if(post != null)
	            {
	                
	                post.postBody = req.body.postBody;
	                user.save(function (err) {
	                    if(!err) 
	                        res.json({"status":"success"});
	                    else
	                        res.json({"status":"success"});
	                });
	            }
	            else
	                res.json({ "status":"failed"});
	        }
	        else
	            res.json({ "status":"failed"});
	    });
	});
	
	//delete a post 
	app.delete('/api/post/:email/:id',deletefacebook,deleteTwitterPost,function(req, res) {
		

	    User.findOne({'email':req.params.email},function(err,user){
	        if(!err  ) {
	            var post = user.post.id(req.params.id);
	            if(post != null)
	            {
	                post.remove();
	                
	                user.save(function (err) {
	                      if(!err) 
	                            res.json({ "status":"success"});
	                      else
	                            res.json({ "status":"failed"});
	                });
	            }
	            else
	                 res.json({ "status":"failed"});
	        }
	        else
	            res.json({ "status":"failed"});
	    });
	});
	
	//create a comment
	app.post('/api/comment/', function(req, res) {
	   
	    User.findOne({'email':req.body.email},function(err,user){
	        if(!err  ) {
	            var post = user.post.id(req.body.postID);
	            if(post != null)
	            {
	                post.comment.push({ commentBody:req.body.commentdata,
	                                    commentDate: Date.now()});
	                user.save(function (err) {
	                        if(!err) 
	                            res.json({"status":"success"});
	                        else
	                            res.json({"status":"failed"});
	                });
	            }
	            else
	                res.json({"status":"failed"});
	        }
	        else
	            res.json({"status":"failed"});
	    });
	});
	
	//get a commeny 
	app.get('/api/comment/:postID/:id', function(req, res) {
	    User.findOne({'post._id':req.params.postID},function(err,user){
	        if(!err  ) {
	            var post = user.post.id(req.params.postID);
	            var comment = post.comment.id(req.params.id);
	            var facebookcomment = req.facebookcomments;
	            if(comment != null)
	                res.json(comment,facebookcomment);
	            else
	                res.json({ "status":"failed"});
	        }
	        else
	            res.json({ "status":"failed"});
	    });
	});
	
	//update a comment 
	app.put('/api/comment/:postID/:id', function(req, res) {
	    User.findOne({'post._id':req.params.postID},function(err,user){
	        if(!err  ) {
	            var post = user.post.id(req.params.postID);
	            var comment = post.comment.id(req.params.id);
	            if(comment != null)
	            {
	                comment.commentBody = req.body.commentdata;
	                user.save(function (err) {
	                    if(!err) 
	                        res.json({"status":"success"});
	                    else
	                        res.json({"status":"success"});
	                });
	            }
	            else
	                res.json({ "status":"failed"});
	        }
	        else
	            res.json({ "status":"failed"});
	    });
	});
	
	//delete a comment
	app.delete('/api/comment/:postID/:id', function(req, res) {
	    User.findOne({'post._id':req.params.postID},function(err,user){
	        if(!err) {
	            var post = user.post.id(req.params.postID);
	            var comment = post.comment.id(req.params.id);
	            if(comment != null)
	            {
	                console.log(comment);
	                comment.remove();
	                user.save(function (err) {
	                      if(!err) 
	                            res.json({ "status":"success"});
	                      else
	                            res.json({ "status":"failed"});
	                });
	            }
	            else
	                 res.json({ "status":"failed"});
	        }
	        else
	            res.json({ "status":"failed"});
	    });
	});
	
	app.get('/api/allposts/:email',function(req,res){
	    User.findOne({'email':req.params.email},function(err,user){
	        if(err)
	            res.json({"status" : "failed"});
	        else
	            res.json(user.post);
	    });
	});
	
	app.get('/api/facecomment/:email/:faceId',function(req,res){
	    User.findOne({'email':req.params.email},function(err,user){
	        if(err)
	            res.json({"status" : "failed"});
	        else
	        	FB.setAccessToken(user.facebookToken);
		        postid = req.params.faceId;
		        FB.api(postid + "/comments",'get', function(err, response) {
		            if (err)
		                console.log(err);
		            else {
		                req.facebookcomments = response.data;
		                res.json(response.data);
		            }
		        });
	        	
	            
	    });
	});

	
	app.get('/api/allComments/:id',function(req,res){//get all comment by postID
	    User.findOne({'post._id':req.params.id},function(err,user){
	        if(err)
	            res.json({"status" : "failed"});
	        else{
	            var post = user.post.id(req.params.id);
	            res.json(post.comment);
	        }
	    });
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

function facebookpost(body){
	
	FB.api('me/feed', 'post', { message: body }, function (res) {console.log('Post Id: ' + res.id);});
	
}

function postMessage(req,res) {
    // Specify the URL and query string parameters needed for the request
		fid = req.body.facebookID;
		
		FB.setAccessToken(req.body.facebookToken);
		var body = req.body.postdata;
		FB.api('me/feed', 'post', { message: body }, function (res) {
			  if(!res || res.error) {
			    console.log(!res ? 'error occurred' : res.error);
			    return;
			  }
			  console.log('Post Id: ' + res.id);
			});

    var url = 'https://graph.facebook.com/me/feed';
    var params = {
        access_token: req.body.facebookToken,
        message: body
    };

	// Send the request
    request.post({url: url, qs: params}, function(res, body) {
      
      // Handle any errors that occur
      console.log(res);
    });

};


var postfacebook = function(req,myres,next){
	
	
	 if (req.body.facebookCheck){
		fid = req.body.facebookID;
		FB.setAccessToken(req.body.facebookToken);
		body = req.body.postdata;
		FB.api('me/feed', 'post', { message: body }, function (myres) {
			  if(!myres || myres.error) {
			    console.log(!myres ? 'error occurred' : myres.error);
			    
			  }
			  console.log('Post Id: ' + myres.id);
			  req.postid = myres.id
			  next();
			});
	
		
	 }
	 
};

var twitterpost = function(req,myres,next){
	
	  
	  if (!req.body.twitterCheck){next();};  
	  if (req.body.twitterCheck){  
	    User.findOne({'email':req.body.email},function(err,user){
	    	
		    tweetToken = user.twitterToken;
	    	tweetSecret = user.twitterSecret;
	    	client.options.access_token_key = tweetToken;
	    	client.options.access_token_secret = tweetSecret;
	    	var T = new Twit({
              consumer_key:         'mWCu0nB2gATvPZ2CnAw3olOCq',
              consumer_secret:      'x8cfNYG4W8etrK6B5TA4nVyAwwHom5D8VTqYw3KDe1vtDeK8Yk',
              access_token:         tweetToken,
              access_token_secret:  tweetSecret,
            });
            body = req.body.postdata;
            T.post('statuses/update', { status: body }, function(err, data, response) {
                if (err) console.log(err);
                req.twitterPostId = data.id_str;
                next();
            });
	

	    });
	  }
	
};

var linkedinpost = function(req,myres,next){
	
	  if (!req.body.linkedinCheck){next();};  
	 if (req.body.linkedinCheck) {   
	    User.findOne({'email':req.body.email},function(err,user){
	    	
		    var linkedin = Linkedin.init(user.linkedinToken);
		    var shareObject = { comment : body, visibility: {
                                    code : "anyone"
                                } 
                            };
            linkedin.people.share(shareObject, function(err, res){
                if (err)
                    console.log(err);
                // else
                console.log(res);
                console.log('post is shared o linkedin');
                req.linkedinPostId = res.updateKey
                next();
            });
	

	    });

	 }

};

var deletefacebook = function(req,myres,next){
	
	 if (!req.query.postid){next();};
	 if (req.query.postid){
		postid = req.query.postid;
		
		User.findOne({'email':req.query.email},function(err,user){
			FB.setAccessToken(user.facebookToken);
		});
		
		FB.api(postid, 'delete',  function (myres) {
			  if(!myres || myres.error) {
			    console.log(!myres ? 'error occurred' : myres.error);
			    
			  }
			  console.log('Post was deleted ' );
			  next();
			});
	 }
	
};


var deleteTwitterPost = function(req,myres,next){
	
		twitterpostid = req.query.twitterPId;
		if(!twitterpostid){next();};
		if (twitterpostid){
		 User.findOne({'email':req.params.email},function(err,user){
	    	
		    tweetToken = user.twitterToken;
	    	tweetSecret = user.twitterSecret;
	    	client.options.access_token_key = tweetToken;
	    	client.options.access_token_secret = tweetSecret;
	    	T = new Twit({
              consumer_key:         'mWCu0nB2gATvPZ2CnAw3olOCq',
              consumer_secret:      'x8cfNYG4W8etrK6B5TA4nVyAwwHom5D8VTqYw3KDe1vtDeK8Yk',
              access_token:         tweetToken,
              access_token_secret:  tweetSecret,
            });
		T.post('statuses/destroy/:id', { id: twitterpostid }, function (err, data, response) {
			if (err) console.log(err);
		  console.log(data);
		  next();
		});



		 });
		}
	
};


var editfacebook = function(req,myres,next){
	
		postid = req.body.postid;
		if (postid){
		
		FB.setAccessToken(req.body.token);
		
		var body = req.body.postBody;
		FB.api(postid, 'post', { message: body },  function (myres) {
			  if(!myres || myres.error) {
			    console.log(!myres ? 'error occurred' : myres.error);
			    
			  }
			  console.log('Post was edited ' );
			  next();
			});
	
		}
};

var facebookComments = function(req,myres,next){
	
        
        setFacebookToken(req);
        postid = req.fPostId;
        FB.api(postid + "/comments",'get', function(err, response) {
            if (err)
                console.log(err);
            else {
                req.facebookcomments = response.data;
            }
        });
    

};

 //add twitter comments
var twitterComments = function(req,res,next){
	
          
            if (post.twitterPostId){
				setTwitterToken();
                gettingTwitterComments = true;
                T.get('search/tweets', { q: "@" + req.user.twitterUserName, sinceId: post.twitterPostId }, function (err, data, response) {
                    if (err)
                        console.log(err);
                    else {
                        var results = data.statuses;
                        for (var i = 0; i < results.length; i++){
                            if (results[i].in_reply_to_status_id_str === post.twitterPostId) {
                                var comment = {
                                	commentText : results[i].text,
                            	    userName: results[i].user.name,
                        		    created_at: new Date(Date.parse(results[i].created_at))
                        		}
                                post.comments.push(comment);
                            }
                            gettingTwitterComments = false;
                            if (!gettingFbComments && !gettingTwitterComments)
                                return res.json(post.comments);
                        }
                    }
                });
            }
}

// set facebook token
var setFacebookToken =  function(req,res,next){
	
        User.findOne({'email':req.params.email},function(err,user){
		FB.setAccessToken(user.facebookToken);
		});
	
	
};


