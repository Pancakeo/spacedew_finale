var CHUNK_SIZE = 1024 * 1024; // 1mb.

exports.chunk = function(meta, buffer, chunk_callback) {

    var send_chunk = function(buffer, meta, start) {
        var transfer_info = {
            complete: false,
            username: meta.username,
            transfer_id: meta.transfer_id
        };

        if (start === 0) {
            transfer_info.debut = true;
        }

        if (start + CHUNK_SIZE >= buffer.length) {
            transfer_info.complete = true;
            transfer_info.file_info = meta;
            var chunk = buffer.slice(start);

            chunk_callback(transfer_info, chunk);
        }
        else {
            var chunk = buffer.slice(start, start + CHUNK_SIZE);
            chunk_callback(transfer_info, chunk);

            setTimeout(function() {
                send_chunk(buffer, meta, start + CHUNK_SIZE);
            }, 0);
        }
    };

    send_chunk(buffer, meta, 0);
};
