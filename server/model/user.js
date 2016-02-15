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
  github: String,
  instagram: String,
  linkedin: String,
  steam: String,
  tokens: Array,

  profile: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' }
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date
});

var tokenSchema = mongoose.Schema({
	value: String,
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	expireAt: {
		type: Date,
		expires: 60,
		default: Date.now
	}
});

userSchema.methods.generateToken = function(){
	var token = new Token();
	token.value = randtoken.generate(32);
	token.user = this._id;
	this.token = token._id;
	this.save(function(err){
		if(err)
			throw err;
		token.save(function(err){
			if(err)
				throw err;
		});
	});
}

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

var User = mongoose.model('User', userSchema);
var Token = mongoose.model('Token', tokenSchema);
var Models = { User: User, Token: Token };

module.exports = Models;

