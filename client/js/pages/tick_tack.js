module.exports = function(options) {
    const game_id = app.toolio.get_query_param('game_id');
    const postMessage = function(data) {
        window.opener.postMessage(data, app.domain);
    };

    get_page('tick_tack', function(page) {
        var $parent = $('body');
        $parent.append(page.$container);

        postMessage({
            listener_name: 'ws.send',
            type: page.page_name,
            sub_type: 'whew',
            message: {whew: true}
        })
    });

    app.register_window_listener('tick_tack', function(data) {
        console.log(data);
    });

    setInterval(function() {
        if (!window.opener || window.opener.closed) {
            alert('whew');
            window.close();
        }
    }, 100);

    return {};
};