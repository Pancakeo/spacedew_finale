exports.exec = function(message, session, room_id)
{
    for (var module in modules)
    {
        if (modules[module].test(message))
        {
            return modules[module].exec(message, session, room_id);
        }
    }
    return true; // if we return false from exec the chat message will not be broadcast
};

var modules = {};

modules.trigger_warning = require('./trigger_warning');