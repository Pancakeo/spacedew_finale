module.exports = function() {
    var image_exts = ['png', 'gif', 'jpg', 'jpeg', 'bmp'];
    var video_exts = ['mp4', 'webm', 'gifv'];
    var image_regex = [];
    var video_regex = [];

    // These are terrible:
    image_exts.forEach(function(ext) {
        image_regex.push('\.' + ext + '\\??.*$');
    });

    video_exts.forEach(function(ext) {
        video_regex.push('\.' + ext + '\\??.*$');
    });
    // </terrible>

    image_regex = new RegExp(image_regex.join('|'), 'i');
    video_regex = new RegExp(video_regex.join('|'), 'i');

    // var youtube_regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var youtube_parser = /^.*?(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*)(?:(\?t|&start|&t)=(\d+))?.*/;
    var probably_youtube = /.*youtube.*|.*youtu\.be.*/i;

    var add_youtube = function(url) {
        var m = youtube_parser.exec(url);
        var video_id = null;

        if (m == null || m.length < 3) {
            return;
        }

        video_id = m[2];

        var start_time = '';
        if (m.length >= 4 && m[4] != null) {
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

            if (probably_youtube.test(thing)) {
                var $youtube = add_youtube(thing);
                $link_box.append($youtube);
            }
            else if (video_regex.test(thing)) {

                if (thing.match(/\.gifv|\.webm/i)) {
                    thing = thing.replace(/(\.gifv)/i, '.mp4');
                    thing = thing.replace(/(\.webm)/i, '.mp4');
                }

                var $video = $('<video style="max-width: 100%;" controls autoplay="true"/>');
                $video[0].muted = true;
                $video.append('<source src="' + thing + '">');
                $link_box.append($video);
            }
            else if (image_regex.test(thing)) {
                var $image = $('<img src="' + thing + '"/>');
                $link_box.append($image);
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