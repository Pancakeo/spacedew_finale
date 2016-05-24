module.exports = (function() {
    "use strict";
    var toolio = {};

    toolio.alert = function(title, message) {
        $('<div>' + message + '</div>').dialog({
            title: title,
            modal: true
        });
    };

    toolio.generate_id = function() {
        var d = Date.now();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
    };

    toolio.array_to_list = function(arr) {
        if (arr == null) {
            throw "Null array";
        }

        if (arr.length === 0) {
            return "(none)";
        }

        var nice_array = "<ol>";

        for (var i = 0; i < arr.length; i++) {
            nice_array += "<li>" + arr[i] + "</li>";
        }

        nice_array += "</ol>";
        return nice_array;
    };

    /* Fixed arrays are of a constant size and also don't accept duplicates. */
    toolio.push_to_fixed_array = function(arr, value, max_size) {
        if (max_size == null) {
            max_size = 10;
        }

        if (arr == null) {
            throw "Null array";
        }
        if (max_size <= 0) {
            throw "Max size <= 0";
        }

        // don't add again.
        if (arr.indexOf(value) >= 0) {
            return;
        }

        while (arr.length >= max_size) {
            arr.shift();
        }

        arr.push(value);
    };

    toolio.copy_object = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    toolio.string_to_array_buffer = function(str) {
        var buf = new ArrayBuffer(str.length * 2);
        var buf_view = new DataView(buf);

        for (var i = 0; i < str.length; i++) {
            buf_view.setUint16(i * 2, str.charCodeAt(i), true);
        }

        return buf;
    };

    toolio.blob_from_buffer = function(buffer, meta) {
        var header = toolio.string_to_array_buffer(JSON.stringify(meta));

        var header_length = new ArrayBuffer(4);    // 4 bytes = 32-bits.
        new DataView(header_length).setUint32(0, header.byteLength, true); // explicit little endian

        return new Blob([header_length, header, buffer]); // roll it up
    };

    toolio.array_buffer_to_string = function(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    };

    return toolio;
})();

