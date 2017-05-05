// These things should be synced between the server and client!

let shared_config = {
    chat_port: 2001,
    binary_port: 2112,
    use_ssl: true
};

let override_stuff = {};

try {
    override_stuff = require('./shared_config_override');
}
catch (e) {
    // No overide.
}

shared_config = Object.assign({}, shared_config, override_stuff);
console.log("Shared config", shared_config);
module.exports = shared_config;