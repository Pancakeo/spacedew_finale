module.exports = function() {
    var yownet = require('./yownet')();

    get_page('tick_tack', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);
    });

    return {};
};