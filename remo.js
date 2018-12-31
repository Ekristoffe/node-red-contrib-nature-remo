var Fs = require('fs');
var Request = require('request');
var URL_BASE = "https://api.nature.global/1/signals/";

async function set_timeout_promise(wait) {
    return new Promise(resolve => setTimeout(resolve, wait));
};

async function post_promise(options) {
    return new Promise((resolve, reject) => {
        Request.post(options, function(error, response, body) {
            if (error) {
	            reject(error);
            } else {
                resolve(body);
            }
        });
    });
};

async function post_signal_promise(token, signal_id) {
    var options = {
        url: URL_BASE + signal_id + "/send",
        headers: { "Authorization": "Bearer " + token }
    };
    return post_promise(options); 
};

async function post_command_promise(token, command) {
    if ("before_wait" in command) {
        await set_timeout_promise(command.before_wait);
    }
    await post_signal_promise(token, command.signal_id);
    if ("after_wait" in command) {
        await set_timeout_promise(command.after_wait);
    }
};

async function post_commands_promise(token, commands) {
    for (let command of commands) {
        await post_command_promise(token, command);
    }
};

function get_signal_id(json, nickname, name) {
    var signal_id = '';
    json.filter(function(appliance) {
        return appliance['nickname'] == nickname;
    }).forEach(function(appliance) {
        appliance['signals'].filter(function(signal) {
	        return signal['name'] == name;
	    }).forEach(function(signal) {
	        signal_id = signal['id'];
	    });
    })
    return signal_id;
};

function append_signal_ids(path, commands) {
    var contents = Fs.readFileSync(path, 'utf8');
    var json = JSON.parse(contents);
    return commands.map(function(command) {
        var signal_id = get_signal_id(json, command.nickname, command.name);
        command.signal_id = signal_id;
        return command;
    });
};

module.exports.set_timeout_promise = set_timeout_promise;
module.exports.post_promise = post_promise;
module.exports.post_signal_promise = post_signal_promise;
module.exports.post_command_promise = post_command_promise;
module.exports.post_commands_promise = post_commands_promise;
module.exports.get_signal_id = get_signal_id;
module.exports.append_signal_ids = append_signal_ids;
