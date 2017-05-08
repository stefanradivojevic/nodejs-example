var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoritesSchema = new Schema({
    forUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    favoriteDishes: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Dish'
   }]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorites', favoritesSchema);

module.exports = Favorites;