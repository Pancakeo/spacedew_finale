module.exports = function() {

    get_page('dress_up', function(page) {

        page.$container.dialog({
            title: 'Dress Up',
            width: 'auto',
            resizeable: false,
            modal: true,
            buttons: {
                'Save': function() {
                    $(this).dialog('close');
                },
                'Reset': function() {
                    $(this).dialog('close');
                },
                'Cancel': function() {
                    $(this).dialog('close');
                }
            },
            open: function() {
                $(this).find('#font_name').selectmenu();
                $(this).find('#font_size').selectmenu();
            }
        });

    });

    return {};
};