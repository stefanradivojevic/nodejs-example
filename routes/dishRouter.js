var express = require('express'),
	bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var Dishes = require('../models/dishes');
var Verify = require('./verify');

var dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/') // "route" i "get", "post" itd. su "express-ove" (node.js) metode.
.all(Verify.verifyOrdinaryUser)
.get(function(req, res, next) {
// ovde se "get" i dalje "post", "delete", "put"... odnose na HTTP zahteve koji se salju prema serveru.
// Verify.verifyOrdinaryUser se primenjuje kao middleware i to pre svih daljih radnji
    Dishes.find({})
        .populate('comments.postedBy')
        .exec(function(err, dish) {
            if (err) throw err;
            res.json(dish); // "json" metod vrsi konverziju json objekta u json string i salje ga nazad kao "end" http "response-a" a "response header" automatski postavlja na "200".)
        });
})
.post(Verify.verifyAdmin, function(req, res, next) {
    Dishes.create(req.body, function (err, dish) { // mongoose 'create' method
        if (err) throw err;
        console.log('Dish created!');
        var id = dish._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the dish with id: ' + id);
    });
})
.delete(Verify.verifyAdmin, function(req, res, next) {
        Dishes.remove({}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
});

dishRouter.route('/:dishId')
.all(Verify.verifyOrdinaryUser)
.get(function(req, res, next) {
    Dishes.findById(req.params.dishId)
        .populate('comments.postedBy')
        .exec(function (err, dish) {
            if (err) throw err;
            res.json(dish);
        });
})
.put(Verify.verifyAdmin, function (req, res, next) {
    Dishes.findByIdAndUpdate(req.params.dishId, { // "findByIdAndUpdate" je "mongoose-ov" metod.
        $set: req.body
    }, {
        new: true
    }, function (err, dish) {
        if (err) throw err;
        res.json(dish);
    });
})
.delete(Verify.verifyAdmin, function (req, res, next) {
    Dishes.findByIdAndRemove(req.params.dishId, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

dishRouter.route('/:dishId/comments')
.all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {
    Dishes.findById(req.params.dishId)
        .populate('comments.postedBy')
        .exec(function (err, dish) {
            if (err) throw err;
            res.json(dish.comments);
        });
})
.post(function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        req.body.postedBy = req.decoded._doc._id;
        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})
.delete(Verify.verifyAdmin, function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        for (var i = (dish.comments.lenght - 1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
        };
        dish.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.body('Deleted all comments!');
        });
    })
});

dishRouter.route('/:dishId/comments/:commentId')
.all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {
    Dishes.findById(req.params.dishId) 
        .populate('comments.postedBy')
        .exec( function (err, dish) {
            if (err) throw err;
            res.json(dish.comments.id(req.params.commentId))
        });
})
.put(function (req, res, next) {
    // We delete the existing comment and insert the updated comment as a new comment
    // MongoDB nema dobru podrsku za izmenu pojedinosti jednog "pridodatog" dokumenta (ovde komentara kao clana niza ("array-a")).
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        dish.comments.id(req.params.commentId).remove();
        req.body.postedBy = rec.decoded._doc._id;
        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})
.delete(function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        if ( dish.comments.id(req.params.commentId).postedBy != req.decoded._doc._id ) {
            var err = new Error('You are not authorized to perform this operatioins!');
            err.status = 403;
            return next(err);
        }
        dish.comments.id(req.params.commentsId).remove();
        dish.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = dishRouter;