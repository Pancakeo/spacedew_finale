module.exports = function() {

    get_page('farmer', function(page) {
        var $dialog = page.$container.dialog({
            title: 'Farmer',
            width: 400,
            resizable: false,
            modal: true,
            buttons: {

                'Cancel': function() {
                    $(this).dialog('close');
                }
            },
            open: function() {
                setTimeout(function() {
                    page.init();
                }, 0);
            }
        });

        page.init = function() {
            
        };

    });

    return {};
};