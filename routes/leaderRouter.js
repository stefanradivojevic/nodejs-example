var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var Leaders = require('../models/leadership');
var Verify = require('./verify');

var leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')

.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Leaders.find({}, function (err, leader) {
        if (err) throw err;
        res.json(leader);
    });
})
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Leaders.create(req.body, function (err, leader) {
        if (err) throw err;
        console.log('Leader created!');
        var id = leader._id;

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Adde the leader with id: ' + id);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
        Leaders.remove({}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
});

// proveriti da li lideri u db imaju id ili raditi preko imena/ispraviti kod dole...
leaderRouter.route('/:leader')
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Leaders.findById(req.params.leaderId, function (err, dish) {
        if (err) throw err;
        res.json(leader);
    });
})
.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Leaders.findByIdAndUpdate(req.params.leaderId, { // "findByIdAndUpdate" je "mongoose-ov" metod.
        $set: req.body
    }, {
        new: true
    }, function (err, leader) {
        if (err) throw err;
        res.json(leader);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Leaders.findByIdAndRemove(req.params.leader, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

module.exports = leaderRouter;