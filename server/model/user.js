var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var randtoken = require('rand-token');
var Schema = mongoose.Schema;
var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,

  facebook: String,
  twitter: String,
  google: String,
  linkedin: String,
  tokens: Array,
  twitterToken: String,
  twitterSecret: String,
  facebookToken: String,
  linkedinToken: String,
  
  profile: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' }
  },
  
      post: [{ 
            postBody: {type: String, default: ' ' },
            postDate : Date,
            postID : String,
            twitterPostID: String,
            linkedinPostID: String,
            postKind : String,
            comment: [{
                commentBody : {type: String, default: ' ' },
                commentEmail: String,
                commentDate : Date
            }]
    }],


  resetPasswordToken: String,
  resetPasswordExpires: Date
});


var postschema = new mongoose.Schema({
    title: { type: String, required: true },
    tags: [ {type: String} ],
    is_published: { type: Boolean, default: false },
    content: { type: String, required: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    read: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    email: String
});



var User = mongoose.model('User', userSchema);
//var Post = mongoose.model('Post', postSchema);
var Models = { User: User };

module.exports = Models;

