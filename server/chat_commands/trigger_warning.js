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
            "satan has tricked me"
        ],
        responses: [
            "It's funny, really.",
            "I now believe that Satan has tricked me."
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
        var response = triggers[last_found].responses[Math.floor(Math.random() * triggers[last_found].responses.length)];
        setTimeout(function()
        {
            session.broadcast('chatterbox', 'chat', {message: response, username: '#TriggerWarning#'}, {room_id: room_id});
        }, 0);
    }
    return true;
}