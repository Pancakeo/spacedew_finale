"use strict";

var request = require('request');
var cheerio = require('cheerio');
var sessionator = require('../managers/sessionator');
var storage_thing = require('../managers/storage_thing');

exports.update_all = function() {
    var sessions = sessionator.get_sessions();

    storage_thing.each_param_sql("SELECT user_id, username, steam_id FROM user WHERE steam_id <> ''").then(function(result) {
        if (result && result.rows.length > 0) {
            result.rows.forEach(function(row) {
                exports.get_max_rank(row.steam_id, function(max_rank) {
                    if (max_rank != null) {
                        storage_thing.run_param_sql('UPDATE user SET rl_max_rank = ? WHERE user_id = ?', [max_rank, row.user_id]);

                        for (var s in sessions) {
                            var username = sessions[s].profile.username && sessions[s].profile.username.toLowerCase();
                            if (username == row.username) {
                                sessions[s].profile.rocket_league_rank = max_rank; // TODO - should assign this on login.
                            }
                        }
                    }
                });
            });
        }
    });

};

exports.get_max_rank = function(profile_id, callback) {
    request('http://rocketleague.tracker.network/profile/steam/' + profile_id, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);

            var $table = $(".stats-panel .table-striped").first();
            var $heh = $table.find('img');
            var max_rank = 0;

            $heh.each(function() {
                var $woboy = $(this);
                var raw_rank = $woboy.attr('src');

                var matches = raw_rank.match(/(\d+).png/);
                if (matches.length >= 2) {
                    var rank = matches[1];
                    max_rank = Math.max(max_rank, rank);
                }
            });

            callback(max_rank);
        }
        else {
            callback(null);
        }
    });
};
