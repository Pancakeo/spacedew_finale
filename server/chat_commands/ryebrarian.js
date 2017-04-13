var mango = require('../managers/mango');
var wuptil = require('../util/wuptil');

exports.test = function(message)
{
    return /^\!m(edia)?(\s|$)/.test(message);
}

var parse = function(str)
{
	var parts = [];
	var quote_open = false;
	var prev_break = 0;
	for (var i = 0; i < str.length; i++)
	{

		if (str[i] == '"')
		{
			parts.push(str.slice(prev_break+1, i));
			prev_break = i;
			if (quote_open !== false)
			{
				quote_open = false;
			}
			else
			{
				quote_open = true;
			}
		}
		else if (str[i] == ' ')
		{
			if (quote_open)
			{
				continue;
			}
			else
			{
				parts.push(str.slice(prev_break+1, i));
				prev_break = i;
			}
		}
	}
	if (prev_break+1 != i)
	{
		parts.push(str.slice(prev_break+1, i));
	}
	return parts.filter(function(part)
	{
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

exports.exec = function(message, session, room_id) 
{
    var command = parse(message);
    var action = command[1];
    
    if (legal_actions.indexOf(action) == -1 || action == 'help')
    {
        setTimeout(function()
        {
            session.broadcast('chatterbox', 'blargh', {message: help_message, username: 'Ryebrarian'}, {room_id: room_id, strip_entities: false});
        }, 100);
    }
    else
    {
        mango.get().then(function(db)
        {
            var c = db.collection('media');
            switch (action)
            {
                case 'add':
                case 'a':
                    var name = command[2];
                    var url = command[3];

                    if (name && url)
                    {
                        var tags = [];
                        for (var i = 4; i < command.length; i++)
                        {
                            tags.push(command[i]);
                        }

                        c.findOne({name: name}).then(function(media_item)
                        {
                            if (media_item == null)
                            {
                                c.insertOne({
                                    name: name,
                                    url: url,
                                    tags: tags
                                }).then(function(result)
                                {
                                    db.close();
                                    session.broadcast('chatterbox', 'chat', {message: 'Media item '+name+' added.', username: 'Ryebrarian'}, {room_id: room_id});
                                });
                            }
                            else
                            {
                                db.close();
                                setTimeout(function()
                                {
                                    session.broadcast('chatterbox', 'chat', {message: 'A media item by that name already exists!', username: 'Ryebrarian'}, {room_id: room_id});
                                }, 100);
                            }
                        });
                    }
                break;
                case 'view':
                case 'v':
                    var name = command[2];

                    c.findOne({name: name}).then(function(media_item)
                    {
                        setTimeout(function()
                        {
                            if (media_item == null)
                            {
                                session.broadcast('chatterbox', 'chat', {message: 'Media item '+name+' does not exist.', username: 'Ryebrarian'}, {room_id: room_id});
                            }
                            else
                            {
                                session.broadcast('chatterbox', 'chat', {message: 'Media item '+name+':', username: 'Ryebrarian'}, {room_id: room_id});
                                session.broadcast('chatterbox', 'chat', {message: media_item.url, username: 'Ryebrarian'}, {room_id: room_id});
                            }
                        }, 100);
                        db.close();
                    });
                break;
                case 'random':
                case 'r':
                    var taglist = command.slice(2);
                    c.find({tags: {$all: taglist}}).toArray().then(function(mediabits)
                    {
                        if (mediabits.length)
                        {
                            var item = wuptil.choose(mediabits);
                            setTimeout(function()
                            {
                                session.broadcast('chatterbox', 'chat', {message: 'Media item '+item.name+':', username: 'Ryebrarian'}, {room_id: room_id});
                                session.broadcast('chatterbox', 'chat', {message: item.url, username: 'Ryebrarian'}, {room_id: room_id});
                            }, 100);
                        }
                    });
                break;
                case 'tags':
                case 't':
                    if (command[2])
                    {
                        var tag = command[2];
                        c.find({tags: tag}).toArray().then(function(results)
                        {
                            var message = results.reduce(function(prev, cur)
                            {
                                return prev + cur.name +'\t'+cur.url+'\n';
                            }, '');
                            
                            setTimeout(function()
                            {
                                session.broadcast('chatterbox', 'blargh', {message: message, username: 'Ryebrarian'}, {room_id: room_id, strip_entities: false});
                            },100);
                        });
                    }
                    else
                    {
                        // When JV fills the DB with millions of tags so he can crash the server with this command, it will still be Jesse's fault
                        c.find().toArray().then(function(results)
                        {
                            var tags = {};
                            results.forEach(function(item)
                            {
                                item.tags.forEach(function(tag)
                                {
                                    if (tags[tag] === undefined)
                                    {
                                        tags[tag] = 1;
                                    }
                                    else
                                    {
                                        tags[tag] += 1;
                                    }
                                });
                            });
                            
                            var message = Object.keys(tags).reduce(function(prev, cur) {
                                return prev + cur + '\t' + tags[cur] + '\n';
                            }, '');
                            
                            setTimeout(function()
                            {
                                session.broadcast('chatterbox', 'blargh', {message: message, username: 'Ryebrarian'}, {room_id: room_id, strip_entities: false});
                            }, 100);
                        });
                    }
                break;
            }
        });
    };
    return true;
}