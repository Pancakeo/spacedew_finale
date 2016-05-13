module.exports = function($parent) {
    get_page('chatterbox', function(page) {
        $parent.append(page.$container);
        var $chat = page.$("#chat");

        page.listen('chat', function(data) {
            console.log(data);
            var $message = $('<div class="message"><span class="timestamp">[' + moment().format("h:mm:ss A") + ']</span><span class="username">' + data.username + ':</span>' + data.message + '</div>');
            $chat.append($message);

            $message[0].scrollIntoView();
        });

        page.$("#composer").on('keypress', function(e) {
            if (e.which === 13) {
                var message = $(this).val();

                if (message.length != null) {
                    page.send('chat', {message: message});
                }

                $(this).val('');
            }
        })
    });

    return {};
};