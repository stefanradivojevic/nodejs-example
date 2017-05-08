var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
	username: String,
	password: String,
	OauthId: String,
	OauthToken: String,
	firstName: {
		type: String,
		default: ''
	},
	lastName: {
		type: String,
		default: ''
	},
	admin: {
		type: Boolean,
		default: false
	}
});

UserSchema.getName = function () {
	return (this.firstName + ' ' + this.lastName);
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);