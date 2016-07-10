module.exports = function() {

    get_page('emagine', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        $(window).on('resize', function() {
            var width = $(window).width() - 5;
            var height = $(window).height() - 10;
            page.$("#wup").attr({width: width, height: height});
        });

        window.moveTo(0, 0);
        if (window.outerHeight < screen.availHeight || window.outerWidth < screen.availWidth) {
            window.resizeTo(screen.availWidth, screen.availHeight);
        }
    });

    return {};
};