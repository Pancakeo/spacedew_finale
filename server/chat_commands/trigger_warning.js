var wuptil = require('../util/wuptil');

var triggers = {
    'jalapeno': {
        frequency: 1,
        triggers: [
            'push your face into it',
            "got that jalapeno",
            "do you have the puffs",
            "what flavor do you have"
        ],
        responses: [
            "You'll have to push your face into it",
            "It's got that jalapeno!",
            "Do you have the puffs?",
            "What flavor do you have?",
            "The only flavor left is Flamin' Hot.",
            "Does it say... Cheetos are not for your eyes?"
        ]
    },
    'jeb': {
        frequency: 1,
        triggers: [
            'is a mess',
            'is a big fat waste',
            'is a waste'
        ],
        responses: [
            '[AIR HORN]'
        ]
    },
    'csaw': {
        frequency: 1,
        triggers: [
            "it's funny, really",
        ],
        responses: [
            "I now believe that Satan has tricked me."
        ]
    },
    'ccsaw': {
        frequency: 1,
        triggers: [
            "satan has tricked me"        
        ],
        responses: [
            "It's funny, really."    
        ]
    },
    'lori': {
        frequency: 1,
        responder: 'LoriBakker',
        triggers: [
            'i was dying',
            'they were crying',
            'blood moons',
            'judgement is coming',
            'the collapse is coming',
            'get a shovel',
            'dig the latrine',
            'rice is hot',
            'look at the broccoli',
            "need some more food",
            'real broccoli',
            'shovel it with',
            'not a playhouse'
        ],
        responses: [
            'Wow.',
            'Wow.',
            'Wow.',
            'Wow.',
            'Wow.',
            'Wow.',
            "Wow, I love that.",
            "Wow, that's great.",
            "Wow, that's good.",
            "The flavor is amaaaazing",
            "He said it!",
            "Oh my goodness",
            "It's true! It's true!",
            "It's like non-stop going on.",
            "Yeah, you said that.",
            "Just so we could sleep for a few hours."
        ]
    }
    
}

var last_found = null;

exports.test = function(message)
{
    for (var key in triggers)
    {
        for (var i = 0; i < triggers[key].triggers.length; i++)
        {
            
            if (message.toLowerCase().indexOf(triggers[key].triggers[i]) != -1)
            {
                last_found = key;
                return true;
            }
        }
    }
    return false;
}

exports.exec = function(message, session, room_id)
{
    if (last_found !== null && Math.random() < triggers[last_found].frequency)
    {
        var response = wuptil.choose(triggers[last_found].responses);
        var responder = triggers[last_found].responder || '#TriggerWarning#';
        var delay = wuptil.random(200,500);
        
        setTimeout(function()
        {
            session.broadcast('chatterbox', 'chat', {message: response, username: responder}, {room_id: room_id});
        }, delay);
    }
    return true;
}