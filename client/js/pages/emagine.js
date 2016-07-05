module.exports = function() {

    get_page('emagine', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);
    });

    return {};
};