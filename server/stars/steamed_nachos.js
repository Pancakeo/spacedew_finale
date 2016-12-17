// Whoops, steam bullshit.
var openid = require('openid');
var url = require('url');
var querystring = require('querystring');
var event_bus = require(app.shared_root + '/event_bus');
const STEAM_OPENID_URL = "http://steamcommunity.com/openid";

if (!app.config.server_url) {
    throw "server_url must be set in conf/server_config.json";
}

var relyingParty = new openid.RelyingParty(
    app.config.server_url + '/steam_verify',
    app.config.server_url, // Realm (optional, specifies realm for OpenID authentication)
    true, // Use stateless verification
    false, // Strict mode
    []); // List of extensions to enable and include


exports.auth = function(req, res) {
    var parsedUrl = url.parse(req.url, true);

    var auth_key = parsedUrl.query.auth_key;
    if (!auth_key) {
        res.writeHead(200);
        res.end("Missing auth_key");
    }

    // Resolve identifier, associate, and build authentication URL
    relyingParty.authenticate(STEAM_OPENID_URL, false, function(error, authUrl) {
        if (error || !authUrl) {
            res.writeHead(200);
            res.end("Uh oh, something went wrong.");
        }
        else {
            // Auth key allows
            var parsedAuthUrl = url.parse(authUrl);
            var modified_query_string = querystring.parse(parsedAuthUrl.query);
            modified_query_string['openid.return_to'] += '?rye_key=' + auth_key;

            var redirect_location = url.parse(authUrl);
            redirect_location.search = querystring.stringify(modified_query_string);
            redirect_location = url.format(redirect_location);

            res.writeHead(302, {Location: redirect_location});
            res.end();
        }
    });
};

exports.verify = function(req, res) {
    var parsedUrl = url.parse(req.url, true);

    relyingParty.verifyAssertion(req, function(error, result) {
        res.writeHead(200);

        if (error) {
            res.end("Something went terribly wrong");
            return;
        }

        var auth_key = parsedUrl.query.rye_key;
        if (!auth_key) {
            res.end('Uh oh');
        }

        res.writeHead(200);
        var user_id_regex = new RegExp('.*/openid/id/(.*)');
        var matches = user_id_regex.exec(result.claimedIdentifier);

        if (matches.length == 2 && result.authenticated) {
            var steam_id = matches[1];
            var good_stuff = {
                steam_id: steam_id,
                auth_key: auth_key
            };

            event_bus.emit('steam_openid.verify', good_stuff);
            res.end(JSON.stringify(good_stuff));
        }
        else {
            res.end("Something went terribly wrong");
        }
    });
};