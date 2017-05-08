var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaderSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	image: {
		type: String
	},
	designation: {
		type: String
	},
	abbr: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	}
}, {
    timestamps: true
});

var Leaders = mongoose.model('leader', leaderSchema);

module.exports = Leaders;