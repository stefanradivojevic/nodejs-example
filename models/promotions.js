var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var promotionSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	image: {
		type: String
	},
	label: {
		type: String,
		default: ""
	},
	price: {
		type: Currency,
		required: true,
		min: 0
	},
	description: {
		type: String,
		required: true
	}
}, {
    timestamps: true
});

var Promotions = mongoose.model('promotion', promotionSchema);

module.exports = Promotions;