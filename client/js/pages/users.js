module.exports = function($parent) {
    get_page('users', function(page) {
        $parent.append(page.$container);

        page.listen('users_list', function(data) {
            var $users = page.$("#users_list").empty();

            console.log(data.users);
            data.users.map(function(user) {
                var $user = $('<div class="user">' + user.username + '</div>');
                $users.append($user);
            });
            page.$("#users_list").append($users);
        });

        page.send('users_list', {});
    });
    
    return {};
};