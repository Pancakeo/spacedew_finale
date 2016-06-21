module.exports = function() {
    var image_exts = ['png', 'gif', 'jpg', 'jpeg', 'bmp'];
    var image_regex = [];

    image_exts.forEach(function(ext) {
        image_regex.push('\.' + ext);
    });

    image_regex = new RegExp(image_regex.join('|'), 'i');

    return function(various_things) {
        var $link_box = $('<div class="link_box"/>');
        var $remove = $('<div class="remove">x</div>');
        $link_box.append($remove);

        various_things.forEach(function(thing) {
            if (image_regex.test(thing)) {
                var $image = $('<img src="' + thing + '"/>');
                $link_box.append($image);
            }
        });

        if ($link_box.children('img, iframe, video, audio').length > 0) {
            return $link_box;
        }
        else {
            return null;
        }
    }
};