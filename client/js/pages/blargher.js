module.exports = function() {

    get_page('blargher', function(page) {

        page.$container.dialog({
            title: 'Blargher',
            width: 'auto',
            resizeable: false,
            modal: true,
            buttons: {
                'Save': function() {
                    $(this).dialog('close');
                },
                'Cancel': function() {
                    $(this).dialog('close');
                }
            },
            open: function() {
                
            }
        });

    });

    return {};
};