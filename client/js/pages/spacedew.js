module.exports = function(options) {
    options = $.extend({
        room_id: null
    }, options);

    let game = {};
    const room_id = options.room_id;

    get_page('spacedew', {popup: true}, function(page) {
        let $wait_dialog = $('<div>Waiting Is...</div>').dialog({
            title: "Waiting for other players...",
            modal: true
        });

        let $parent = $('body');
        $parent.append(page.$container);
        
    });

    return {};
};