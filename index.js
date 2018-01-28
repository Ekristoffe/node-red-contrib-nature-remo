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
    return  signal_ids.reduce(function(p, signal_id) {
        return p.then(function() {
            return post_signal_promise(token, signal_id)
                .then(function() {
	            return setTimeoutPromise(delay);
                });
        });
    }, Promise.resolve());
}

function get_signal_id(json, nickname, name) {
    var signal_id = '';
    for (var i=0; i<json.length; i++) {
         if (json[i]['nickname'] != nickname) {
             continue;
         }
         for(var j=0; j<json[i]['signals'].length; j++) {
             if (json[i]['signals'][j]['name'] == name) {
                 signal_id = json[i]['signals'][j]['id'];
             }
         }
    }
    return signal_id
}

function get_signal_ids(appliances, commands) {
    var file = Fs.readFileSync(appliances, 'utf8');
    var json = JSON.parse(file);

    var signal_ids = [];
    for(var i=0; i<commands.length; i++) {
        var command = commands[i];
        var signal_id = get_signal_id(json, command.nickname, command.name);
        signal_ids.push(signal_id);
    }
    return signal_ids;
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
