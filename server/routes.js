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
	//  return res.json( {user: req.user});
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
	    console.log(req.params.id);
	    console.log(req.params.email);
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
	
	//update a post by id & email
	app.put('/api/post/:email/:id', function(req, res) {
	    console.log(req.body);
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
	
	//delete a post by id & email
	app.delete('/api/post/:email/:id', function(req, res) {
	    console.log(req.params.id);
	    console.log(req.params.email);
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
	
	//get a commeny by id
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
	
	//update a comment by postID & id
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
	
	//delete a comment by post id & id
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
	
	//get all posts by email
	app.get('/api/allposts/:email',function(req,res){
	    User.findOne({'email':req.params.email},function(err,user){
	        if(err)
	            res.json({"status" : "failed"});
	        else
	            res.json(user.post);
	    });
	});
	

	//get all comment by postID
	app.get('/api/allComments/:id',function(req,res){
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