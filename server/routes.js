var User            = require('../server/model/user').User;


module.exports = function(app, passport){
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

	app.get('/userdata', isLoggedIn, function(req, res){
			var data = req.body.postdata;
			var post = new User.post();
			User.post.title = data
			User.post.content = data
			User.save()
			res.json({use :'updated'});
		});

	
	app.post('/api/post/', function(req, res) {//create a post
	    User.findOne({'email':req.body.email},function(err,user){
	        if(!err  ) {
	            user.post.push({postBody:req.body.postdata,
	                            postDate: Date.now()});
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
	            if(post != null)
	                res.json(post);
	            else
	                res.json({ "status":"failed"});
	        }
	        else
	            res.json({ "status":"failed"});
	    });
	});
	
	//update a post 
	app.put('/api/post/:email/:id', function(req, res) {
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
	app.delete('/api/post/:email/:id', function(req, res) {
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
	            if(comment != null)
	                res.json(comment);
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