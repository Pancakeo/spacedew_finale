module.exports = function() {

    get_page('blargher', function(page) {

        var $dialog = page.$container.dialog({
            title: 'Blargher',
            width: 1200,
            height: 800,
            resizeable: true,
            modal: true,
            buttons: {
                'Send': function() {
                    var mess = $dialog.find('#blargher').val();
                    if (mess.length > 0) {
                        page.emit('send', {message: mess});
                    }

                    $(this).dialog('close');
                },
                'Cancel': function() {
                    $(this).dialog('close');
                }
            }
        });

    });

    return {};
};