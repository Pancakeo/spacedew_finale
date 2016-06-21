module.exports = function() {
    var image_exts = ['png', 'gif', 'jpg', 'jpeg', 'bmp'];
    var image_regex = [];

    image_exts.forEach(function(ext) {
        image_regex.push('\.' + ext);
    });

    image_regex = new RegExp(image_regex.join('|'), 'i');
    // var youtube_regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var youtube_regex = /^.*?(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)(?:(\?t|&start)=(\d+))?.*/;

    var add_youtube = function(url) {
        var m = youtube_regex.exec(url);
        var video_id = null;

        if (m == null || m.length < 3) {
            return;
        }

        video_id = m[2];

        var start_time = '';
        if (m.length >= 4) {
            start_time = '?start=' + m[4];
        }

        var $div = $("<div class='youtube_wrapper'/>");
        var $frame = $('<iframe width="560" height="315" src="//www.youtube.com/embed/' + video_id + start_time + '" frameborder="0" allowfullscreen></iframe>');

        $div.append($frame);
        return $div;
    };

    return function(various_things) {
        var $link_box = $('<div class="link_box"/>');
        var $remove = $('<div class="remove">x</div>');
        $link_box.append($remove);

        various_things.forEach(function(thing) {

            if (image_regex.test(thing)) {
                var $image = $('<img src="' + thing + '"/>');
                $link_box.append($image);
            }
            else if (youtube_regex.test(thing)) {
                var $youtube = add_youtube(thing);
                $link_box.append($youtube);
            }
        });

        if ($link_box.find('img, iframe, video, audio').length > 0) {
            return $link_box;
        }
        else {
            return null;
        }
    }
};