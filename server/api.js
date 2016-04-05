var  graph;
var async = require('async');

exports.getFacebook = function(req, res, next) {
  graph = require('fbgraph');

  var token = req.body.facebookToken;
  graph.setAccessToken(token);
  async.parallel({
    getMe: function(done) {
      graph.get(req.user.facebook + "?fields=id,name,email,first_name,last_name,gender,link,locale,timezone", function(err, me) {
        done(err, me);
      });
    },
    getMyFriends: function(done) {
      graph.get(req.user.facebook + '/friends', function(err, friends) {
        done(err, friends.data);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
     console.log(results.getMe);
     console.log(results.getMyFriends);
    
  });
};
