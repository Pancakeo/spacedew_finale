module.exports = function() {

    get_page('tick_tack', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);
    });

    return {};
};