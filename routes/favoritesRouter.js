/*
Implementing the REST API methods for favorites, modelled using a Mongoose
schema. Only when the user is authenticated he/she will gain access to the
favorites.
*/

var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var Favorites = require('../models/favorites'),
    Verify = require('./verify');

var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {
    // Use the Mongoose Model.find() function to find all documents, and after
    // these documents are found, populate the user information and the dishes information.
    var userID = req.decoded._doc._id; // ID korisnika koji vrsi pretragu
    Favorites.find({"forUser": userID})
        .populate('forUser favoriteDishes')
        .exec(function(err, result) {
            if (err) throw err;
            if (result.length === 0 || result === undefined) {
                res.json("List of Favorite Dishes is empty!");
            }
            else res.json(result);
        });
})

.post(function(req, res, next) {
    var userID = req.decoded._doc._id,      // korisnicki ID
        favDishID = req.body._id;           // favorite dish ID
    // ispitivanje da li postoji lista omiljenih za datog korisnika -->
    Favorites.find({"forUser": userID})
    .populate('forUser favoriteDishes')
    .exec(function(err, result) {
        if (err) throw err;
        if (result.length === 0 || result === undefined) {
            Favorites.create({forUser: userID}, function (err, favorite) {
                if (err) throw err;
                favorite.favoriteDishes.push(favDishID);
                favorite.save( function (err, favorites) {
                    if (err) throw err;
                    console.log('Dish with ' + favDishID + ' id added to new list of favorites!');
                    res.json(favorites);
                });
            });
        }
        else {
            // if list of favorites dishes already exist: make sure not to include duplicates:
            var duplicate = false;          // does dish already exist in list of favorites?
            for (var i = 0; i < result[0].favoriteDishes.length; i++) {
                if (result[0].favoriteDishes[i]._id == favDishID)
                duplicate = true;           // ...yes!
              }
            if (!duplicate) {               // ...no!
                result[0].favoriteDishes.push(favDishID);
                result[0].save( function(err, favorites) {
                    if (err) throw err;
                    console.log('Dish with ' + favDishID + ' id added to new list of favorites!');
                    res.json(favorites);
                })
            }
            else {
                console.log('Dish already exist in list of favorites.');
                res.json('Dish already exist in list of favorites.');
            }
        }
    });
})
  
.delete(function(req, res, next) {
    var userID = req.decoded._doc._id; // korisnicki ID
    Favorites.remove({"forUser": userID}, function(err, resp) {
        if (err) throw err;
        res.json('List of Favorite Dishes deleted!');
    });
});


favoritesRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    var userID = req.decoded._doc._id;
    
    Favorites.find({"forUser": userID})
    .populate('forUser favoriteDishes')
    .exec(function(err, result) {
        if (err) throw err;

        if (result.length !== 0 && result[0].favoriteDishes.length !== 0) { // Does the user have favorite dishes?
            var dishId = req.params.dishId,
                deleted = false;

            for (var i = 0; i < result[0].favoriteDishes.length; i++) {
                if (result[0].favoriteDishes[i]._id == dishId) {
                    result[0].favoriteDishes.splice(i, 1);
                    result[0].save(function(err, result) {
                        if (err) throw err;
                    });
                    deleted = true;
                }
            }
          res.json(deleted ?
            {status: "deleted dish [" + dishId +"] from favorites"} :
            {status: "user did not have dish [" + dishId + "] as a favorite"}
          );
        };
    });
});

module.exports = favoritesRouter;
