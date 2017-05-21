// These things should be synced between the server and client!

let shared_config = {
    chat_port: 2001,
    binary_port: 2112,
    use_ssl: true
};

// Put things that you want to set locally, but don't want to check-in remotely, in:
// shared/shared_config_override.js
// Which would then have the format of:
// module.exports = {
//     use_ssl: false
// };

let override_stuff = {};

try {
    // override_stuff = require('./shared_config_override');
}
catch (e) {
    // No overide.
}

shared_config = Object.assign({}, shared_config, override_stuff);
// console.log("Shared config", shared_config);
module.exports = shared_config;