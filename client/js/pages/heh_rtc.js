module.exports = function(options) {
    options = $.extend({
        host: false
    }, options);

    const config = {
        iceServers: [
            {"url": "stun:stun.l.google.com:19302"},
            {"url": "stun:stun1.l.google.com:19302"},
            {"url": "stun:stun2.l.google.com:19302"},
            {"url": "stun:stun3.l.google.com:19302"},
            {"url": "stun:stun4.l.google.com:19302"}
        ]
    };

    console.log('rtc', options);

    const client_id = app.toolio.generate_id();

    const send = function(sub_type, data) {
        data = $.extend({
            client_id: client_id
        }, data);

        app.ws.send('heh_rtc', sub_type, data);
    };

    send('set_client_id', {client_id: client_id});

    let peer;

    let peer_o_matic = function() {
        peer = new RTCPeerConnection();
        app.rtc_peer = peer;

        if (options.host) {
            // UDP:
            // let data_channel = peer.createDataChannel("woboy", {ordered: false, maxRetransmits: 0});
            let data_channel = peer.createDataChannel("woboy", {});

            peer.oniceconnectionstatechange = event => {
                console.log('Ice state change', event);

                if (event.target.iceConnectionState == "failed") {
                    console.log('woboy, failed');
                }
            };


            peer.ondatachannel = (event) => {
                app.append_system('Er...', event);
            };

            setInterval(function() {
                if (data_channel.readyState == 'open') {
                    data_channel.send('Whew.');
                }
            }, 1700);

            data_channel.onerror = function(error) {
                console.log("Data Channel Error:", error);
            };

            data_channel.onopen = function(event) {
                app.append_system('Woooboy! (el data) HEH...');
                console.log('howdy', event);
            };

            data_channel.onclose = function(event) {
                console.log('closed', event);
            };

            data_channel.onmessage = function(wup) {
                app.append_system('RTC Chat: ' + wup.data);
            };

            peer.createOffer()
                .then(offer => peer.setLocalDescription(offer))
        }
        else {
            peer.ondatachannel = (event) => {
                app.append_system('Woooboy!');

                event.channel.onopen = function() {
                    app.append_system('Woooboy! (el data) HEH...');
                    event.channel.send('Ok.');
                    event.channel.send('No problem.');
                };

                event.channel.onmessage = function(message) {
                    app.append_system('RTC Chat: ' + message.data);
                    setTimeout(function() {
                        event.channel.send('No problem.');
                    }, 100);

                }
            };
        }

        peer.onicecandidate = (ice) => {
            if (ice.candidate && !ice.candidate.candidate.includes('192.168')) {
                console.log('send add_ice', ice);
                send('add_ice', {candidate: ice.candidate.toJSON(), description: peer.localDescription.toJSON()});
            }
        };

    };

    app.event_bus.on('heh_rtc.college_try', function() {
        if (peer) {
            peer.close();
        }

        peer_o_matic();
    });

    app.event_bus.on('heh_rtc.add_ice', function(data) {
        if (data.client_id == client_id) {
            return;
        }

        console.log('add_ice', data);
        peer.setRemoteDescription(new RTCSessionDescription(data.description));

        if (!options.host) {
            peer.createAnswer()
                .then(answer => peer.setLocalDescription(answer));

        }

        peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

};
