var mango = require('../managers/mango');
var wuptil = require('../util/wuptil');

// TODO view_count
// TODO owner
const USERNAME = 'Ryebrarian';

exports.test = function(message) {
    return /^!m(edia)?(\s|$)/.test(message);
};

var parse = function(str) {
    var parts = [];
    var quote_open = false;
    var prev_break = 0;
    for (var i = 0; i < str.length; i++) {

        if (str[i] == '"') {
            parts.push(str.slice(prev_break + 1, i));
            prev_break = i;
            if (quote_open !== false) {
                quote_open = false;
            }
            else {
                quote_open = true;
            }
        }
        else if (str[i] == ' ') {
            if (quote_open) {
                continue;
            }
            else {
                parts.push(str.slice(prev_break + 1, i));
                prev_break = i;
            }
        }
    }
    if (prev_break + 1 != i) {
        parts.push(str.slice(prev_break + 1, i));
    }
    return parts.filter(function(part) {
        return part.length > 0;
    });
};

var legal_actions = [
    'add',
    'a',
    'view',
    'v',
    'random',
    'r',
    'tags',
    't',
    'help'
];

var help_message = '';
help_message += 'Usage:\n';
help_message += '!m(edia) a(dd) <name> <url> [tag1] [tag2] [etc] -- Add a media item\n';
help_message += '!m(edia) v(iew) <name> -- View a media item by name\n';
help_message += '!m(edia) r(andom) <tag> [tag2] [tag3] [etc] -- View a random media item with the given tags\n';
help_message += '!m(edia) t(ags) -- list all tags\n';
help_message += '!m(edia) t(ags) <tag> -- list all media with given tag\n';
help_message += '!m(edia) / !m(edia) help -- this message!\n';
help_message += 'Use quotes (") for any multi-word arguments\n';

exports.exec = function(message, session, room_id) {
    var command = parse(message);
    var action = command[1];

    if (legal_actions.indexOf(action) == -1 || action == 'help') {
        setTimeout(function() {
            session.broadcast('chatterbox', 'blargh', {message: help_message, username: USERNAME}, {room_id: room_id, strip_entities: false});
        }, 100);
    }
    else {
        mango.get().then(function(db) {
            var c = db.collection('media');
            switch (action) {
                case 'add':
                case 'a':
                    var name = command[2];
                    var url = command[3];

                    if (name && url) {
                        var tags = [];
                        for (var i = 4; i < command.length; i++) {
                            tags.push(command[i]);
                        }

                        c.findOne({name: name}).then(function(media_item) {
                            if (media_item == null) {
                                c.insertOne({
                                    name: name,
                                    url: url,
                                    tags: tags
                                }).then(function(result) {
                                    db.close();
                                    session.broadcast('chatterbox', 'chat', {message: 'Media item ' + name + ' added.', username: USERNAME}, {room_id: room_id});
                                });
                            }
                            else {
                                db.close();
                                setTimeout(function() {
                                    session.broadcast('chatterbox', 'chat', {message: 'A media item by that name already exists!', username: USERNAME}, {room_id: room_id});
                                }, 100);
                            }
                        });
                    }
                    else {
                        session.broadcast('chatterbox', 'chat', {message: 'RTFM.', username: USERNAME}, {room_id: room_id});
                    }
                    break;
                case 'view':
                case 'v':
                    var name = command[2];

                    c.findOne({name: name}).then(function(media_item) {
                        setTimeout(function() {
                            if (media_item == null) {
                                session.broadcast('chatterbox', 'chat', {message: 'Media item ' + name + ' does not exist.', username: USERNAME}, {room_id: room_id});
                            }
                            else {
                                session.broadcast('chatterbox', 'chat', {message: 'Media item ' + name + ':', username: USERNAME}, {room_id: room_id});
                                session.broadcast('chatterbox', 'chat', {message: media_item.url, username: USERNAME}, {room_id: room_id});
                            }
                        }, 100);
                        db.close();
                    });
                    break;
                case 'random':
                case 'r':
                    var taglist = command.slice(2);
                    c.find({tags: {$all: taglist}}).toArray().then(function(mediabits) {
                        if (mediabits.length) {
                            var item = wuptil.choose(mediabits);
                            setTimeout(function() {
                                session.broadcast('chatterbox', 'chat', {message: 'Media item ' + item.name + ':', username: USERNAME}, {room_id: room_id});
                                session.broadcast('chatterbox', 'chat', {message: item.url, username: USERNAME}, {room_id: room_id});
                            }, 100);
                        }
                        else {
                            session.broadcast('chatterbox', 'chat', {message: 'No content for that tag.', username: USERNAME}, {room_id: room_id});
                        }
                    });
                    break;
                case 'tags':
                case 't':
                    if (command[2]) {
                        var tag = command[2];
                        c.find({tags: tag}).toArray().then(function(results) {
                            let client_results = results.map(function(r) {
                                return {name: r.name, content: r.url};
                            }).sort((a, b) => {
                                return a.name.localeCompare(b.name);
                            }).map(r => [r.name, r.content]);

                            setTimeout(function() {
                                session.broadcast('chatterbox', 'blargh_grid', {username: USERNAME, rows: client_results, columns: ["Tag Name", "Tag Content"], title: 'Tag: ' + tag, grid_width: 1200}, {room_id: room_id});
                            }, 100);
                        });
                    }
                    else {
                        // When JV fills the DB with millions of tags so he can crash the server with this command, it will still be Jesse's fault
                        c.find().toArray().then(function(results) {
                            var tags = {};
                            results.forEach(function(item) {
                                item.tags.forEach(function(tag) {
                                    if (tags[tag] === undefined) {
                                        tags[tag] = 1;
                                    }
                                    else {
                                        tags[tag] += 1;
                                    }
                                });
                            });

                            let dog_tags = Object.keys(tags).map((k) => {
                                return {name: k, count: tags[k]}
                            }).sort((a, b) => {
                                if (a.count != b.count) {
                                    return b.count - a.count
                                }
                                else {
                                    return a.name.localeCompare(b.name);
                                }
                            }).map(r => [r.name, r.count]);

                            setTimeout(function() {
                                session.broadcast('chatterbox', 'blargh_grid', {rows: dog_tags, username: USERNAME, columns: ["Tag Name", "Tag Count"], title: 'All Tags'}, {room_id: room_id});
                            }, 100);
                        });
                    }
                    break;
            }
        });
    }
    return true;
};