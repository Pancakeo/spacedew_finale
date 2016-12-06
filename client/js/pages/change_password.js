module.exports = function() {

    get_page('change_password', function(page) {
        var $dialog = page.$container.dialog({
            title: 'Change Password',
            width: 400,
            resizable: false,
            modal: true,
            buttons: {
                'Change Password': function() {
                    var params = {
                        current_pw: page.$("#current_pw").val().trim(),
                        new_pw: page.$("#new_pw").val().trim(),
                        confirm_pw: page.$("#confirm_pw").val().trim()
                    };

                    if (params.current_pw.length == 0 || params.new_pw.length == 0 || params.confirm_pw.length == 0) {
                        page.alert("Whoops", "All fields must be filled in loldawg.");
                        return;
                    }

                    if (params.new_pw != params.confirm_pw) {
                        page.alert("Whoops", "New passwords don't match");
                        return;
                    }

                    page.ws.send('user_settings', 'change_password', params);
                },
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
            page.event_bus.on('user_settings.change_password', function(data) {
                if (data.success == true) {
                    $dialog.dialog('close');
                }
                else {
                    page.alert("Uh oh", data.reason);
                }
            });

        };

    });

    return {};
};