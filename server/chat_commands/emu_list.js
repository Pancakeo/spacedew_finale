"use strict";

var emu_choices = [
    'Whew.',
    'You have to push your face into it.',
    'Holy cow!',
    'What a play!',
    'Nice one!',
    'This is for you.',
    'Incoming!',
    'Siiiiick!',
    'csaw',
    'Die.',
    'Die!',
    'Time to die.',
    'Great clear!',
    "It's funny, really",
    "BFBP",
    "GDOAT*",
    "HEH",
    "heh heh",
    "Does it... Does it say cheethos are not for your eyes?"
];

exports.contains = function(emu) {
    return emu_choices.indexOf(emu) >= 0;
};

exports.get = function() {
    var choices = [];
    emu_choices.sort(function(a, b) {
        return a.localeCompare(b);
    }).forEach(function(emu) {
        choices.push({
            text: emu
        })
    });

    return emu_choices;
};