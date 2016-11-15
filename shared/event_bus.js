var watched_events = {};

exports.on = function(event_name, callback) {

    var callbacks = watched_events[event_name];
    if (callbacks == null) {
        callbacks = [];
        watched_events[event_name] = callbacks;
    }

    callbacks.push({
        emit: callback
    })
};

exports.emit = function(event_name, params) {
    params = Object.assign({}, params); // Ha, this breaks IE 11!

    var callbacks = watched_events[event_name];

    if (callbacks != null) {
        setTimeout(function() {
            callbacks.forEach(function(cb) {
                cb.emit(params);
            })
        }, 0);
    }
};