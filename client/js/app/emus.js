module.exports = (function() {
    "use strict";
    var emus = {};

    var NUMPAD_ZERO = 96;
    var NUMPAD_ONE = 97;
    var NUMPAD_TWO = 98;
    var NUMPAD_THREE = 99;
    var NUMPAD_FOUR = 100;
    var NUMPAD_FIVE = 101;
    var NUMPAD_SIX = 102;
    var NUMPAD_SEVEN = 103;
    var NUMPAD_EIGHT = 104;
    var NUMPAD_NINE = 105;

    var handlers = {};
    handlers[NUMPAD_ZERO] = {
        team: true,
        text: 'Whew.'
    };

    handlers[NUMPAD_ONE] = {
        text: 'Whew.'
    };

    handlers[NUMPAD_TWO] = {
        text: 'You have to push your face into it.'
    };

    handlers[NUMPAD_THREE] = {
        text: 'Holy cow!'
    };

    handlers[NUMPAD_FOUR] = {
        text: 'What a play!'
    };

    handlers[NUMPAD_FIVE] = {
        text: 'Nice one!'
    };

    handlers[NUMPAD_SIX] = {
        text: 'This is for you.'
    };

    handlers[NUMPAD_SEVEN] = {
        text: 'Incoming!'
    };

    handlers[NUMPAD_EIGHT] = {
        text: 'Siiiiiiiick!'
    };

    handlers[NUMPAD_NINE] = {
        text: 'csaw'
    };

    emus.handle_key = function(key_code) {

        if (handlers[key_code] != null) {
            return handlers[key_code];
        }
    };

    return emus;
});