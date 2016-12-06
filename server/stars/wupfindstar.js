"use strict";

var request = require('request');
var cheerio = require('cheerio');
var sessionator = require('../managers/sessionator');
var mango = require('../managers/mango');

exports.update_user = function(user) {
    var sessions = sessionator.get_sessions();

    exports.get_max_rank(user.steam_id, function(max_rank) {
        if (max_rank != null) {

            mango.get().then(function(db) {
                var users = db.collection('users');
                users.updateOne({user_id: user.user_id}, {$set: {rl_max_rank: max_rank}}).then(function() {
                    db.close();
                });
            });

            for (var s in sessions) {
                var username = sessions[s].profile.username && sessions[s].profile.username.toLowerCase();
                if (username == user.username) {
                    sessions[s].profile.rocket_league_rank = max_rank;
                }
            }
        }
    });
};

exports.update_all = function() {
    var sessions = sessionator.get_sessions();

    mango.get().then(function(db) {
        var users_collection = db.collection('users');
        users_collection.find({}).toArray(function(err, users) {

            users.forEach(function(user) {
                exports.get_max_rank(user.steam_id, function(max_rank) {
                    if (max_rank != null) {
                        users.updateOne({user_id: user.user_id}, {$set: {rl_max_rank: max_rank}});

                        for (var s in sessions) {
                            var username = sessions[s].profile.username && sessions[s].profile.username.toLowerCase();
                            if (username == user.username) {
                                sessions[s].profile.rocket_league_rank = max_rank;
                            }
                        }
                    }
                });
            });

            db.close();
        });
    });
};

exports.get_max_rank = function(profile_id, callback) {
    if (!profile_id) {
        return;
    }

    request('http://rocketleague.tracker.network/profile/steam/' + profile_id, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);

            var $table = $(".stats-panel .table-striped").first();
            var $heh = $table.find('img');
            var max_rank = 0;
            var found_rank = false;

            $heh.each(function() {
                var $woboy = $(this);
                var raw_rank = $woboy.attr('src');

                var matches = raw_rank.match(/(\d+).png/);
                if (matches.length >= 2) {
                    var rank = matches[1];
                    found_rank = true;
                    max_rank = Math.max(max_rank, rank);
                }
            });

            if (found_rank) {
                callback(max_rank);
            }
            else {
                callback(null);
            }

        }
        else {
            callback(null);
        }
    });
};
