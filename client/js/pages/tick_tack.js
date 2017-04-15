module.exports = function(options) {
    const room_id = app.toolio.get_query_param('room_id');
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
            message: {whew: true, room_id: room_id}
        })
    });

    app.register_window_listener('tick_tack', function(message) {
        console.log(message);
        alert(message.data.whewboy);
    });

    setInterval(function() {
        if (!window.opener || window.opener.closed) {
            alert('whew');
            window.close();
        }
    }, 100);

    return {};
};