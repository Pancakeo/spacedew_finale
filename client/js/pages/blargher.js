import '../../less/blargher.less';

export default function(initial_text) {

    get_page('blargher', function(page) {

        var $dialog = page.$container.dialog({
            title: 'Blargher',
            width: 1200,
            height: Math.min(800, $(window).height() - 50),
            resizeable: true,
            modal: true,
            open: function() {
                if (initial_text != null) {
                    $(this).find('#blargher').val(initial_text);
                }
            },
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