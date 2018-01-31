var Fs = require('fs');
var Request = require('request');

function setTimeoutPromise(delay) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, delay);
    });
}

function post_signal_promise(token, signal_id) {
    var options = {
        url: "https://api.nature.global/1/signals/" + signal_id + "/send",
        headers: { "Authorization": "Bearer " + token }
    };
    return new Promise(function(resolve, reject) {
        Request.post(options, function(error, response, body) {
            if (error) {
                console.error('POST failed:', error);
	        reject(error);
            } else {
                resolve();
            }
        });
    });
}

function post_signals_promise(token, signal_ids, delay) {
    return new Promise(function(resolve, reject) {
        var p = post_signal_promise(token, signal_ids[0]);
	signal_ids.slice(1).forEach(function(signal_id) {
	    p = p.then(() => setTimeoutPromise(delay));
	    p = p.then(() => post_signal_promise(token, signal_id));
        });
        p.then(() => resolve());
    });
}

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
    return signal_id
}

function get_signal_ids(appliances, commands) {
    var file = Fs.readFileSync(appliances, 'utf8');
    var json = JSON.parse(file);
    return  commands.map(function(command) {
        return get_signal_id(json, command.nickname, command.name);
    });
}

module.exports = function(RED) {
    function NatureTokenNode(config) {
	RED.nodes.createNode(this, config);
    }
	
    RED.nodes.registerType('nature-token', NatureTokenNode, { credentials: { token: { type: "text" }}});

    function NatureRemoNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
	    var signal_ids = get_signal_ids(config.appliances, msg.payload.commands);
            var token = RED.nodes.getNode(config.token).credentials.token;
	    post_signals_promise(token, signal_ids, config.delay)
	        .then(function() {
		    msg.payload = "done";
		    node.send(msg);
                }).catch(function(error) {
	            node.error("HTTP error" + error);
	        });
        });
    }

    RED.nodes.registerType("nature-remo", NatureRemoNode);
}
