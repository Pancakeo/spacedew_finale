"use strict";

var emu_choices = [
    'Whew.',
    'You have to push your face into it.',
    'Holy cow!',
    'What a play!',
    'Nice one!',
    'This is for you.',
    'Incoming!',
    'Siiiick!',
    'csaw',
    'Great clear!',
    "It's funny, really.",
    "BFBP",
    "GDOAT*",
    "HEH",
    "heh heh",
    "Does it... Does it say cheethos are not for your eyes?",
    "All yours.",
    "Calculated.",
    "Go for it!",
    "In position.",
    "My bad...",
    "My fault.",
    "Need boost!",
    "Nice block!",
    "No way!",
    "Okay.",
    "Oops!",
    "Savage!",
    "Run.",
    "Wait.",
    "Go!",
    "Sorry.",
    "Bye.",
    "Follow me.",
    "Thanks!",
    'Die.',
    'Die!',
    'Time to die.'
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