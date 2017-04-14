const watched_events = {};

exports.on = function(event_name, callback, instance_id) {
    let callbacks = watched_events[event_name];
    if (callbacks == null) {
        callbacks = [];
        watched_events[event_name] = callbacks;
    }

    let cb = {
        emit: callback,
        event_name: event_name
    };

    callbacks.push(cb);
    return cb;
};

exports.stop_listening = function(listeners) {
    for (let event_name in watched_events) {
        let callbacks = watched_events[event_name];

        for (let i = callbacks.length - 1; i >= 0; i--) {
            let cb = callbacks[i];

            if (listeners.includes(cb)) {
                callbacks.splice(i, 1);
            }
        }
    }
};

exports.emit = function(event_name, params) {
    params = Object.assign({}, params); // Ha, this breaks IE 11!

    let callbacks = watched_events[event_name];

    if (callbacks != null) {
        setTimeout(function() {
            callbacks.forEach(function(cb) {
                cb.emit(params);
            })
        }, 0);
    }
};